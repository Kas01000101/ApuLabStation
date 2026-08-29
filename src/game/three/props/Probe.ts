import * as THREE from 'three';
import { ThreeDisposer } from '../core/ThreeDisposer';
import type { DraggableProbe, SnapPolarity } from '../interaction/InteractionTypes';
import { ApuLabMaterials } from './ApuLabMaterials';

export interface ProbeOptions {
  id: string;
  polarity: SnapPolarity;
  bodyColor: number;
  cableColor: number;
  homePosition: THREE.Vector3;
  scale?: number;
}

export class Probe implements DraggableProbe {
  readonly object = new THREE.Group();
  readonly pickObjects: THREE.Object3D[] = [];
  readonly draggable = true;
  readonly homePosition: THREE.Vector3;
  readonly polarity: SnapPolarity;
  readonly cableColor: number;
  connectedTarget?: string;

  private readonly disposer = new ThreeDisposer();
  private readonly bodyMaterial: THREE.MeshStandardMaterial;
  private readonly baseScale: number;
  private readonly tipLocalPosition = new THREE.Vector3(-0.36, 0, 0);
  private readonly cableAnchorLocalPosition = new THREE.Vector3(1.02, 0, 0);
  private homeRotationZ = 0;

  constructor(options: ProbeOptions, materials: ApuLabMaterials) {
    this.id = options.id;
    this.polarity = options.polarity;
    this.homePosition = options.homePosition.clone();
    this.cableColor = options.cableColor;
    this.baseScale = options.scale ?? 1;
    this.bodyMaterial = new THREE.MeshStandardMaterial({
      color: options.bodyColor,
      emissive: options.bodyColor,
      emissiveIntensity: 0.12,
      roughness: 0.44,
      metalness: 0.1
    });
    this.object.name = options.id;
    this.object.position.copy(options.homePosition);
    this.object.scale.setScalar(this.baseScale);
    this.build(materials);
  }

  readonly id: string;

  getTipWorldPosition(): THREE.Vector3 {
    return this.object.localToWorld(this.tipLocalPosition.clone());
  }

  getCableAnchorWorldPosition(): THREE.Vector3 {
    return this.object.localToWorld(this.cableAnchorLocalPosition.clone());
  }

  setWorldTipPosition(position: THREE.Vector3): void {
    const delta = position.clone().sub(this.getTipWorldPosition());
    this.object.position.add(delta);
  }

  setSelected(selected: boolean): void {
    this.object.scale.setScalar(this.baseScale * (selected ? 1.035 : 1));
    this.bodyMaterial.emissiveIntensity = selected ? 0.58 : 0.12;
  }

  returnHome(): void {
    this.connectedTarget = undefined;
    this.object.position.copy(this.homePosition);
    this.object.rotation.z = this.homeRotationZ;
  }

  snapTo(targetId: string, tipWorldPosition: THREE.Vector3): void {
    this.connectedTarget = targetId;
    this.object.rotation.z = THREE.MathUtils.degToRad(178);
    this.setWorldTipPosition(tipWorldPosition);
  }

  setHomeFromCurrent(): void {
    this.homePosition.copy(this.object.position);
    this.homeRotationZ = this.object.rotation.z;
  }

  dispose(): void {
    this.disposer.disposeObject(this.object);
    this.disposer.disposeMaterial(this.bodyMaterial);
  }

  private build(materials: ApuLabMaterials): void {
    const prefix = this.polarity === 'positive' ? 'RedProbe' : 'BlackProbe';

    const tip = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.018, 0.36, 16), materials.metallicSilver);
    tip.name = `${prefix}MetalTip`;
    tip.rotation.z = Math.PI / 2;
    tip.position.set(-0.18, 0, 0);
    this.object.add(tip);

    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.017, 0.027, 0.18, 16), materials.metallicSilver);
    shaft.name = `${prefix}MetalShaft`;
    shaft.rotation.z = Math.PI / 2;
    shaft.position.set(0.09, 0, 0);
    this.object.add(shaft);

    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.048, 0.14, 16), materials.blackRubber);
    neck.name = `${prefix}Neck`;
    neck.rotation.z = Math.PI / 2;
    neck.position.set(0.25, 0, 0);
    this.object.add(neck);

    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.066, 0.096, 0.58, 24), this.bodyMaterial);
    handle.name = `${prefix}Handle`;
    handle.rotation.z = Math.PI / 2;
    handle.position.set(0.61, 0, 0);
    this.object.add(handle);

    const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.058, 0.07, 0.1, 18), materials.blackRubber);
    tail.name = `${prefix}TailCap`;
    tail.rotation.z = Math.PI / 2;
    tail.position.set(0.96, 0, 0);
    this.object.add(tail);

    const gripA = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.008, 8, 20), materials.blackRubber);
    gripA.name = `${prefix}GripA`;
    gripA.position.set(0.48, 0, 0);
    gripA.rotation.y = Math.PI / 2;
    this.object.add(gripA);

    const gripB = gripA.clone();
    gripB.name = `${prefix}GripB`;
    gripB.position.set(0.61, 0, 0);
    this.object.add(gripB);

    const gripC = gripA.clone();
    gripC.name = `${prefix}GripC`;
    gripC.position.set(0.74, 0, 0);
    this.object.add(gripC);

    this.pickObjects.push(handle, neck, shaft, tip);
  }
}
