import * as THREE from 'three';

export class InteractionProxy {
  readonly object: THREE.Mesh;

  private constructor(object: THREE.Mesh) {
    this.object = object;
    this.object.visible = false;
    this.object.name = this.object.name || 'InteractionProxy';
  }

  static sphere(name: string, radius: number, position: THREE.Vector3): InteractionProxy {
    const proxy = new THREE.Mesh(
      new THREE.SphereGeometry(radius, 16, 12),
      new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
    );
    proxy.name = name;
    proxy.position.copy(position);
    return new InteractionProxy(proxy);
  }

  static box(name: string, size: THREE.Vector3, position: THREE.Vector3): InteractionProxy {
    const proxy = new THREE.Mesh(
      new THREE.BoxGeometry(size.x, size.y, size.z),
      new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
    );
    proxy.name = name;
    proxy.position.copy(position);
    return new InteractionProxy(proxy);
  }

  dispose(): void {
    this.object.geometry.dispose();
    const material = this.object.material;
    if (Array.isArray(material)) {
      material.forEach((item) => item.dispose());
    } else {
      material.dispose();
    }
  }
}
