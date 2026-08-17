import * as Phaser from 'phaser';
import { phaserConfig } from './game/config';
import '@fontsource/poppins/latin-ext-400.css';
import '@fontsource/poppins/latin-ext-500.css';
import '@fontsource/poppins/latin-ext-600.css';
import '@fontsource/poppins/latin-ext-700.css';
import './styles.css';

window.addEventListener('DOMContentLoaded', () => {
  new Phaser.Game(phaserConfig);
});
