import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

export class EnvironmentManager {
  private readonly pmremGenerator: THREE.PMREMGenerator;
  private readonly roomEnvironment = new RoomEnvironment();
  private environmentTarget?: THREE.WebGLRenderTarget;
  private initialized = false;

  constructor(
    private readonly renderer: THREE.WebGLRenderer,
    private readonly scene: THREE.Scene
  ) {
    this.pmremGenerator = new THREE.PMREMGenerator(this.renderer);
  }

  init(): void {
    if (this.initialized) return;

    this.environmentTarget = this.pmremGenerator.fromScene(this.roomEnvironment, 0.035);
    this.scene.environment = this.environmentTarget.texture;
    this.initialized = true;
  }

  dispose(): void {
    if (this.scene.environment === this.environmentTarget?.texture) {
      this.scene.environment = null;
    }

    this.environmentTarget?.dispose();
    this.environmentTarget = undefined;
    this.roomEnvironment.dispose();
    this.pmremGenerator.dispose();
    this.initialized = false;
  }
}
