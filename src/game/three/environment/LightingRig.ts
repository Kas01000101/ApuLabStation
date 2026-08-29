import * as THREE from 'three';
import { ThreeDisposer } from '../core/ThreeDisposer';

export type LightingPreset = 'hub' | 'voltage-workbench';

interface ManagedLight {
  light: THREE.Light;
  hubIntensity: number;
  voltageIntensity: number;
}

export class LightingRig {
  private readonly root = new THREE.Group();
  private readonly disposer = new ThreeDisposer();
  private readonly managedLights: ManagedLight[] = [];
  private readonly kawsayPlatformObjects: THREE.Object3D[] = [];

  constructor(private readonly scene: THREE.Scene) {
    this.root.name = 'ApuLabLightingRig';
    this.createLights();
    this.createKawsayPlatformVisuals();
    this.scene.add(this.root);
  }

  applyPreset(preset: LightingPreset): void {
    this.managedLights.forEach(({ light, hubIntensity, voltageIntensity }) => {
      light.intensity = preset === 'hub' ? hubIntensity : voltageIntensity;
    });

    this.kawsayPlatformObjects.forEach((object) => {
      object.visible = preset === 'hub';
    });
  }

  dispose(): void {
    this.scene.remove(this.root);
    this.disposer.disposeObject(this.root);
    this.root.clear();
    this.managedLights.length = 0;
    this.kawsayPlatformObjects.length = 0;
  }

  private addLight(light: THREE.Light, hubIntensity: number, voltageIntensity: number): void {
    light.intensity = hubIntensity;
    this.managedLights.push({ light, hubIntensity, voltageIntensity });
    this.root.add(light);
  }

  private createLights(): void {
    const hemisphere = new THREE.HemisphereLight(0xf0f2ff, 0x222432);
    const ambient = new THREE.AmbientLight(0xffffff);
    const key = new THREE.DirectionalLight(0xf7fbff);
    const fill = new THREE.DirectionalLight(0xd8e2ff);
    const rim = new THREE.DirectionalLight(0x9ef8ff);
    const violetAccent = new THREE.PointLight(0x5c4cb0, 0.35, 4.2, 2.3);
    const cyanAccent = new THREE.PointLight(0x36dff0, 0.32, 3.6, 2.2);

    key.name = 'LightingRigKeyLight';
    key.position.set(-1.8, 3.6, 4.6);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.near = 0.5;
    key.shadow.camera.far = 12;
    key.shadow.camera.left = -3.4;
    key.shadow.camera.right = 3.4;
    key.shadow.camera.top = 3.4;
    key.shadow.camera.bottom = -3.4;

    fill.name = 'LightingRigFillLight';
    fill.position.set(3.4, 1.8, 2.2);

    rim.name = 'LightingRigRimLight';
    rim.position.set(2.6, 2.2, -2.8);

    violetAccent.name = 'LightingRigVioletAccent';
    violetAccent.position.set(-1.9, 0.7, -0.25);

    cyanAccent.name = 'LightingRigCyanAccent';
    cyanAccent.position.set(1.7, 0.8, 0.1);

    this.addLight(hemisphere, 1.18, 0.86);
    this.addLight(ambient, 0.28, 0.18);
    this.addLight(key, 2.75, 2.45);
    this.addLight(fill, 0.78, 0.5);
    this.addLight(rim, 1.05, 0.34);
    this.addLight(violetAccent, 0.28, 0.12);
    this.addLight(cyanAccent, 0.9, 0.22);
  }

  private createKawsayPlatformVisuals(): void {
    const contactShadow = new THREE.Mesh(
      new THREE.CircleGeometry(1.08, 32),
      new THREE.MeshBasicMaterial({
        color: 0x060711,
        transparent: true,
        opacity: 0.28,
        depthWrite: false
      })
    );
    contactShadow.name = 'KawsayContactShadow';
    contactShadow.position.set(0, 0.7, 0.2);
    contactShadow.rotation.x = -Math.PI / 2;

    const platformGlow = new THREE.Mesh(
      new THREE.CircleGeometry(0.72, 32),
      new THREE.MeshBasicMaterial({
        color: 0x4d4288,
        transparent: true,
        opacity: 0.12,
        depthWrite: false
      })
    );
    platformGlow.name = 'KawsayVioletPlatformGlow';
    platformGlow.position.set(0, 0.704, 0.2);
    platformGlow.rotation.x = -Math.PI / 2;

    const platformHalo = new THREE.Mesh(
      new THREE.RingGeometry(0.54, 0.96, 36),
      new THREE.MeshBasicMaterial({
        color: 0x00afc0,
        transparent: true,
        opacity: 0.18,
        depthWrite: false
      })
    );
    platformHalo.name = 'KawsayPlatformHalo';
    platformHalo.position.set(0, 0.702, 0.2);
    platformHalo.rotation.x = -Math.PI / 2;

    this.kawsayPlatformObjects.push(contactShadow, platformGlow, platformHalo);
    this.root.add(contactShadow, platformGlow, platformHalo);
  }
}
