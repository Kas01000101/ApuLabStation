import * as THREE from 'three';
import { ThreeDisposer } from '../core/ThreeDisposer';

export class Cable {
  readonly object = new THREE.Group();

  private readonly disposer = new ThreeDisposer();
  private readonly material: THREE.MeshStandardMaterial;
  private mesh?: THREE.Mesh;

  constructor(readonly id: string, color: number) {
    this.object.name = id;
    this.material = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.76,
      metalness: 0.02
    });
  }

  update(start: THREE.Vector3, end: THREE.Vector3): void {
    const midpointZ = (start.z + end.z) * 0.5;
    const tableY = Math.min(start.y, end.y) + 0.018;
    const direction = end.clone().sub(start);
    const lateralSign = direction.x >= 0 ? 1 : -1;
    const points = [
      start.clone(),
      new THREE.Vector3(start.x + 0.08 * lateralSign, tableY + 0.11, start.z + 0.1),
      new THREE.Vector3(start.x * 0.78 + end.x * 0.22, tableY + 0.01, midpointZ - 0.18),
      new THREE.Vector3(start.x * 0.54 + end.x * 0.46, tableY - 0.004, midpointZ + 0.08),
      new THREE.Vector3(start.x * 0.28 + end.x * 0.72, tableY + 0.012, midpointZ + 0.18),
      end.clone()
    ];
    const curve = new THREE.CatmullRomCurve3(points);
    const geometry = new THREE.TubeGeometry(curve, 48, 0.0085, 8, false);

    if (!this.mesh) {
      this.mesh = new THREE.Mesh(geometry, this.material);
      this.mesh.name = `${this.id}_tube`;
      this.mesh.castShadow = true;
      this.mesh.receiveShadow = false;
      this.object.add(this.mesh);
      return;
    }

    const previousGeometry = this.mesh.geometry;
    this.mesh.geometry = geometry;
    this.disposer.disposeGeometry(previousGeometry);
  }

  dispose(): void {
    this.disposer.disposeObject(this.object);
    this.disposer.disposeMaterial(this.material);
  }
}
