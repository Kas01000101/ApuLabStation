import * as THREE from 'three';
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { ThreeAssetManager } from './assets/ThreeAssetManager';
import { CAMERA_PRESETS, type CameraPresetName } from './core/CameraPresets';
import { ThreeDisposer } from './core/ThreeDisposer';
import type { ThreeCameraPose, ThreeModelConfig, ThreeObjectLifecycle } from './core/ThreeRuntimeTypes';
import { LightingRig, type LightingPreset } from './environment/LightingRig';

interface LoadedModel {
  object: THREE.Object3D;
  mixer?: THREE.AnimationMixer;
  config: ThreeModelConfig;
  entryStart: number;
  entryDuration: number;
  lifecycle?: ThreeObjectLifecycle;
}

const CAMERA_CONFIG = {
  fov: 32,
  near: 0.1,
  far: 100,
  position: CAMERA_PRESETS.hub.position,
  target: CAMERA_PRESETS.hub.target
} as const;

const ENTRY_DURATION_SECONDS = 1.55;
const MAX_PIXEL_RATIO = 2;

export class ThreeOverlay {
  private readonly container: HTMLElement;
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.PerspectiveCamera(CAMERA_CONFIG.fov, 16 / 9, CAMERA_CONFIG.near, CAMERA_CONFIG.far);
  private readonly renderer: THREE.WebGLRenderer;
  private readonly assetManager = new ThreeAssetManager();
  private readonly lightingRig: LightingRig;
  private readonly clock = new THREE.Clock();
  private readonly disposer = new ThreeDisposer();
  private readonly loadedModels: LoadedModel[] = [];
  private readonly target = new THREE.Vector3(CAMERA_CONFIG.target.x, CAMERA_CONFIG.target.y, CAMERA_CONFIG.target.z);
  private cameraTween?: {
    fromPosition: THREE.Vector3;
    toPosition: THREE.Vector3;
    fromTarget: THREE.Vector3;
    toTarget: THREE.Vector3;
    startedAt: number;
    duration: number;
  };
  private resizeObserver?: ResizeObserver;
  private animationFrameId = 0;
  private isDestroyed = false;
  private dragTarget?: ThreeObjectLifecycle;
  private isDraggingModel = false;
  private lastPointerX = 0;
  private lastPointerY = 0;

  constructor(container: HTMLElement) {
    this.container = container;
    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true
    });

    this.renderer.setClearColor(0x000000, 0);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.14;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const canvas = this.renderer.domElement;
    canvas.style.position = 'absolute';
    canvas.style.inset = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.background = 'transparent';
    canvas.style.zIndex = '2';

    this.camera.position.set(CAMERA_CONFIG.position.x, CAMERA_CONFIG.position.y, CAMERA_CONFIG.position.z);
    this.camera.lookAt(this.target);

    this.lightingRig = new LightingRig(this.scene);
    this.bindPresentationInteraction();
    this.container.appendChild(canvas);
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(this.container);
    this.resize();
  }

  start(): void {
    if (this.isDestroyed || this.animationFrameId !== 0) return;
    this.clock.start();
    this.animate();
  }

  getScene(): THREE.Scene {
    return this.scene;
  }

  getCamera(): THREE.PerspectiveCamera {
    return this.camera;
  }

  getContainer(): HTMLElement {
    return this.container;
  }

  getAssetManager(): ThreeAssetManager {
    return this.assetManager;
  }

  setCameraPose(pose: ThreeCameraPose, durationSeconds = 0): void {
    if ('fov' in pose && typeof pose.fov === 'number') {
      this.camera.fov = pose.fov;
      this.camera.updateProjectionMatrix();
    }

    const toPosition = new THREE.Vector3(pose.position.x, pose.position.y, pose.position.z);
    const toTarget = new THREE.Vector3(pose.target.x, pose.target.y, pose.target.z);

    if (durationSeconds <= 0) {
      this.camera.position.copy(toPosition);
      this.target.copy(toTarget);
      this.camera.lookAt(this.target);
      return;
    }

    this.cameraTween = {
      fromPosition: this.camera.position.clone(),
      toPosition,
      fromTarget: this.target.clone(),
      toTarget,
      startedAt: this.clock.getElapsedTime(),
      duration: durationSeconds
    };
  }

  applyCameraPreset(preset: CameraPresetName, durationSeconds = 0): void {
    this.setCameraPose(CAMERA_PRESETS[preset], durationSeconds);
  }

  applyLightingPreset(preset: LightingPreset): void {
    this.lightingRig.applyPreset(preset);
  }

  setOutlinedObjects(objects: THREE.Object3D[]): void {
    void objects;
  }

  getRendererInfo(): THREE.WebGLInfo {
    return this.renderer.info;
  }

  getPostProcessingPassCount(): number {
    return 0;
  }

  async loadModel(config: ThreeModelConfig): Promise<THREE.Object3D> {
    const instance = await this.assetManager.loadModelInstance(config.url);
    const model = instance.scene;

    const mixer = instance.animations.length > 0 ? new THREE.AnimationMixer(model) : undefined;
    if (mixer) {
      const clip = this.selectIdleClip(instance.animations);
      mixer.clipAction(clip).play();
    }

    return this.addObject(config, model, mixer);
  }

  loadGLTF(url: string): Promise<GLTF> {
    return this.assetManager.loadGLTF(url);
  }

  loadModelInstance(url: string): Promise<THREE.Object3D> {
    return this.assetManager.loadModelInstance(url).then((instance) => instance.scene);
  }

  addObject(config: ThreeModelConfig, object: THREE.Object3D, mixer?: THREE.AnimationMixer, lifecycle?: ThreeObjectLifecycle): THREE.Object3D {
    const startPosition = config.entryFrom || config.position;

    object.name = config.id;
    object.position.set(startPosition.x, startPosition.y, startPosition.z);
    object.rotation.set(config.rotation.x, config.rotation.y, config.rotation.z);
    object.scale.setScalar(config.scale);

    object.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.castShadow = mesh.castShadow || config.id !== 'hopper';
      mesh.receiveShadow = mesh.receiveShadow || mesh.name.toLowerCase().includes('worksurface');
    });

    this.scene.add(object);
    this.loadedModels.push({
      object,
      mixer,
      config,
      entryStart: this.clock.getElapsedTime(),
      entryDuration: ENTRY_DURATION_SECONDS,
      lifecycle
    });

    return object;
  }

  removeObject(id: string): void {
    const index = this.loadedModels.findIndex((model) => model.config.id === id);
    if (index < 0) return;

    const [model] = this.loadedModels.splice(index, 1);
    model.mixer?.stopAllAction();
    if (model.lifecycle?.dispose) {
      model.lifecycle.dispose();
    } else {
      this.disposer.disposeObject(model.object);
    }
    this.scene.remove(model.object);
  }

  resize(): void {
    if (this.isDestroyed) return;

    const bounds = this.container.getBoundingClientRect();
    const width = Math.max(1, Math.round(bounds.width));
    const height = Math.max(1, Math.round(bounds.height));

    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO));
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  destroy(): void {
    if (this.isDestroyed) return;
    this.isDestroyed = true;

    if (this.animationFrameId !== 0) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = 0;
    }

    this.resizeObserver?.disconnect();
    this.resizeObserver = undefined;
    this.unbindPresentationInteraction();

    this.loadedModels.forEach(({ object, mixer, lifecycle }) => {
      mixer?.stopAllAction();
      if (lifecycle?.dispose) {
        lifecycle.dispose();
      } else {
        this.disposer.disposeObject(object);
      }
      this.scene.remove(object);
    });
    this.loadedModels.length = 0;

    this.lightingRig.dispose();
    this.renderer.dispose();
    this.assetManager.dispose();
    this.renderer.domElement.remove();
  }

  private bindPresentationInteraction(): void {
    this.container.addEventListener('pointerdown', this.handlePointerDown);
    window.addEventListener('pointermove', this.handlePointerMove);
    window.addEventListener('pointerup', this.handlePointerUp);
    window.addEventListener('pointercancel', this.handlePointerUp);
  }

  private unbindPresentationInteraction(): void {
    this.container.removeEventListener('pointerdown', this.handlePointerDown);
    window.removeEventListener('pointermove', this.handlePointerMove);
    window.removeEventListener('pointerup', this.handlePointerUp);
    window.removeEventListener('pointercancel', this.handlePointerUp);
  }

  private animate = (): void => {
    if (this.isDestroyed) return;

    this.animationFrameId = requestAnimationFrame(this.animate);
    const delta = this.clock.getDelta();
    const elapsed = this.clock.getElapsedTime();

    this.updateCameraTween(elapsed);

    this.loadedModels.forEach((model) => {
      model.mixer?.update(delta);
      this.updateEntry(model, elapsed);
      this.updateIdle(model, elapsed);
      model.lifecycle?.update?.(delta, elapsed, elapsed - model.entryStart);
    });

    this.renderer.render(this.scene, this.camera);
  };

  private updateCameraTween(elapsed: number): void {
    if (!this.cameraTween) return;

    const progress = Math.min((elapsed - this.cameraTween.startedAt) / this.cameraTween.duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    this.camera.position.lerpVectors(this.cameraTween.fromPosition, this.cameraTween.toPosition, eased);
    this.target.lerpVectors(this.cameraTween.fromTarget, this.cameraTween.toTarget, eased);
    this.camera.lookAt(this.target);

    if (progress >= 1) this.cameraTween = undefined;
  }

  private updateEntry(model: LoadedModel, elapsed: number): void {
    if (!model.config.entryFrom) return;

    const progress = Math.min((elapsed - model.entryStart) / model.entryDuration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const from = model.config.entryFrom;
    const to = model.config.position;

    model.object.position.set(
      THREE.MathUtils.lerp(from.x, to.x, eased),
      THREE.MathUtils.lerp(from.y, to.y, eased),
      THREE.MathUtils.lerp(from.z, to.z, eased)
    );
  }

  private updateIdle(model: LoadedModel, elapsed: number): void {
    const settled = elapsed - model.entryStart > model.entryDuration;
    if (!settled) return;

    if (model.config.id === 'kawsay_1' && model.config.idle === 'rover') {
      model.object.rotation.y = model.config.rotation.y + Math.sin(elapsed * 0.85) * 0.025;
    }

    if (model.config.id === 'hopper') {
      model.object.rotation.y = model.config.rotation.y + Math.sin(elapsed * 0.7) * 0.018;
    }
  }

  private handlePointerDown = (event: PointerEvent): void => {
    const bounds = this.container.getBoundingClientRect();
    const localX = event.clientX - bounds.left;
    const localY = event.clientY - bounds.top;
    const inRoverBand =
      localX > bounds.width * 0.24 &&
      localX < bounds.width * 0.76 &&
      localY > bounds.height * 0.16 &&
      localY < bounds.height * 0.68;

    const rover = this.loadedModels.find((model) => model.config.id === 'kawsay_1' && model.object.visible && model.lifecycle?.handlePointerDrag);
    if (!inRoverBand || !rover?.lifecycle) return;

    this.dragTarget = rover.lifecycle;
    this.isDraggingModel = true;
    this.lastPointerX = event.clientX;
    this.lastPointerY = event.clientY;
  };

  private handlePointerMove = (event: PointerEvent): void => {
    if (!this.isDraggingModel || !this.dragTarget?.handlePointerDrag) return;

    const deltaX = event.clientX - this.lastPointerX;
    const deltaY = event.clientY - this.lastPointerY;
    this.lastPointerX = event.clientX;
    this.lastPointerY = event.clientY;
    this.dragTarget.handlePointerDrag(deltaX, deltaY);
  };

  private handlePointerUp = (): void => {
    if (!this.isDraggingModel) return;

    this.isDraggingModel = false;
    this.dragTarget?.handlePointerRelease?.();
    this.dragTarget = undefined;
  };

  private selectIdleClip(clips: THREE.AnimationClip[]): THREE.AnimationClip {
    const preferredNames = ['Idle', 'Breathing', 'Look', 'Wave'];
    const preferred = clips.find((clip) => preferredNames.some((name) => clip.name.toLowerCase().includes(name.toLowerCase())));
    return preferred || clips[0];
  }

}
