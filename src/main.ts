import * as Phaser from 'phaser';
import { phaserConfig } from './game/config';
import '@fontsource/poppins/latin-ext-400.css';
import '@fontsource/poppins/latin-ext-500.css';
import '@fontsource/poppins/latin-ext-600.css';
import '@fontsource/poppins/latin-ext-700.css';
import './styles.css';

window.addEventListener('DOMContentLoaded', async () => {
  if ('fonts' in document) {
    await Promise.all([
      document.fonts.load('400 18px "Poppins"'),
      document.fonts.load('500 20px "Poppins"'),
      document.fonts.load('600 21px "Poppins"'),
      document.fonts.load('700 30px "Poppins"')
    ]);
    await document.fonts.ready;
  }

  new Phaser.Game(phaserConfig);
});
