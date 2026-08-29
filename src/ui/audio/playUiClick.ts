import * as Phaser from 'phaser';

export const UI_CLICK_SOUND_KEY = 'menu_ui_click';
export const UI_HOVER_SOUND_KEY = 'menu_ui_hover';
export const UI_CLICK_VOLUME = 0.4;

export function playUiClick(scene: Phaser.Scene): void {
  if (scene.sound.mute || scene.sound.volume <= 0) return;
  if (!scene.cache.audio.exists(UI_CLICK_SOUND_KEY)) return;

  scene.sound.play(UI_CLICK_SOUND_KEY, {
    volume: UI_CLICK_VOLUME
  });
}

export function playUiHover(scene: Phaser.Scene): void {
  if (scene.sound.mute || scene.sound.volume <= 0) return;
  if (!scene.cache.audio.exists(UI_HOVER_SOUND_KEY)) return;

  scene.sound.play(UI_HOVER_SOUND_KEY, {
    volume: UI_CLICK_VOLUME
  });
}
