import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { ModelInstance } from './ModelInstance';

export class ThreeAssetManager {
  private readonly loader = new GLTFLoader();
  private readonly gltfCache = new Map<string, Promise<GLTF>>();

  preload(urls: string[]): Promise<void[]> {
    return Promise.all(urls.map((url) => this.loadGLTF(url).then(() => undefined)));
  }

  loadGLTF(url: string): Promise<GLTF> {
    const cached = this.gltfCache.get(url);
    if (cached) return cached;

    const request = this.loader.loadAsync(url).catch((error: unknown) => {
      this.gltfCache.delete(url);
      throw error;
    });
    this.gltfCache.set(url, request);
    return request;
  }

  async loadModelInstance(url: string): Promise<ModelInstance> {
    const gltf = await this.loadGLTF(url);
    return {
      url,
      scene: this.cloneScene(gltf.scene),
      animations: gltf.animations
    };
  }

  dispose(): void {
    this.gltfCache.clear();
  }

  private cloneScene(source: THREE.Object3D): THREE.Object3D {
    const clone = source.clone(true);
    const sourceMeshes: THREE.Mesh[] = [];
    const cloneMeshes: THREE.Mesh[] = [];

    source.traverse((object) => {
      const mesh = object as THREE.Mesh;
      if (mesh.isMesh) sourceMeshes.push(mesh);
    });
    clone.traverse((object) => {
      const mesh = object as THREE.Mesh;
      if (mesh.isMesh) cloneMeshes.push(mesh);
    });

    cloneMeshes.forEach((mesh, index) => {
      const sourceMesh = sourceMeshes[index];
      mesh.geometry = sourceMesh.geometry.clone();
      mesh.material = this.cloneMaterial(sourceMesh.material);
    });

    return clone;
  }

  private cloneMaterial(material: THREE.Material | THREE.Material[]): THREE.Material | THREE.Material[] {
    if (Array.isArray(material)) return material.map((item) => item.clone());
    return material.clone();
  }
}
