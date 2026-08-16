import Phaser from 'phaser';
import { PlaceholderArt } from '../../ui/PlaceholderArt';

export class MainMenuScene extends Phaser.Scene {
  private creditsOverlay?: HTMLDivElement;

  constructor() {
    super({ key: 'MainMenuScene' });
  }

  create() {
    const { width, height } = this.scale;

    // Background Art
    PlaceholderArt.drawSpaceLabBackground(this);

    // Title Panel Container
    const panel = this.add.graphics();
    panel.fillStyle(0x2D2654, 0.85);
    panel.lineStyle(3, 0x4D4288, 1);
    panel.fillRoundedRect(width / 2 - 360, 60, 720, 190, 24);
    panel.strokeRoundedRect(width / 2 - 360, 60, 720, 190, 24);

    // Title
    const titleText = this.add.text(width / 2, 115, 'APULAB STATION', {
      fontFamily: 'Space Grotesk, sans-serif',
      fontSize: '52px',
      color: '#00F2FE',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Title Glow Effect
    titleText.setShadow(0, 0, '#00F2FE', 16, true, true);

    // Subtitle in Spanish
    this.add.text(width / 2, 185, 'Explora, experimenta y crea tu misión.', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '22px',
      color: '#F8F9FA'
    }).setOrigin(0.5);

    // Opportunity Rover Mascot Graphic
    this.add.image(width / 2 - 280, 155, 'rover_avatar').setScale(0.8);

    // HTML DOM Buttons overlay for pixel-perfect child-friendly styling & accessible clicks
    this.createUIOverlay();
  }

  private createUIOverlay(): void {
    const container = document.getElementById('game-container');
    if (!container) return;

    // Clean previous DOM if any
    const existing = document.getElementById('main-menu-dom');
    if (existing) existing.remove();

    const domDiv = document.createElement('div');
    domDiv.id = 'main-menu-dom';
    domDiv.style.position = 'absolute';
    domDiv.style.top = '300px';
    domDiv.style.left = '50%';
    domDiv.style.transform = 'translateX(-50%)';
    domDiv.style.display = 'flex';
    domDiv.style.flexDirection = 'column';
    domDiv.style.alignItems = 'center';
    domDiv.style.gap = '16px';
    domDiv.style.zIndex = '50';

    // INICIAR BOTÓN
    const startBtn = document.createElement('button');
    startBtn.className = 'apulab-btn-primary';
    startBtn.innerText = '🚀 INICIAR MISIÓN';
    startBtn.style.fontSize = '1.6rem';
    startBtn.style.padding = '16px 50px';
    startBtn.onclick = () => {
      domDiv.remove();
      this.scene.start('ParticipantCodeScene');
    };

    // CONTINUAR BOTÓN (disabled)
    const continueBtn = document.createElement('button');
    continueBtn.className = 'apulab-btn-secondary';
    continueBtn.innerText = 'CONTINUAR';
    continueBtn.disabled = true;
    continueBtn.style.opacity = '0.5';
    continueBtn.style.cursor = 'not-allowed';

    // AJUSTES BOTÓN
    const settingsBtn = document.createElement('button');
    settingsBtn.className = 'apulab-btn-secondary';
    settingsBtn.innerText = '⚙️ AJUSTES';
    settingsBtn.onclick = () => {
      alert('Control de audio y volumen estará disponible en la versión v0.2.');
    };

    // CRÉDITOS BOTÓN
    const creditsBtn = document.createElement('button');
    creditsBtn.className = 'apulab-btn-secondary';
    creditsBtn.innerText = '📜 CRÉDITOS';
    creditsBtn.onclick = () => this.showCreditsModal();

    domDiv.appendChild(startBtn);
    domDiv.appendChild(continueBtn);
    domDiv.appendChild(settingsBtn);
    domDiv.appendChild(creditsBtn);

    container.appendChild(domDiv);
  }

  private showCreditsModal(): void {
    const container = document.getElementById('game-container');
    if (!container) return;

    this.creditsOverlay = document.createElement('div');
    this.creditsOverlay.className = 'apulab-overlay';
    this.creditsOverlay.innerHTML = `
      <div class="apulab-card">
        <div class="apulab-title">APULAB STATION</div>
        <div class="apulab-subtitle">Juego Educativo STEM • Piloto Web v0.1</div>
        <p style="font-size: 1.1rem; line-height: 1.6; color: #E2E8F0; margin-bottom: 24px;">
          Desarrollado para la investigación y el aprendizaje de ciencias y tecnología.<br>
          Potenciando el pensamiento computacional y el razonamiento científico.
        </p>
        <button id="close-credits-btn" class="apulab-btn-primary">CERRAR</button>
      </div>
    `;

    container.appendChild(this.creditsOverlay);

    const closeBtn = document.getElementById('close-credits-btn');
    if (closeBtn) {
      closeBtn.onclick = () => {
        if (this.creditsOverlay) this.creditsOverlay.remove();
      };
    }
  }
}
