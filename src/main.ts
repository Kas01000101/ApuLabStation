import * as Phaser from 'phaser';
import { phaserConfig } from './game/config';
import { StarfieldBackground } from './backgrounds/StarfieldBackground';
import '@fontsource/fredoka/latin-ext-600.css';
import '@fontsource/fredoka/latin-ext-700.css';
import '@fontsource/nunito-sans/latin-ext-600.css';
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
      document.fonts.load('700 30px "Poppins"'),
      document.fonts.load('600 30px "Fredoka"'),
      document.fonts.load('700 26px "Fredoka"'),
      document.fonts.load('600 20px "Nunito Sans"')
    ]);
    await document.fonts.ready;
  }

  const backgroundContainer = document.getElementById('three-background');
  if (backgroundContainer) {
    new StarfieldBackground(backgroundContainer).start();
  }

  new Phaser.Game(phaserConfig);
});
