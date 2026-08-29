import * as THREE from 'three';

export type SnapPolarity = 'positive' | 'negative';

export interface SnapPayload {
  probeId: string;
  probePolarity: SnapPolarity;
  targetId: string;
  targetPolarity: SnapPolarity;
}

export interface ProbeDisconnectedPayload {
  probeId: string;
  probePolarity: SnapPolarity;
  targetId: string;
}

export type DomainEventName = 'probe-snapped' | 'probe-disconnected' | 'measurement-changed' | 'measurement-complete';
export type DomainEventPayload = SnapPayload | ProbeDisconnectedPayload | Record<string, unknown>;

export interface DomainEventEmitter {
  emit(eventName: DomainEventName, payload: DomainEventPayload): void;
}

export interface DraggableProbe {
  id: string;
  polarity: SnapPolarity;
  object: THREE.Group;
  pickObjects: THREE.Object3D[];
  homePosition: THREE.Vector3;
  connectedTarget?: string;
  draggable: true;
  getTipWorldPosition(): THREE.Vector3;
  getCableAnchorWorldPosition(): THREE.Vector3;
  setWorldTipPosition(position: THREE.Vector3): void;
  setSelected(selected: boolean): void;
  returnHome(): void;
  snapTo(targetId: string, tipWorldPosition: THREE.Vector3): void;
}
