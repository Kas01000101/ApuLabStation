import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';

export class PostProcessingManager {
  private readonly composer: EffectComposer;
  private readonly renderPass: RenderPass;
  private readonly outlinePass: OutlinePass;

  constructor(
    private readonly renderer: THREE.WebGLRenderer,
    private readonly scene: THREE.Scene,
    private readonly camera: THREE.Camera
  ) {
    const size = new THREE.Vector2();
    this.renderer.getSize(size);

    this.composer = new EffectComposer(this.renderer);
    this.renderPass = new RenderPass(this.scene, this.camera);
    this.outlinePass = new OutlinePass(size, this.scene, this.camera);
    this.configureOutline();

    this.composer.addPass(this.renderPass);
    this.composer.addPass(this.outlinePass);
  }

  setOutlinedObjects(objects: THREE.Object3D[]): void {
    this.outlinePass.selectedObjects = objects;
  }

  resize(width: number, height: number): void {
    this.composer.setSize(width, height);
    this.outlinePass.resolution.set(width, height);
  }

  render(delta: number): void {
    this.composer.render(delta);
  }

  getPassCount(): number {
    return this.composer.passes.length;
  }

  dispose(): void {
    this.setOutlinedObjects([]);
    this.composer.dispose();
  }

  private configureOutline(): void {
    this.outlinePass.edgeStrength = 2.4;
    this.outlinePass.edgeGlow = 0.18;
    this.outlinePass.edgeThickness = 1.2;
    this.outlinePass.pulsePeriod = 0;
    this.outlinePass.visibleEdgeColor.set(0x58f2ff);
    this.outlinePass.hiddenEdgeColor.set(0x1d6570);
  }
}
