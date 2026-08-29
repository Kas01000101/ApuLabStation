import * as THREE from 'three';
import { THREE_ASSETS } from '../assets/AssetManifest';
import type { ThreeAssetManager } from '../assets/ThreeAssetManager';
import { ThreeDisposer } from '../core/ThreeDisposer';
const DISPLAY_WIDTH = 256;
const DISPLAY_HEIGHT = 128;
const TARGET_MODEL_LENGTH = 1.18;

export interface MultimeterVisualInspection {
  originalBox: {
    min: THREE.Vector3;
    max: THREE.Vector3;
  };
  originalSize: THREE.Vector3;
  scale: number;
  nodeNames: string[];
}

export class MultimeterVisual {
  readonly object = new THREE.Group();
  private readonly disposer = new ThreeDisposer();
  private readonly displayCanvas = document.createElement('canvas');
  private readonly displayTexture: THREE.CanvasTexture;
  private readonly displayMaterial: THREE.MeshBasicMaterial;
  private readonly displayPlane: THREE.Mesh;
  private readonly kickstandMaterial = new THREE.MeshStandardMaterial({
    color: 0x111317,
    roughness: 0.72,
    metalness: 0.06
  });
  private readonly kickstand: THREE.Mesh;
  private model?: THREE.Object3D;
  private displayText = '0.00 V';
  private disposed = false;
  inspection?: MultimeterVisualInspection;

  constructor(private readonly assetManager: ThreeAssetManager) {
    this.object.name = 'ApuLabMultimeterRealVisual';
    this.displayCanvas.width = DISPLAY_WIDTH;
    this.displayCanvas.height = DISPLAY_HEIGHT;
    this.displayTexture = new THREE.CanvasTexture(this.displayCanvas);
    this.displayTexture.colorSpace = THREE.SRGBColorSpace;
    this.displayMaterial = new THREE.MeshBasicMaterial({
      map: this.displayTexture,
      toneMapped: false,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2,
      side: THREE.DoubleSide
    });
    this.displayPlane = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.2), this.displayMaterial);
    this.displayPlane.name = 'MultimeterDynamicLcdOverlay';
    this.displayPlane.renderOrder = 12;
    this.displayPlane.visible = false;
    this.object.add(this.displayPlane);
    this.kickstand = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.72, 0.045), this.kickstandMaterial);
    this.kickstand.name = 'MultimeterProceduralRearKickstand';
    this.kickstand.position.set(0, -0.3, -0.24);
    this.kickstand.rotation.x = THREE.MathUtils.degToRad(-14);
    this.object.add(this.kickstand);
    this.setDisplay(this.displayText);
  }

  async load(): Promise<void> {
    const instance = await this.assetManager.loadModelInstance(THREE_ASSETS.multimeter);
    if (this.disposed) {
      this.disposer.disposeObject(instance.scene);
      return;
    }

    this.model = instance.scene;
    this.model.name = 'MultimeterRealGLB';

    const originalBox = new THREE.Box3().setFromObject(this.model);
    const originalSize = originalBox.getSize(new THREE.Vector3());
    const originalCenter = originalBox.getCenter(new THREE.Vector3());
    const scale = TARGET_MODEL_LENGTH / Math.max(originalSize.z, 0.001);

    this.model.position.sub(originalCenter);
    this.model.position.y -= originalBox.min.y - originalCenter.y;
    this.model.scale.setScalar(scale);

    this.model.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (child.name === 'multimeterpointe_low' || child.name === 'multimeterwireREPLACE') {
        child.visible = false;
      }
      if (!mesh.isMesh) return;
      mesh.castShadow = false;
      mesh.receiveShadow = false;
    });

    this.object.add(this.model);
    this.inspectDisplaySurface();
    this.inspection = {
      originalBox: {
        min: originalBox.min.clone(),
        max: originalBox.max.clone()
      },
      originalSize: originalSize.clone(),
      scale,
      nodeNames: this.collectNodeNames()
    };
  }

  setDisplay(text: string): void {
    this.displayText = text;
    const ctx = this.displayCanvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, DISPLAY_WIDTH, DISPLAY_HEIGHT);
    ctx.fillStyle = '#B8C6A7';
    ctx.fillRect(0, 0, DISPLAY_WIDTH, DISPLAY_HEIGHT);
    ctx.fillStyle = '#8FA17F';
    ctx.globalAlpha = 0.16;
    for (let y = 13; y < DISPLAY_HEIGHT; y += 16) {
      ctx.fillRect(18, y, DISPLAY_WIDTH - 36, 2);
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#202820';
    ctx.font = '800 46px Poppins, sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(text.replace(' V', ''), DISPLAY_WIDTH - 52, DISPLAY_HEIGHT / 2 - 1);
    ctx.font = '700 14px Poppins, sans-serif';
    ctx.fillStyle = '#2D382F';
    ctx.textAlign = 'left';
    ctx.fillText('DC', 20, 24);
    ctx.textAlign = 'right';
    ctx.fillText('V', DISPLAY_WIDTH - 18, DISPLAY_HEIGHT / 2 + 13);
    this.displayTexture.needsUpdate = true;
  }

  setReading(voltage: number): void {
    this.setDisplay(`${voltage.toFixed(2)} V`);
  }

  getJackWorldPosition(jack: 'com' | 'voltage'): THREE.Vector3 {
    const local = jack === 'com'
      ? new THREE.Vector3(-0.18, -0.01, 0.38)
      : new THREE.Vector3(0.2, -0.01, 0.38);
    return this.object.localToWorld(local);
  }

  dispose(): void {
    this.disposed = true;
    this.disposer.disposeObject(this.object);
    this.disposer.disposeTexture(this.displayTexture);
    this.disposer.disposeMaterial(this.displayMaterial);
    this.disposer.disposeMaterial(this.kickstandMaterial);
  }

  private inspectDisplaySurface(): void {
    const glass = this.model?.getObjectByName('multimeterglass_low');
    this.displayPlane.visible = false;
    if (!glass) return;

    glass.add(this.displayPlane);
    this.displayPlane.position.set(0, 0.003, -0.148);
    this.displayPlane.rotation.set(-Math.PI / 2, 0, 0);
    this.displayPlane.scale.set(0.31, 0.18, 1);
    this.displayPlane.visible = true;
  }

  private collectNodeNames(): string[] {
    if (!this.model) return [];

    const names: string[] = [];
    this.model.traverse((object) => {
      if (object.name) names.push(object.name);
    });
    return names;
  }
}
