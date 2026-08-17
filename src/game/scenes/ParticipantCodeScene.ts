import Phaser from 'phaser';
import { GameState } from '../../systems/GameState';
import { TelemetryService } from '../../systems/TelemetryService';
import { AwsClient } from '../../systems/AwsClient';
import { PlaceholderArt } from '../../ui/PlaceholderArt';
import { clearApuLabDom, createOverlay } from '../../ui/domComponents';

export class ParticipantCodeScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ParticipantCodeScene' });
  }

  create() {
    clearApuLabDom();
    PlaceholderArt.drawSpaceLabBackground(this);
    this.createDOMInput();
  }

  private createDOMInput(): void {
    const overlay = createOverlay('part-code-dom', `
      <div class="apulab-card">
        <div class="apulab-title">INICIAR MISIÓN</div>
        <div class="apulab-subtitle">¿Tienes un código de participante?</div>
        <input type="text" id="part-code-input" class="apulab-input" placeholder="APU-001" maxlength="32" autofocus />
        <div id="code-error-msg" style="color: var(--accent-coral); font-weight: 600; min-height: 24px; margin-bottom: 12px;"></div>
        <div style="display: flex; justify-content: center; gap: 12px; flex-wrap: wrap;">
          <button id="submit-code-btn" class="apulab-btn-primary">CONTINUAR CON CÓDIGO</button>
          <button id="skip-code-btn" class="apulab-btn-secondary">JUGAR SIN CÓDIGO</button>
        </div>
      </div>
    `);
    if (!overlay) return;

    const inputEl = document.getElementById('part-code-input') as HTMLInputElement;
    const submitBtn = document.getElementById('submit-code-btn');
    const skipBtn = document.getElementById('skip-code-btn');
    const errorEl = document.getElementById('code-error-msg');

    const startSession = (mode: 'study' | 'demo') => {
      const rawCode = inputEl.value.trim();
      if (mode === 'study' && !rawCode) {
        if (errorEl) errorEl.innerText = 'Ingresa el código anónimo entregado para el estudio.';
        return;
      }

      const gameState = GameState.getInstance();
      gameState.startNewSession(mode, mode === 'study' ? rawCode : null);

      TelemetryService.getInstance().recordEvent({
        sceneId: 'ParticipantCodeScene',
        eventType: 'session_started',
        payload: {
          session_id: gameState.sessionId,
          session_mode: gameState.sessionMode
        }
      });

      AwsClient.startSession(gameState.sessionId, gameState.participantCode);

      clearApuLabDom();
      this.scene.start('OpportunityIntroScene');
    };

    submitBtn?.addEventListener('click', () => startSession('study'));
    skipBtn?.addEventListener('click', () => startSession('demo'));
    inputEl?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') startSession('study');
    });
  }
}
