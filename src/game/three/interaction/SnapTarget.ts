import * as THREE from 'three';
import type { SnapPolarity } from './InteractionTypes';

export class SnapTarget {
  readonly position = new THREE.Vector3();

  constructor(
    readonly id: string,
    readonly polarity: SnapPolarity,
    readonly object: THREE.Object3D,
    readonly snapRadius = 0.32,
    private readonly setVisualHighlight: (active: boolean, snapped: boolean) => void
  ) {
    this.updateWorldPosition();
  }

  updateWorldPosition(): THREE.Vector3 {
    this.object.getWorldPosition(this.position);
    return this.position;
  }

  setHighlight(active: boolean, snapped = false): void {
    this.setVisualHighlight(active, snapped);
  }
}
