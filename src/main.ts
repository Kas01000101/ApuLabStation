import * as Phaser from 'phaser';
import { phaserConfig } from './game/config';
import './styles.css';

window.addEventListener('DOMContentLoaded', () => {
  new Phaser.Game(phaserConfig);
});
