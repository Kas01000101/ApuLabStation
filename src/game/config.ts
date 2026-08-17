import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from './constants';
import { BootScene } from './scenes/BootScene';
import { MainMenuScene } from './scenes/MainMenuScene';
import { ParticipantCodeScene } from './scenes/ParticipantCodeScene';
import { OpportunityIntroScene } from './scenes/OpportunityIntroScene';
import { Level1HubbleScene } from './scenes/Level1HubbleScene';
import { Level2RoverLabScene } from './scenes/Level2RoverLabScene';
import { Level3ProgramMissionScene } from './scenes/Level3ProgramMissionScene';
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
    Level2RoverLabScene,
    Level1HubbleScene,
    Level3ProgramMissionScene,
    FinalScene
  ]
};
