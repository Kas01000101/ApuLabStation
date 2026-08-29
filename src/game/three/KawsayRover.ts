import * as THREE from 'three';

const MATERIALS = {
  body: new THREE.MeshStandardMaterial({
    color: 0xf5f1e8,
    roughness: 0.62,
    metalness: 0.12
  }),
  bodyShade: new THREE.MeshStandardMaterial({
    color: 0xd8d0ee,
    roughness: 0.7,
    metalness: 0.08
  }),
  accent: new THREE.MeshStandardMaterial({
    color: 0xffa51f,
    roughness: 0.5,
    metalness: 0.18
  }),
  wheel: new THREE.MeshStandardMaterial({
    color: 0x2e315d,
    roughness: 0.74,
    metalness: 0.18
  }),
  wheelHub: new THREE.MeshStandardMaterial({
    color: 0xffb21f,
    roughness: 0.42,
    metalness: 0.22
  }),
  joint: new THREE.MeshStandardMaterial({
    color: 0x5f5f8b,
    roughness: 0.6,
    metalness: 0.28
  }),
  darkGlass: new THREE.MeshStandardMaterial({
    color: 0x07162f,
    roughness: 0.18,
    metalness: 0.1
  }),
  emissiveCyan: new THREE.MeshStandardMaterial({
    color: 0x58f2ff,
    emissive: 0x20d8f0,
    emissiveIntensity: 1.65,
    roughness: 0.25,
    metalness: 0.08
  }),
  panelBlue: new THREE.MeshStandardMaterial({
    color: 0x1477d4,
    emissive: 0x083e80,
    emissiveIntensity: 0.35,
    roughness: 0.42,
    metalness: 0.14
  })
} as const;

export class KawsayRover extends THREE.Group {
  constructor() {
    super();
    this.name = 'kawsay_1_procedural';
    this.createChassis();
    this.createWheelAssembly();
    this.createMastAndCamera();
    this.createSensors();
    this.createAntenna();
    this.createSolarPanel();
    this.createGlowDetails();
  }

  private createChassis(): void {
    const lower = this.box(1.45, 0.34, 0.82, MATERIALS.body);
    lower.position.set(0, 0.28, 0);
    lower.rotation.y = -0.04;
    this.add(lower);

    const upper = this.box(1.05, 0.38, 0.66, MATERIALS.bodyShade);
    upper.position.set(-0.06, 0.63, 0);
    upper.scale.set(1, 1, 0.96);
    this.add(upper);

    const orangeModule = this.box(0.34, 0.28, 0.72, MATERIALS.accent);
    orangeModule.position.set(0.62, 0.68, 0);
    this.add(orangeModule);

    const frontPlate = this.box(0.1, 0.3, 0.54, MATERIALS.body);
    frontPlate.position.set(-0.78, 0.42, 0);
    this.add(frontPlate);
  }

  private createWheelAssembly(): void {
    const xPositions = [-0.55, 0, 0.55];
    const zPositions = [-0.52, 0.52];

    zPositions.forEach((z) => {
      const axle = this.cylinder(0.04, 1.45, MATERIALS.joint, 10);
      axle.rotation.x = Math.PI / 2;
      axle.position.set(0, 0.2, z);
      this.add(axle);

      xPositions.forEach((x) => {
        const arm = this.box(0.12, 0.08, 0.26, MATERIALS.joint);
        arm.position.set(x, 0.26, z * 0.78);
        arm.rotation.z = x === 0 ? 0 : x > 0 ? -0.16 : 0.16;
        this.add(arm);

        const wheel = this.cylinder(0.22, 0.2, MATERIALS.wheel, 12);
        wheel.rotation.x = Math.PI / 2;
        wheel.position.set(x, 0.02, z);
        this.add(wheel);

        const hub = this.cylinder(0.11, 0.215, MATERIALS.wheelHub, 10);
        hub.rotation.x = Math.PI / 2;
        hub.position.copy(wheel.position);
        this.add(hub);

        const tireBand = this.cylinder(0.225, 0.205, MATERIALS.joint, 12);
        tireBand.rotation.x = Math.PI / 2;
        tireBand.scale.set(1, 0.42, 1);
        tireBand.position.copy(wheel.position);
        this.add(tireBand);
      });
    });
  }

  private createMastAndCamera(): void {
    const neck = this.cylinder(0.055, 0.56, MATERIALS.joint, 8);
    neck.position.set(-0.22, 1.12, 0);
    this.add(neck);

    const head = this.box(0.52, 0.32, 0.34, MATERIALS.body);
    head.position.set(-0.22, 1.48, 0);
    this.add(head);

    const visor = this.box(0.38, 0.18, 0.08, MATERIALS.darkGlass);
    visor.position.set(-0.49, 1.49, 0);
    this.add(visor);

    const leftEye = this.cylinder(0.055, 0.085, MATERIALS.emissiveCyan, 12);
    leftEye.rotation.z = Math.PI / 2;
    leftEye.position.set(-0.54, 1.5, -0.08);
    this.add(leftEye);

    const rightEye = this.cylinder(0.055, 0.085, MATERIALS.emissiveCyan, 12);
    rightEye.rotation.z = Math.PI / 2;
    rightEye.position.set(-0.54, 1.5, 0.08);
    this.add(rightEye);
  }

  private createSensors(): void {
    const sensor = this.box(0.34, 0.2, 0.14, MATERIALS.emissiveCyan);
    sensor.position.set(-0.78, 0.54, 0);
    this.add(sensor);

    const sideSensorLeft = this.box(0.1, 0.18, 0.28, MATERIALS.accent);
    sideSensorLeft.position.set(-0.18, 0.45, -0.45);
    this.add(sideSensorLeft);

    const sideSensorRight = this.box(0.1, 0.18, 0.28, MATERIALS.accent);
    sideSensorRight.position.set(-0.18, 0.45, 0.45);
    this.add(sideSensorRight);
  }

  private createAntenna(): void {
    const mast = this.cylinder(0.025, 0.72, MATERIALS.joint, 8);
    mast.position.set(0.38, 1.28, 0.28);
    mast.rotation.z = -0.22;
    this.add(mast);

    const tip = new THREE.Mesh(new THREE.IcosahedronGeometry(0.09, 0), MATERIALS.emissiveCyan.clone());
    tip.position.set(0.46, 1.63, 0.28);
    this.add(tip);
  }

  private createSolarPanel(): void {
    const support = this.cylinder(0.025, 0.58, MATERIALS.joint, 8);
    support.rotation.z = Math.PI / 2.8;
    support.position.set(0.54, 0.86, 0.44);
    this.add(support);

    const panel = this.box(0.68, 0.06, 0.42, MATERIALS.panelBlue);
    panel.position.set(0.88, 1.02, 0.62);
    panel.rotation.y = -0.16;
    panel.rotation.z = -0.12;
    this.add(panel);

    const gridMaterial = MATERIALS.emissiveCyan;
    [-0.16, 0, 0.16].forEach((offset) => {
      const line = this.box(0.62, 0.065, 0.012, gridMaterial);
      line.position.set(0.88, 1.06, 0.62 + offset);
      line.rotation.copy(panel.rotation);
      this.add(line);
    });
  }

  private createGlowDetails(): void {
    [-0.32, 0, 0.32].forEach((x) => {
      const light = this.box(0.18, 0.045, 0.045, MATERIALS.emissiveCyan);
      light.position.set(x, 0.3, -0.44);
      this.add(light);
    });

    const bellyLight = this.box(0.28, 0.05, 0.06, MATERIALS.emissiveCyan);
    bellyLight.position.set(0.1, 0.13, 0);
    this.add(bellyLight);
  }

  private box(width: number, height: number, depth: number, material: THREE.Material): THREE.Mesh {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth, 1, 1, 1), material.clone());
    mesh.castShadow = false;
    mesh.receiveShadow = false;
    return mesh;
  }

  private cylinder(radius: number, depth: number, material: THREE.Material, segments: number): THREE.Mesh {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, depth, segments), material.clone());
    mesh.castShadow = false;
    mesh.receiveShadow = false;
    return mesh;
  }
}
