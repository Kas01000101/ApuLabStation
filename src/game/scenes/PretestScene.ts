import Phaser from 'phaser';
import { PRETEST_QUESTIONS } from '../../data/pretestQuestions';
import { GameState } from '../../systems/GameState';
import { TelemetryService } from '../../systems/TelemetryService';
import { PlaceholderArt } from '../../ui/PlaceholderArt';

export class PretestScene extends Phaser.Scene {
  private currentQuestionIndex: number = 0;
  private questionStartTime: number = Date.now();

  constructor() {
    super({ key: 'PretestScene' });
  }

  create() {
    PlaceholderArt.drawSpaceLabBackground(this);

    this.currentQuestionIndex = 0;
    this.questionStartTime = Date.now();
    this.renderQuestion();
  }

  private renderQuestion(): void {
    const container = document.getElementById('game-container');
    if (!container) return;

    const existing = document.getElementById('pretest-dom');
    if (existing) existing.remove();

    const q = PRETEST_QUESTIONS[this.currentQuestionIndex];
    if (!q) {
      this.finishPretest();
      return;
    }

    const overlay = document.createElement('div');
    overlay.id = 'pretest-dom';
    overlay.className = 'apulab-overlay';

    const optionsHtml = q.options.map(opt => `
      <button class="apulab-btn-secondary pretest-opt-btn" data-id="${opt.id}" style="width: 100%; text-align: left; padding: 14px 20px; font-size: 1.15rem; margin: 6px 0; background: #2D2654; border: 2px solid #4D4288; color: #F8F9FA;">
        ${opt.text}
      </button>
    `).join('');

    overlay.innerHTML = `
      <div class="apulab-card" style="max-width: 720px; text-align: left;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <div class="apulab-title" style="font-size: 1.6rem; margin: 0;">EVALUACIÓN INICIAL DE LA MISIÓN</div>
          <div style="background: #141938; padding: 4px 14px; border-radius: 20px; border: 1px solid var(--accent-teal); color: var(--accent-teal); font-weight: 700;">
            Pregunta ${this.currentQuestionIndex + 1} de ${PRETEST_QUESTIONS.length}
          </div>
        </div>
        <p style="font-size: 1.25rem; font-weight: 600; color: #FFFFFF; margin-bottom: 20px; line-height: 1.5;">
          ${q.question}
        </p>
        <div style="display: flex; flex-direction: column;">
          ${optionsHtml}
        </div>
      </div>
    `;

    container.appendChild(overlay);

    this.questionStartTime = Date.now();

    const optButtons = overlay.querySelectorAll('.pretest-opt-btn');
    optButtons.forEach(btn => {
      (btn as HTMLButtonElement).onclick = (e) => {
        const target = e.currentTarget as HTMLButtonElement;
        const optId = target.getAttribute('data-id') || '';
        this.handleAnswer(q.id, optId);
      };
    });
  }

  private handleAnswer(itemId: string, selectedValue: string): void {
    const durationSeconds = Math.max(1, Math.round((Date.now() - this.questionStartTime) / 1000));
    const responseData = {
      phase: 'pretest' as const,
      item_id: itemId,
      value: selectedValue,
      duration_seconds: durationSeconds
    };

    // Save state & telemetry (Keep event types in English)
    GameState.getInstance().addPretestAnswer(responseData);

    TelemetryService.getInstance().recordEvent({
      sceneId: 'PretestScene',
      eventType: 'assessment_response',
      payload: responseData,
      durationSeconds
    });

    this.currentQuestionIndex++;
    this.renderQuestion();
  }

  private finishPretest(): void {
    const existing = document.getElementById('pretest-dom');
    if (existing) existing.remove();

    this.scene.start('Level1HubbleScene');
  }
}
