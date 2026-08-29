import * as THREE from 'three';

const DRAG_LIMITS = {
  minX: -2.45,
  maxX: 2.45,
  minY: -1.05,
  maxY: 1.08,
  minZ: -0.4,
  maxZ: 1.05
} as const;

export class DragController {
  private readonly plane = new THREE.Plane();
  private readonly hit = new THREE.Vector3();

  begin(camera: THREE.Camera, point: THREE.Vector3): void {
    const normal = new THREE.Vector3();
    camera.getWorldDirection(normal);
    this.plane.setFromNormalAndCoplanarPoint(normal, point);
  }

  intersect(raycaster: THREE.Raycaster): THREE.Vector3 | undefined {
    const result = raycaster.ray.intersectPlane(this.plane, this.hit);
    if (!result) return undefined;

    this.hit.set(
      THREE.MathUtils.clamp(this.hit.x, DRAG_LIMITS.minX, DRAG_LIMITS.maxX),
      THREE.MathUtils.clamp(this.hit.y, DRAG_LIMITS.minY, DRAG_LIMITS.maxY),
      THREE.MathUtils.clamp(this.hit.z, DRAG_LIMITS.minZ, DRAG_LIMITS.maxZ)
    );

    return this.hit.clone();
  }
}
