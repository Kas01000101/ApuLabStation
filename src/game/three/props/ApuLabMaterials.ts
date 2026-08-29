import * as THREE from 'three';

export class ApuLabMaterials {
  readonly graphite = new THREE.MeshStandardMaterial({
    color: 0x252836,
    roughness: 0.58,
    metalness: 0.18
  });

  readonly darkMetal = new THREE.MeshStandardMaterial({
    color: 0x111521,
    roughness: 0.42,
    metalness: 0.48
  });

  readonly violet = new THREE.MeshStandardMaterial({
    color: 0x4d4288,
    roughness: 0.46,
    metalness: 0.16
  });

  readonly cyanEmissive = new THREE.MeshStandardMaterial({
    color: 0x58f2ff,
    emissive: 0x20d8f0,
    emissiveIntensity: 1.2,
    roughness: 0.26,
    metalness: 0.08
  });

  readonly redProbe = new THREE.MeshStandardMaterial({
    color: 0xe53945,
    emissive: 0x550006,
    emissiveIntensity: 0.18,
    roughness: 0.42,
    metalness: 0.12
  });

  readonly metallicSilver = new THREE.MeshStandardMaterial({
    color: 0xc6ced8,
    roughness: 0.24,
    metalness: 0.72
  });

  readonly blackRubber = new THREE.MeshStandardMaterial({
    color: 0x050711,
    roughness: 0.78,
    metalness: 0.04
  });

  readonly safetyYellowRubber = new THREE.MeshStandardMaterial({
    color: 0xf4b82e,
    roughness: 0.72,
    metalness: 0.02
  });

  createDisplayMaterial(texture: THREE.Texture): THREE.MeshBasicMaterial {
    return new THREE.MeshBasicMaterial({ map: texture, toneMapped: false });
  }

  createHighlightMaterial(color = 0xf2c94c): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 1.15,
      roughness: 0.24,
      metalness: 0.18,
      transparent: true,
      opacity: 0.88
    });
  }

  dispose(): void {
    [
      this.graphite,
      this.darkMetal,
      this.violet,
      this.cyanEmissive,
      this.redProbe,
      this.metallicSilver,
      this.blackRubber,
      this.safetyYellowRubber
    ].forEach((material) => material.dispose());
  }
}
