export interface Vector3Like {
  x: number;
  y: number;
  z: number;
}

export interface ThreeModelConfig {
  id: string;
  url: string;
  position: Vector3Like;
  entryFrom?: Vector3Like;
  rotation: Vector3Like;
  scale: number;
  idle?: 'rover' | 'hopper';
}

export interface ThreeObjectLifecycle {
  update?: (delta: number, elapsed: number, modelElapsed: number) => void;
  handlePointerDrag?: (deltaX: number, deltaY: number) => void;
  handlePointerRelease?: () => void;
  dispose?: () => void;
}

export interface ThreeCameraPose {
  position: Vector3Like;
  target: Vector3Like;
}
