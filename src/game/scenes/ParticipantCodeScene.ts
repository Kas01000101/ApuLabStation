import * as Phaser from 'phaser';
import { GameState } from '../../systems/GameState';
import { TelemetryService } from '../../systems/TelemetryService';
import { getResearchRepository } from '../../systems/research/ResearchRepositoryProvider';
import { PlaceholderArt } from '../../ui/PlaceholderArt';
import { playUiClick } from '../../ui/audio/playUiClick';
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
        <div class="apulab-subtitle">Código de participante</div>
        <input type="text" id="part-code-input" class="apulab-input" placeholder="Ingresa tu código" maxlength="32" autofocus />
        <input type="password" id="part-credential-input" class="apulab-input" placeholder="Contraseña del estudio" maxlength="64" />
        <div id="code-error-msg" style="color: var(--accent-coral); font-weight: 600; min-height: 24px; margin-bottom: 12px;"></div>
        <div style="display: flex; justify-content: center; gap: 12px; flex-wrap: wrap;">
          <button id="submit-code-btn" class="apulab-btn-primary">CONTINUAR CON CÓDIGO</button>
          <button id="skip-code-btn" class="apulab-btn-secondary">JUGAR SIN CÓDIGO</button>
        </div>
      </div>
    `);
    if (!overlay) return;

    const inputEl = document.getElementById('part-code-input') as HTMLInputElement;
    const credentialEl = document.getElementById('part-credential-input') as HTMLInputElement;
    const submitBtn = document.getElementById('submit-code-btn');
    const skipBtn = document.getElementById('skip-code-btn');
    const errorEl = document.getElementById('code-error-msg');

    const startSession = async (mode: 'study' | 'demo') => {
      const rawCode = inputEl.value.trim();
      const credential = credentialEl.value;
      const repository = getResearchRepository();

      if (mode === 'study' && repository.mode === 'mock') {
        if (errorEl) errorEl.innerText = 'El modo de investigación no está activo en este entorno. Usa DEMO para desarrollo.';
        return;
      }

      if (mode === 'study' && (!rawCode || !credential)) {
        if (errorEl) errorEl.innerText = 'Completa código y contraseña del estudio.';
        return;
      }

      const auth = mode === 'study'
        ? await repository.authenticateParticipant({ participantCode: rawCode, credential })
        : null;

      if (mode === 'study' && (!auth?.success || !auth.data)) {
        if (errorEl) errorEl.innerText = 'El código o la contraseña no son correctos.';
        return;
      }

      const gameState = GameState.getInstance();
      gameState.startNewSession(mode, mode === 'study' ? rawCode : null, auth?.data?.participant_id ?? null);
      const sessionResult = await repository.createSession(gameState.getSessionData());
      if (!sessionResult.success) {
        if (errorEl) errorEl.innerText = mode === 'study' ? 'No se pudo iniciar la sesión de estudio.' : 'No se pudo iniciar la sesión demo.';
        return;
      }

      TelemetryService.getInstance().recordEvent({
        sceneId: 'ParticipantCodeScene',
        eventType: 'session_started',
        payload: {
          session_id: gameState.sessionId,
          session_mode: gameState.sessionMode
        }
      });

      clearApuLabDom();
      this.scene.start('OpportunityIntroScene');
    };

    submitBtn?.addEventListener('click', () => {
      playUiClick(this);
      startSession('study');
    });
    skipBtn?.addEventListener('click', () => {
      playUiClick(this);
      startSession('demo');
    });
    inputEl?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        playUiClick(this);
        startSession('study');
      }
    });
  }
}
