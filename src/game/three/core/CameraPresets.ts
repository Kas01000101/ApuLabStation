import type { ThreeCameraPose } from './ThreeRuntimeTypes';

export interface CameraPreset extends ThreeCameraPose {
  fov?: number;
}

export const CAMERA_PRESETS = {
  hub: {
    position: { x: 0, y: 1.25, z: 6.2 },
    target: { x: 0, y: 0.9, z: 0 },
    fov: 32
  },
  voltageWorkbench: {
    position: { x: 0.02, y: 0.34, z: 5.15 },
    target: { x: 0.02, y: -0.52, z: 0.58 },
    fov: 31
  }
} as const satisfies Record<string, CameraPreset>;

export type CameraPresetName = keyof typeof CAMERA_PRESETS;
