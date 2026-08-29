import * as THREE from 'three';

export interface ModelInstance {
  readonly url: string;
  readonly scene: THREE.Object3D;
  readonly animations: THREE.AnimationClip[];
}
