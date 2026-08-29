export const THREE_ASSETS = {
  kawsay: '/assets/level1/shared/models/kawsay_1.glb',
  hopper: '/assets/level1/shared/models/hopper.glb',
  multimeter: '/assets/level1/shared/models/multimeter/multimeter.glb'
} as const;

export type ThreeAssetKey = keyof typeof THREE_ASSETS;
