import * as Phaser from 'phaser';
import { GameState } from '../../systems/GameState';
import { PlaceholderArt } from '../../ui/PlaceholderArt';
import {
  clearApuLabDom,
  createDisabledButton,
  createPrimaryButton,
  createSecondaryButton,
  getGameContainer
} from '../../ui/domComponents';

export class MainMenuScene extends Phaser.Scene {
  private creditsOverlay?: HTMLDivElement;

  constructor() {
    super({ key: 'MainMenuScene' });
  }

  create() {
    clearApuLabDom();
    const { width } = this.scale;

    PlaceholderArt.drawSpaceLabBackground(this);

    const panel = this.add.graphics();
    panel.fillStyle(0x2D2654, 0.85);
    panel.lineStyle(3, 0x4D4288, 1);
    panel.fillRoundedRect(width / 2 - 360, 60, 720, 190, 24);
    panel.strokeRoundedRect(width / 2 - 360, 60, 720, 190, 24);

    const titleText = this.add.text(width / 2, 115, 'APULAB STATION', {
      fontFamily: 'Space Grotesk, sans-serif',
      fontSize: '52px',
      color: '#00F2FE',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    titleText.setShadow(0, 0, '#00F2FE', 16, true, true);

    this.add.text(width / 2, 185, 'Explora, experimenta y crea tu misión.', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '22px',
      color: '#F8F9FA'
    }).setOrigin(0.5);

    this.add.image(width / 2 - 280, 155, 'rover_avatar').setScale(0.8);
    this.createUIOverlay();
  }

  private createUIOverlay(): void {
    const container = getGameContainer();
    if (!container) return;

    document.getElementById('main-menu-dom')?.remove();

    const domDiv = document.createElement('div');
    domDiv.id = 'main-menu-dom';
    domDiv.dataset.apulabUi = 'true';
    domDiv.className = 'apulab-action-stack';
    domDiv.style.position = 'absolute';
    domDiv.style.top = '300px';
    domDiv.style.left = '50%';
    domDiv.style.transform = 'translateX(-50%)';
    domDiv.style.zIndex = '50';

    const startBtn = createPrimaryButton('INICIAR MISIÓN', () => {
      clearApuLabDom();
      this.scene.start('ParticipantCodeScene');
    });
    startBtn.style.fontSize = '1.6rem';
    startBtn.style.padding = '16px 50px';

    const continueBtn = GameState.hasRecoverableSession()
      ? createSecondaryButton('CONTINUAR', () => {
        const gameState = GameState.getInstance();
        gameState.restoreSessionState();
        clearApuLabDom();
        this.scene.start(gameState.currentScene || 'OpportunityIntroScene');
      })
      : createDisabledButton('CONTINUAR');

    const settingsBtn = createSecondaryButton('AJUSTES', () => {
      window.alert('Control de audio y volumen estará disponible en la versión v0.2.');
    });

    const creditsBtn = createSecondaryButton('CRÉDITOS', () => this.showCreditsModal());

    domDiv.append(startBtn, continueBtn, settingsBtn, creditsBtn);
    container.appendChild(domDiv);
  }

  private showCreditsModal(): void {
    const container = getGameContainer();
    if (!container) return;

    this.creditsOverlay = document.createElement('div');
    this.creditsOverlay.className = 'apulab-overlay';
    this.creditsOverlay.dataset.apulabUi = 'true';
    this.creditsOverlay.innerHTML = `
      <div class="apulab-card">
        <div class="apulab-title">APULAB STATION</div>
        <div class="apulab-subtitle">Juego educativo STEM - Piloto Web v0.1</div>
        <p style="font-size: 1.1rem; line-height: 1.6; color: #E2E8F0; margin-bottom: 24px;">
          Desarrollado para investigación y aprendizaje de ciencias y tecnología.
        </p>
        <button id="close-credits-btn" class="apulab-btn-primary">CERRAR</button>
      </div>
    `;

    container.appendChild(this.creditsOverlay);

    document.getElementById('close-credits-btn')?.addEventListener('click', () => {
      this.creditsOverlay?.remove();
    });
  }
}
