import * as THREE from 'three';

export class ThreeDisposer {
  private readonly geometries = new Set<THREE.BufferGeometry>();
  private readonly materials = new Set<THREE.Material>();
  private readonly textures = new Set<THREE.Texture>();

  disposeObject(object: THREE.Object3D): void {
    object.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (!mesh.isMesh) return;

      this.disposeGeometry(mesh.geometry);
      this.disposeMaterial(mesh.material);
    });
  }

  disposeGeometry(geometry?: THREE.BufferGeometry | null): void {
    if (!geometry || this.geometries.has(geometry)) return;
    this.geometries.add(geometry);
    geometry.dispose();
  }

  disposeMaterial(material?: THREE.Material | THREE.Material[] | null): void {
    if (!material) return;

    if (Array.isArray(material)) {
      material.forEach((item) => this.disposeMaterial(item));
      return;
    }

    if (this.materials.has(material)) return;
    this.materials.add(material);

    Object.values(material).forEach((value) => {
      if (value && typeof value === 'object' && 'isTexture' in value) {
        this.disposeTexture(value as THREE.Texture);
      }
    });

    material.dispose();
  }

  disposeTexture(texture?: THREE.Texture | null): void {
    if (!texture || this.textures.has(texture)) return;
    this.textures.add(texture);
    texture.dispose();
  }
}
