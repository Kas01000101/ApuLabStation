import * as THREE from 'three';
import type { ThreeObjectLifecycle } from './core/ThreeRuntimeTypes';

interface KawsayVisualOptions {
  targetWidth: number;
  platformY: number;
  entryDurationSeconds?: number;
}

const CYAN_EMISSIVE = new THREE.Color(0x00f2fe);
const PALETTE = {
  graphite: new THREE.Color(0x252836),
  metal: new THREE.Color(0x4b5163),
  violet: new THREE.Color(0x4d4288),
  darkViolet: new THREE.Color(0x302a5c),
  cyan: new THREE.Color(0x00f2fe),
  deepCyan: new THREE.Color(0x00afc0),
  wheel: new THREE.Color(0x171a22),
  gold: new THREE.Color(0xf2c94c),
  lightGrey: new THREE.Color(0xc8cedb)
} as const;

export class KawsayVisual implements ThreeObjectLifecycle {
  readonly root = new THREE.Group();
  readonly model: THREE.Object3D;
  readonly boundingBox = new THREE.Box3();
  readonly size = new THREE.Vector3();
  readonly center = new THREE.Vector3();
  readonly scale: number;
  readonly platformY: number;
  readonly wheels = new Map<string, THREE.Object3D>();
  readonly lenses: THREE.Object3D[] = [];
  readonly navCam?: THREE.Object3D;

  private readonly entryDurationSeconds: number;
  private readonly geometries = new Set<THREE.BufferGeometry>();
  private readonly materials = new Set<THREE.Material>();
  private readonly navCamBaseRotationY?: number;
  private baseRootY?: number;
  private baseRotationY?: number;
  private dragRotationY = 0;
  private targetDragRotationY = 0;
  private dragTiltX = 0;
  private targetDragTiltX = 0;
  private isUserDragging = false;
  private disposed = false;

  constructor(model: THREE.Object3D, options: KawsayVisualOptions) {
    this.model = model;
    this.platformY = options.platformY;
    this.entryDurationSeconds = options.entryDurationSeconds ?? 1.45;

    this.root.name = 'KawsayVisualRoot';
    this.model.updateMatrixWorld(true);
    this.boundingBox.setFromObject(this.model);
    this.boundingBox.getSize(this.size);
    this.boundingBox.getCenter(this.center);

    this.model.position.sub(this.center);
    this.root.add(this.model);
    this.scale = options.targetWidth / Math.max(this.size.x, 0.001);

    this.navCam =
      this.model.getObjectByName('NavCam') ??
      this.findObjectByName((name) => name.includes('navcam') && name.includes('housing')) ??
      undefined;
    this.navCamBaseRotationY = this.navCam?.rotation.y;

    this.model.traverse((child) => {
      const normalizedName = child.name.toLowerCase();
      if (normalizedName.includes('wheel_tire')) {
        this.wheels.set(child.name, child);
      }
      if (normalizedName.includes('lens')) {
        this.lenses.push(child);
      }
    });

    this.prepareMeshes();
  }

  getPlatformAlignedY(): number {
    return this.platformY + (this.size.y * this.scale) / 2;
  }

  update(_delta: number, elapsed: number, modelElapsed: number): void {
    if (this.baseRootY === undefined) this.baseRootY = this.root.position.y;
    if (this.baseRotationY === undefined) this.baseRotationY = this.root.rotation.y;

    const entryProgress = Math.min(modelElapsed / this.entryDurationSeconds, 1);
    const easedEntry = 1 - Math.pow(1 - entryProgress, 3);
    const entryScale = THREE.MathUtils.lerp(0.95, 1, easedEntry);
    const idleFloat = Math.sin(elapsed * 1.15) * 0.018;
    const idleYaw = Math.sin(elapsed * 0.48) * THREE.MathUtils.degToRad(2.2);

    this.dragRotationY = THREE.MathUtils.lerp(this.dragRotationY, this.targetDragRotationY, this.isUserDragging ? 0.34 : 0.07);
    this.dragTiltX = THREE.MathUtils.lerp(this.dragTiltX, this.targetDragTiltX, this.isUserDragging ? 0.28 : 0.08);

    this.root.scale.setScalar(this.scale * entryScale);
    this.root.position.y = this.baseRootY + idleFloat;
    this.root.rotation.y = this.baseRotationY + idleYaw + this.dragRotationY;
    this.root.rotation.x = this.dragTiltX;

    if (this.navCam && this.navCamBaseRotationY !== undefined) {
      this.navCam.rotation.y = this.navCamBaseRotationY + Math.sin(elapsed * 0.65) * THREE.MathUtils.degToRad(3);
    }
  }

  handlePointerDrag(deltaX: number, deltaY: number): void {
    this.isUserDragging = true;
    this.targetDragRotationY = THREE.MathUtils.clamp(
      this.targetDragRotationY + deltaX * 0.009,
      THREE.MathUtils.degToRad(-34),
      THREE.MathUtils.degToRad(34)
    );
    this.targetDragTiltX = THREE.MathUtils.clamp(
      this.targetDragTiltX + deltaY * 0.002,
      THREE.MathUtils.degToRad(-5),
      THREE.MathUtils.degToRad(5)
    );
  }

  handlePointerRelease(): void {
    this.isUserDragging = false;
    this.targetDragTiltX = 0;
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;

    this.geometries.forEach((geometry) => geometry.dispose());
    this.materials.forEach((material) => {
      Object.values(material).forEach((value) => {
        if (value && typeof value === 'object' && 'isTexture' in value) {
          (value as THREE.Texture).dispose();
        }
      });
      material.dispose();
    });
    this.geometries.clear();
    this.materials.clear();
  }

  private prepareMeshes(): void {
    this.model.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (!mesh.isMesh) return;

      mesh.castShadow = false;
      mesh.receiveShadow = false;
      if (mesh.geometry) this.geometries.add(mesh.geometry);

      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      const preparedMaterials = materials.map((material) => {
        if (!material) return;
        const prepared = material.clone();
        this.materials.add(prepared);
        this.applyRuntimeFinish(prepared, mesh.name);
        return prepared;
      });

      mesh.material = Array.isArray(mesh.material)
        ? preparedMaterials.filter(Boolean) as THREE.Material[]
        : preparedMaterials[0] ?? mesh.material;
    });
  }

  private applyRuntimeFinish(material: THREE.Material, meshName: string): void {
    if (!('roughness' in material) || !('metalness' in material)) return;

    const standard = material as THREE.MeshStandardMaterial;
    const materialName = standard.name.toLowerCase();
    const nodeName = meshName.toLowerCase();
    this.applyPaletteColor(standard, nodeName, materialName);

    if (materialName.includes('metal')) {
      standard.metalness = THREE.MathUtils.clamp(standard.metalness, 0.35, 0.65);
      standard.roughness = THREE.MathUtils.clamp(standard.roughness, 0.3, 0.5);
    } else if (
      materialName.includes('graphite') ||
      materialName.includes('violet') ||
      materialName.includes('lightgrey') ||
      materialName.includes('gold')
    ) {
      standard.metalness = THREE.MathUtils.clamp(standard.metalness, 0.1, 0.3);
      standard.roughness = THREE.MathUtils.clamp(standard.roughness, 0.35, 0.55);
    }

    const safeCyanEmitter =
      nodeName.includes('cyan') ||
      nodeName.includes('lens') ||
      nodeName.includes('aperture') ||
      nodeName.includes('status_slit') ||
      nodeName.includes('lens_') ||
      nodeName.includes('cyanstatuslight') ||
      nodeName.includes('cyanindicator') ||
      nodeName.includes('cyansensorstrip') ||
      nodeName.includes('cyanwindow') ||
      nodeName.includes('cyanmarker') ||
      nodeName.includes('cyantip');

    if (safeCyanEmitter && 'emissive' in standard) {
      standard.emissive.copy(CYAN_EMISSIVE);
      standard.emissiveIntensity = nodeName.includes('lens') ? 1.05 : 0.72;
    }

    standard.needsUpdate = true;
  }

  private applyPaletteColor(material: THREE.MeshStandardMaterial, nodeName: string, materialName: string): void {
    if (nodeName.includes('wheel_tire')) {
      material.color.copy(PALETTE.wheel);
      material.metalness = 0.08;
      material.roughness = 0.62;
      return;
    }

    if (nodeName.includes('violet')) {
      material.color.copy(PALETTE.violet);
      material.metalness = 0.16;
      material.roughness = 0.42;
      return;
    }

    if (nodeName.includes('dark_violet')) {
      material.color.copy(PALETTE.darkViolet);
      material.metalness = 0.14;
      material.roughness = 0.48;
      return;
    }

    if (nodeName.includes('cyan') || nodeName.includes('lens') || nodeName.includes('aperture') || nodeName.includes('status_slit')) {
      material.color.copy(nodeName.includes('deep') || nodeName.includes('status_slit') ? PALETTE.deepCyan : PALETTE.cyan);
      material.metalness = 0.12;
      material.roughness = 0.3;
      return;
    }

    if (nodeName.includes('gold')) {
      material.color.copy(PALETTE.gold);
      material.metalness = 0.18;
      material.roughness = 0.36;
      return;
    }

    if (nodeName.includes('lightmetal') || nodeName.includes('lightgrey')) {
      material.color.copy(PALETTE.lightGrey);
      material.metalness = 0.28;
      material.roughness = 0.34;
      return;
    }

    if (nodeName.includes('metal') || nodeName.includes('hub') || materialName.includes('metal')) {
      material.color.copy(PALETTE.metal);
      material.metalness = 0.38;
      material.roughness = 0.36;
      return;
    }

    if (nodeName.includes('graphite') || nodeName.includes('chassis') || nodeName.includes('keel')) {
      material.color.copy(PALETTE.graphite);
      material.metalness = 0.14;
      material.roughness = 0.5;
    }
  }

  private findObjectByName(predicate: (name: string) => boolean): THREE.Object3D | undefined {
    let match: THREE.Object3D | undefined;

    this.model.traverse((child) => {
      if (!match && predicate(child.name.toLowerCase())) {
        match = child;
      }
    });

    return match;
  }
}
