import * as THREE from 'three';
import { DragController } from './DragController';
import type { DomainEventEmitter, DraggableProbe } from './InteractionTypes';
import { SnapTarget } from './SnapTarget';

interface InteractionManagerOptions {
  container: HTMLElement;
  camera: THREE.Camera;
  eventEmitter: DomainEventEmitter;
  canSnap?: (probe: DraggableProbe, target: SnapTarget) => boolean;
  onProbeDisconnected?: (probe: DraggableProbe, targetId: string) => void;
  onProbeSnapped?: (probe: DraggableProbe, target: SnapTarget) => void;
  onOutlinedObjectsChange?: (objects: THREE.Object3D[]) => void;
}

export class InteractionManager {
  private readonly raycaster = new THREE.Raycaster();
  private readonly pointer = new THREE.Vector2();
  private readonly dragController = new DragController();
  private readonly draggables: DraggableProbe[] = [];
  private readonly snapTargets: SnapTarget[] = [];
  private activeProbe?: DraggableProbe;
  private activeSnapTarget?: SnapTarget;

  constructor(private readonly options: InteractionManagerOptions) {
    this.options.container.addEventListener('pointerdown', this.handlePointerDown, { capture: true });
    window.addEventListener('pointermove', this.handlePointerMove);
    window.addEventListener('pointerup', this.handlePointerUp);
    window.addEventListener('pointercancel', this.handlePointerUp);
  }

  registerDraggable(probe: DraggableProbe): void {
    this.draggables.push(probe);
  }

  registerSnapTarget(target: SnapTarget): void {
    this.snapTargets.push(target);
  }

  dispose(): void {
    this.options.container.removeEventListener('pointerdown', this.handlePointerDown, { capture: true });
    window.removeEventListener('pointermove', this.handlePointerMove);
    window.removeEventListener('pointerup', this.handlePointerUp);
    window.removeEventListener('pointercancel', this.handlePointerUp);
    this.clearHighlight();
    this.draggables.length = 0;
    this.snapTargets.length = 0;
    this.activeProbe = undefined;
  }

  private handlePointerDown = (event: PointerEvent): void => {
    this.updateRaycaster(event);
    const pickObjects = this.draggables.flatMap((probe) => probe.pickObjects);
    const hit = this.raycaster.intersectObjects(pickObjects, true)[0];
    if (!hit) return;

    const probe = this.draggables.find((candidate) => candidate.pickObjects.some((object) => object === hit.object || this.isDescendant(hit.object, object)));
    if (!probe) return;

    event.preventDefault();
    event.stopPropagation();
    this.activeProbe = probe;
    if (probe.connectedTarget) {
      const targetId = probe.connectedTarget;
      const target = this.snapTargets.find((candidate) => candidate.id === targetId);
      target?.setHighlight(false);
      probe.connectedTarget = undefined;
      this.options.onProbeDisconnected?.(probe, targetId);
      this.options.eventEmitter.emit('probe-disconnected', {
        probeId: probe.id,
        probePolarity: probe.polarity,
        targetId
      });
    }
    probe.setSelected(true);
    this.options.onOutlinedObjectsChange?.([probe.object]);
    this.dragController.begin(this.options.camera, probe.getTipWorldPosition());
  };

  private handlePointerMove = (event: PointerEvent): void => {
    if (!this.activeProbe) return;

    this.updateRaycaster(event);
    const point = this.dragController.intersect(this.raycaster);
    if (!point) return;

    this.activeProbe.setWorldTipPosition(point);
    this.updateNearestSnapTarget();
  };

  private handlePointerUp = (): void => {
    if (!this.activeProbe) return;

    const probe = this.activeProbe;
    const target = this.activeSnapTarget;
    probe.setSelected(false);

    if (target && (!this.options.canSnap || this.options.canSnap(probe, target))) {
      const targetPosition = target.updateWorldPosition().clone();
      probe.snapTo(target.id, targetPosition);
      target.setHighlight(true, true);
      this.options.onProbeSnapped?.(probe, target);
      this.options.eventEmitter.emit('probe-snapped', {
        probeId: probe.id,
        probePolarity: probe.polarity,
        targetId: target.id,
        targetPolarity: target.polarity
      });
    } else {
      probe.returnHome();
    }

    this.activeProbe = undefined;
    this.activeSnapTarget = undefined;
    this.options.onOutlinedObjectsChange?.([]);
    this.snapTargets.forEach((snapTarget) => {
      if (snapTarget !== target) snapTarget.setHighlight(false);
    });
  };

  private updateNearestSnapTarget(): void {
    if (!this.activeProbe) return;

    const probe = this.activeProbe;
    const tipPosition = probe.getTipWorldPosition();
    let nearest: SnapTarget | undefined;
    let nearestDistance = Number.POSITIVE_INFINITY;

    this.snapTargets.forEach((target) => {
      if (this.options.canSnap && !this.options.canSnap(probe, target)) {
        target.setHighlight(false);
        return;
      }
      const distance = target.updateWorldPosition().distanceTo(tipPosition);
      if (distance <= target.snapRadius && distance < nearestDistance) {
        nearest = target;
        nearestDistance = distance;
      }
    });

    if (nearest === this.activeSnapTarget) return;
    this.clearHighlight();
    this.activeSnapTarget = nearest;
    this.activeSnapTarget?.setHighlight(true);
    this.options.onOutlinedObjectsChange?.([
      probe.object,
      ...(this.activeSnapTarget ? [this.activeSnapTarget.object] : [])
    ]);
  }

  private clearHighlight(): void {
    this.activeSnapTarget?.setHighlight(false);
    this.activeSnapTarget = undefined;
  }

  private updateRaycaster(event: PointerEvent): void {
    const bounds = this.options.container.getBoundingClientRect();
    this.pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
    this.pointer.y = -(((event.clientY - bounds.top) / bounds.height) * 2 - 1);
    this.raycaster.setFromCamera(this.pointer, this.options.camera);
  }

  private isDescendant(child: THREE.Object3D, parent: THREE.Object3D): boolean {
    let current: THREE.Object3D | null = child;
    while (current) {
      if (current === parent) return true;
      current = current.parent;
    }
    return false;
  }
}
