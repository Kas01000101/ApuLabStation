import Phaser from 'phaser';
import { GameState } from '../../systems/GameState';
import { TelemetryService } from '../../systems/TelemetryService';
import { AwsClient } from '../../systems/AwsClient';
import { PlaceholderArt } from '../../ui/PlaceholderArt';

export class ParticipantCodeScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ParticipantCodeScene' });
  }

  create() {
    PlaceholderArt.drawSpaceLabBackground(this);
    this.createDOMInput();
  }

  private createDOMInput(): void {
    const container = document.getElementById('game-container');
    if (!container) return;

    const existing = document.getElementById('part-code-dom');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'part-code-dom';
    overlay.className = 'apulab-overlay';
    overlay.innerHTML = `
      <div class="apulab-card">
        <div class="apulab-title">IDENTIFICACIÓN</div>
        <div class="apulab-subtitle">Ingresa tu código anónimo de participante.</div>
        <input type="text" id="part-code-input" class="apulab-input" placeholder="APU-001" value="APU-001" maxlength="12" autofocus />
        <div id="code-error-msg" style="color: var(--accent-coral); font-weight: 600; min-height: 24px; margin-bottom: 12px;"></div>
        <div>
          <button id="submit-code-btn" class="apulab-btn-primary">INICIAR MISIÓN ➔</button>
        </div>
      </div>
    `;

    container.appendChild(overlay);

    const inputEl = document.getElementById('part-code-input') as HTMLInputElement;
    const submitBtn = document.getElementById('submit-code-btn');
    const errorEl = document.getElementById('code-error-msg');

    const handleSubmission = () => {
      const code = inputEl.value.trim();
      if (!code) {
        if (errorEl) errorEl.innerText = 'Por favor ingresa un código anónimo de participante válido (ej. APU-001).';
        return;
      }

      // Save state
      const gameState = GameState.getInstance();
      gameState.setParticipantCode(code);

      // Record Telemetry (Keep event names & internal IDs in English)
      TelemetryService.getInstance().recordEvent({
        sceneId: 'ParticipantCodeScene',
        eventType: 'session_started',
        payload: { participant_code: gameState.participantCode, session_id: gameState.sessionId }
      });

      // Optional AWS start call
      AwsClient.startSession(gameState.sessionId, gameState.participantCode);

      // Clean up overlay and go to OpportunityIntroScene
      overlay.remove();
      this.scene.start('OpportunityIntroScene');
    };

    if (submitBtn) submitBtn.onclick = handleSubmission;
    if (inputEl) {
      inputEl.onkeydown = (e) => {
        if (e.key === 'Enter') handleSubmission();
      };
    }
  }
}
