import * as Phaser from 'phaser';
import { INTRO_DIALOGUE_STEPS, IntroDialogueStep } from '../../data/dialogue/intro';
import { GameState } from '../../systems/GameState';
import { TelemetryService } from '../../systems/TelemetryService';
import { PlaceholderArt } from '../../ui/PlaceholderArt';
import { clearApuLabDom, createOverlay } from '../../ui/domComponents';

export class OpportunityIntroScene extends Phaser.Scene {
  private stepIndex = 0;

  constructor() {
    super({ key: 'OpportunityIntroScene' });
  }

  create() {
    clearApuLabDom();
    GameState.getInstance().updateProgress('OpportunityIntroScene', 0, INTRO_DIALOGUE_STEPS[0]?.id || 'INTRO_STORY');
    PlaceholderArt.drawSpaceLabBackground(this);
    this.renderCurrentStep();
  }

  private renderCurrentStep(): void {
    const step = INTRO_DIALOGUE_STEPS[this.stepIndex];
    if (!step) {
      this.completeIntro();
      return;
    }

    GameState.getInstance().updateProgress('OpportunityIntroScene', 0, step.id);

    const overlay = createOverlay('opp-intro-dom', this.renderStepHtml(step));
    if (!overlay) return;

    const continueBtn = document.getElementById('opp-continue-btn');
    if (continueBtn) {
      continueBtn.onclick = () => {
        TelemetryService.getInstance().recordEvent({
          sceneId: 'OpportunityIntroScene',
          eventType: 'solution_changed',
          payload: {
            intro_step_id: step.id,
            intro_step_kind: step.kind,
            intro_step_index: this.stepIndex
          }
        });
        this.stepIndex++;
        this.renderCurrentStep();
      };
    }
  }

  private renderStepHtml(step: IntroDialogueStep): string {
    const isFinalStep = this.stepIndex === INTRO_DIALOGUE_STEPS.length - 1;
    const emphasis = step.emphasis
      ? `<p style="font-size: 1.2rem; line-height: 1.6; color: #00F2FE; margin-top: 12px; font-weight: 700;">${step.emphasis}</p>`
      : '';

    return `
      <div class="apulab-card" style="max-width: 700px;">
        <div style="display: flex; align-items: center; justify-content: center; gap: 20px; margin-bottom: 16px;">
          <img src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><circle cx='50' cy='50' r='45' fill='%2300F2FE' opacity='0.3'/><rect x='30' y='45' width='40' height='25' fill='%23FFD166'/><circle cx='35' cy='75' r='8' fill='%233B326B'/><circle cx='65' cy='75' r='8' fill='%233B326B'/><circle cx='50' cy='25' r='8' fill='%2300F2FE'/><rect x='48' y='25' width='4' height='20' fill='%234D4288'/></svg>" width="90" height="90" alt="Opportunity Rover" />
          <div style="text-align: left;">
            <div class="apulab-title" style="margin-bottom: 4px;">${step.title}</div>
            <div class="apulab-subtitle" style="margin: 0; color: #00F2FE;">${step.subtitle || ''}</div>
          </div>
        </div>

        <div style="background: rgba(20, 25, 56, 0.7); border: 2px solid var(--panel-border); border-radius: 16px; padding: 20px; margin-bottom: 24px; text-align: left;">
          <p style="font-size: 1.18rem; line-height: 1.6; color: #F8F9FA;">${step.body}</p>
          ${emphasis}
        </div>

        <div class="apulab-progress-indicator" style="margin-bottom: 14px;">
          Paso ${this.stepIndex + 1} de ${INTRO_DIALOGUE_STEPS.length}
        </div>
        <button id="opp-continue-btn" class="apulab-btn-primary">${isFinalStep ? 'ENTRAR AL LABORATORIO' : 'CONTINUAR'}</button>
      </div>
    `;
  }

  private completeIntro(): void {
    TelemetryService.getInstance().recordEvent({
      sceneId: 'OpportunityIntroScene',
      eventType: 'opportunity_intro_completed',
      payload: {
        intro_step_count: INTRO_DIALOGUE_STEPS.length
      }
    });
    clearApuLabDom();
    this.scene.start('Level1RoverLabScene');
  }
}
