import * as Phaser from 'phaser';
import { phaserConfig } from './game/config';
import '@fontsource/fredoka/latin-ext-600.css';
import '@fontsource/fredoka/latin-ext-700.css';
import '@fontsource/nunito-sans/latin-ext-400.css';
import '@fontsource/nunito-sans/latin-ext-600.css';
import './styles.css';

window.addEventListener('DOMContentLoaded', () => {
  new Phaser.Game(phaserConfig);
});
