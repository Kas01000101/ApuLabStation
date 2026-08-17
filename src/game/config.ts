import * as Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from './constants';
import { BootScene } from './scenes/BootScene';
import { MainMenuScene } from './scenes/MainMenuScene';
import { ParticipantCodeScene } from './scenes/ParticipantCodeScene';
import { OpportunityIntroScene } from './scenes/OpportunityIntroScene';
import { Level2HubbleScene } from './scenes/Level2HubbleScene';
import { Level1RoverLabScene } from './scenes/Level1RoverLabScene';
import { Level3ProgrammingScene } from './scenes/Level3ProgrammingScene';
import { FinalScene } from './scenes/FinalScene';

export const phaserConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  backgroundColor: '#0B0E26',
  scene: [
    BootScene,
    MainMenuScene,
    ParticipantCodeScene,
    OpportunityIntroScene,
    Level1RoverLabScene,
    Level2HubbleScene,
    Level3ProgrammingScene,
    FinalScene
  ]
};
