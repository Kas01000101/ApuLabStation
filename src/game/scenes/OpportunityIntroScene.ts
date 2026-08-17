import Phaser from 'phaser';
import { GameState } from '../../systems/GameState';
import { TelemetryService } from '../../systems/TelemetryService';
import { PlaceholderArt } from '../../ui/PlaceholderArt';
import { clearApuLabDom } from '../../ui/domComponents';

export class OpportunityIntroScene extends Phaser.Scene {
  constructor() {
    super({ key: 'OpportunityIntroScene' });
  }

  create() {
    clearApuLabDom();
    GameState.getInstance().updateProgress('OpportunityIntroScene', 0, 'INTRO_STORY');
    PlaceholderArt.drawSpaceLabBackground(this);
    this.createDOMOverlay();
  }

  private createDOMOverlay(): void {
    const container = document.getElementById('game-container');
    if (!container) return;

    const existing = document.getElementById('opp-intro-dom');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'opp-intro-dom';
    overlay.className = 'apulab-overlay';
    overlay.innerHTML = `
      <div class="apulab-card" style="max-width: 700px;">
        <div style="display: flex; align-items: center; justify-content: center; gap: 20px; margin-bottom: 16px;">
          <img src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><circle cx='50' cy='50' r='45' fill='%2300F2FE' opacity='0.3'/><rect x='30' y='45' width='40' height='25' fill='%23FFD166'/><circle cx='35' cy='75' r='8' fill='%233B326B'/><circle cx='65' cy='75' r='8' fill='%233B326B'/><circle cx='50' cy='25' r='8' fill='%2300F2FE'/><rect x='48' y='25' width='4' height='20' fill='%234D4288'/></svg>" width="90" height="90" alt="Opportunity Rover" />
          <div style="text-align: left;">
            <div class="apulab-title" style="margin-bottom: 4px;">CONOCE A OPPORTUNITY</div>
            <div class="apulab-subtitle" style="margin: 0; color: #00F2FE;">Tu Compañero Rover Holográfico</div>
          </div>
        </div>

        <div style="background: rgba(20, 25, 56, 0.7); border: 2px solid var(--panel-border); border-radius: 16px; padding: 20px; margin-bottom: 24px; text-align: left;">
          <p style="font-size: 1.12rem; line-height: 1.55; color: #E2E8F0; margin-bottom: 12px;">
            La estación ApuLab recibió una misión urgente: preparar un rover para explorar, observar el espacio con ayuda del Hubble y programar una secuencia segura hacia Marte.
          </p>
          <p style="font-size: 1.12rem; line-height: 1.55; color: #FFD166; margin-bottom: 12px; font-weight: 700;">
            Katherine Johnson mostró cómo las matemáticas podían guiar misiones espaciales reales. Hoy usarás ese mismo espíritu de precisión y curiosidad.
          </p>
          <p style="font-size: 1.25rem; line-height: 1.6; color: #F8F9FA;">
            "Hola, soy <strong>Opportunity</strong>. Un rover es un robot explorador. Tiene ruedas, cámaras, sensores, una computadora y una antena."
          </p>
          <p style="font-size: 1.25rem; line-height: 1.6; color: #00F2FE; margin-top: 12px; font-weight: 600;">
            ¡Hoy prepararás una nueva misión!
          </p>
        </div>

        <button id="opp-continue-btn" class="apulab-btn-primary">CONTINUAR ➔</button>
      </div>
    `;

    container.appendChild(overlay);

    const continueBtn = document.getElementById('opp-continue-btn');
    if (continueBtn) {
      continueBtn.onclick = () => {
        TelemetryService.getInstance().recordEvent({
          sceneId: 'OpportunityIntroScene',
          eventType: 'opportunity_intro_completed'
        });
        overlay.remove();
        this.scene.start('Level2RoverLabScene');
      };
    }
  }
}
