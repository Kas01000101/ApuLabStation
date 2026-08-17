import Phaser from 'phaser';
import { GameState } from '../../systems/GameState';
import { TelemetryService } from '../../systems/TelemetryService';
import { ExportService } from '../../systems/ExportService';
import { AwsClient } from '../../systems/AwsClient';
import { PlaceholderArt } from '../../ui/PlaceholderArt';
import { clearApuLabDom } from '../../ui/domComponents';

export class FinalScene extends Phaser.Scene {
  constructor() {
    super({ key: 'FinalScene' });
  }

  create() {
    clearApuLabDom();
    PlaceholderArt.drawSpaceLabBackground(this);

    const gameState = GameState.getInstance();
    gameState.completeSession();

    TelemetryService.getInstance().recordEvent({
      sceneId: 'FinalScene',
      eventType: 'game_completed',
      payload: {
        participant_code: gameState.participantCode,
        session_mode: gameState.sessionMode,
        session_id: gameState.sessionId,
        started_at: gameState.startedAt,
        completed_at: gameState.completedAt
      }
    });

    AwsClient.finishSession(gameState.sessionId);

    this.renderSummaryDOM();
  }

  private renderSummaryDOM(): void {
    const container = document.getElementById('game-container');
    if (!container) return;

    const existing = document.getElementById('final-summary-dom');
    if (existing) existing.remove();

    const gameState = GameState.getInstance();
    const sessionLabel = gameState.participantCode || 'DEMO';

    const overlay = document.createElement('div');
    overlay.id = 'final-summary-dom';
    overlay.className = 'apulab-overlay';

    overlay.innerHTML = `
      <div class="apulab-card" style="max-width: 760px; text-align: center;">
        <div style="font-size: 3.5rem; margin-bottom: 8px;">🎉🏆🚀</div>
        <div class="apulab-title" style="font-size: 2.4rem; margin-bottom: 4px;">¡MISIÓN COMPLETADA!</div>
        <div class="apulab-subtitle" style="margin-bottom: 20px; color: #00F2FE;">
          Modo: <strong>${gameState.sessionMode.toUpperCase()}</strong> | Código: <strong>${sessionLabel}</strong> | Sesión: ${gameState.sessionId.substring(0, 8)}...
        </div>

        <div style="background: rgba(20, 25, 56, 0.95); border: 2px solid #4D4288; border-radius: 16px; padding: 20px; text-align: left; margin-bottom: 24px;">
          <div style="font-weight: 700; color: #FFD166; font-size: 1.15rem; margin-bottom: 12px; border-bottom: 1px solid #4D4288; padding-bottom: 6px;">
            REGISTRO DE LOGROS DE LA MISIÓN
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 1.05rem; color: #F8F9FA;">
            <div>✅ Señal del Hubble recuperada.</div>
            <div>✅ Marte identificado.</div>
            <div>✅ Rover alimentado de energía.</div>
            <div>✅ Sensores instalados.</div>
            <div>✅ Sistemas calibrados.</div>
            <div>✅ Programa de la misión validado.</div>
            <div>✅ Secuencia de aterrizaje completada.</div>
            <div>✅ Datos científicos enviados.</div>
          </div>
        </div>

        <div style="display: flex; justify-content: center; gap: 12px; flex-wrap: wrap;">
          <button id="export-json-btn" class="apulab-btn-primary" style="background: linear-gradient(180deg, #00F2FE 0%, #00C6FF 100%); color: #0B0E26;">
            📥 EXPORTAR JSON
          </button>
          <button id="export-csv-btn" class="apulab-btn-primary" style="background: linear-gradient(180deg, #00F2FE 0%, #00C6FF 100%); color: #0B0E26;">
            📊 EXPORTAR CSV
          </button>
          <button id="restart-game-btn" class="apulab-btn-secondary">
            🔄 REINICIAR MISIÓN
          </button>
        </div>
      </div>
    `;

    container.appendChild(overlay);

    const jsonBtn = document.getElementById('export-json-btn');
    if (jsonBtn) {
      jsonBtn.onclick = () => {
        TelemetryService.getInstance().recordEvent({
          sceneId: 'FinalScene',
          eventType: 'export_json_clicked'
        });
        ExportService.exportJSON();
      };
    }

    const csvBtn = document.getElementById('export-csv-btn');
    if (csvBtn) {
      csvBtn.onclick = () => {
        TelemetryService.getInstance().recordEvent({
          sceneId: 'FinalScene',
          eventType: 'export_csv_clicked'
        });
        ExportService.exportCSV();
      };
    }

    const restartBtn = document.getElementById('restart-game-btn');
    if (restartBtn) {
      restartBtn.onclick = () => {
        overlay.remove();
        window.location.reload();
      };
    }
  }
}
