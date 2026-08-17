import * as Phaser from 'phaser';
import { PROGRAMMING_CHALLENGES, LANDING_PHASES } from '../../data/programmingChallenges';
import { ProgramGridEngine, Orientation } from '../../engines/ProgramGridEngine';
import { GridCommand } from '../../types/challenges';
import { TelemetryService } from '../../systems/TelemetryService';
import { GameState } from '../../systems/GameState';
import { PlaceholderArt } from '../../ui/PlaceholderArt';
import { clearApuLabDom } from '../../ui/domComponents';

export class Level3ProgrammingScene extends Phaser.Scene {
  private stageIndex: number = 0; // 0 = 3A, 1 = 3B, 2 = 3C
  private currentCommands: GridCommand[] = [];
  private isSimulating: boolean = false;
  private attemptCount: number = 0;

  // 3C Landing state
  private landingPhaseIndex: number = 0;
  private selectedLandingAction: string = '';
  private selectedLandingReason: string = '';
  private landingAttempts: number = 0;

  constructor() {
    super({ key: 'Level3ProgrammingScene' });
  }

  create() {
    clearApuLabDom();
    this.stageIndex = 0;
    this.loadStage(0);
  }

  private loadStage(index: number): void {
    this.children.removeAll();
    this.currentCommands = [];
    this.isSimulating = false;
    this.attemptCount = 0;

    if (index < 2) {
      this.renderGridStage(index);
    } else {
      this.landingPhaseIndex = 0;
      this.renderLandingStage();
    }
  }

  // ==========================================
  // STAGES 3A & 3B: GRID PROGRAMMING
  // ==========================================
  private renderGridStage(index: number): void {
    const { width, height } = this.scale;
    PlaceholderArt.drawSpaceLabBackground(this);

    const config = PROGRAMMING_CHALLENGES[index];
    GameState.getInstance().updateProgress('Level3ProgrammingScene', 3, config.id);
    TelemetryService.getInstance().recordEvent({
      sceneId: 'Level3ProgrammingScene',
      challengeId: config.id,
      eventType: 'challenge_started'
    });

    // Draw Grid on Phaser Canvas
    const gridOriginX = 100;
    const gridOriginY = 160;
    const tileSize = 70;

    const graphics = this.add.graphics();
    graphics.lineStyle(2, 0x4D4288, 1);

    for (let r = 0; r < config.gridSize.rows; r++) {
      for (let c = 0; c < config.gridSize.cols; c++) {
        const x = gridOriginX + c * tileSize;
        const y = gridOriginY + r * tileSize;
        graphics.fillStyle(0x141938, 0.9);
        graphics.fillRoundedRect(x, y, tileSize - 4, tileSize - 4, 8);
        graphics.strokeRoundedRect(x, y, tileSize - 4, tileSize - 4, 8);
      }
    }

    // Draw Obstacles
    config.obstacles.forEach(obs => {
      const ox = gridOriginX + obs.x * tileSize + tileSize / 2 - 2;
      const oy = gridOriginY + obs.y * tileSize + tileSize / 2 - 2;
      const obsG = this.add.graphics();
      obsG.fillStyle(0xFF6B6B, 0.8);
      obsG.fillCircle(ox, oy, 22);
      this.add.text(ox, oy, '🪨', { fontSize: '24px' }).setOrigin(0.5);
    });

    // Draw Goal Flag
    const gx = gridOriginX + config.goal.x * tileSize + tileSize / 2 - 2;
    const gy = gridOriginY + config.goal.y * tileSize + tileSize / 2 - 2;
    this.add.text(gx, gy, '🚩', { fontSize: '32px' }).setOrigin(0.5);

    // Rover Container
    const rx = gridOriginX + config.start.x * tileSize + tileSize / 2 - 2;
    const ry = gridOriginY + config.start.y * tileSize + tileSize / 2 - 2;
    const roverSprite = this.add.image(rx, ry, 'rover_avatar').setScale(0.45);
    roverSprite.name = 'rover_sprite';

    // Top Header Banner
    this.add.text(40, 30, config.title.toUpperCase(), {
      fontFamily: 'Space Grotesk, sans-serif',
      fontSize: '28px',
      color: '#00F2FE',
      fontStyle: 'bold'
    });

    this.add.text(40, 68, config.instruction, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '18px',
      color: '#F8F9FA'
    });

    // Create Side DOM Editor for building sequence
    this.createGridEditorDOM(index);
  }

  private createGridEditorDOM(index: number): void {
    const container = document.getElementById('game-container');
    if (!container) return;

    const existing = document.getElementById('prog-grid-dom');
    if (existing) existing.remove();

    const config = PROGRAMMING_CHALLENGES[index];

    const editorDiv = document.createElement('div');
    editorDiv.id = 'prog-grid-dom';
    editorDiv.style.position = 'absolute';
    editorDiv.style.right = '30px';
    editorDiv.style.top = '120px';
    editorDiv.style.width = '480px';
    editorDiv.style.background = 'rgba(45, 38, 84, 0.95)';
    editorDiv.style.border = '3px solid #4D4288';
    editorDiv.style.borderRadius = '20px';
    editorDiv.style.padding = '20px';
    editorDiv.style.zIndex = '50';

    const cmdButtonsHtml = config.availableCommands.map(cmd => {
      let label = cmd.replace(/_/g, ' ');
      if (cmd === 'MOVE_FORWARD') label = '⬆️ AVANZAR';
      else if (cmd === 'TURN_LEFT') label = '↩️ GIRAR IZQUIERDA';
      else if (cmd === 'TURN_RIGHT') label = '↪️ GIRAR DERECHA';
      else if (cmd === 'REPEAT_2_MOVE') label = '🔁 REPETIR x2 AVANZAR';
      else if (cmd === 'REPEAT_3_MOVE') label = '🔁 REPETIR x3 AVANZAR';

      return `<button class="apulab-btn-secondary add-cmd-btn" data-cmd="${cmd}" style="font-size: 0.9rem; padding: 8px 12px; margin: 4px;">${label}</button>`;
    }).join('');

    editorDiv.innerHTML = `
      <div style="font-weight: 700; color: #00F2FE; font-size: 1.2rem; margin-bottom: 8px;">PALETA DE COMANDOS</div>
      <div style="display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 16px;">
        ${cmdButtonsHtml}
      </div>

      <div style="font-weight: 700; color: #FFD166; font-size: 1.1rem; margin-bottom: 8px; display: flex; justify-content: space-between;">
        <span>SECUENCIA DEL PROGRAMA</span>
        <span id="block-count-label">Bloques: 0 ${config.blockLimit ? `/ Máx ${config.blockLimit}` : ''}</span>
      </div>

      <div id="program-queue-box" style="background: #141938; border: 2px solid #4D4288; border-radius: 12px; padding: 12px; min-height: 120px; max-height: 160px; overflow-y: auto; display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px;">
        <span style="color: #B8C2CC; font-style: italic;">Aún no agregaste comandos. Haz clic en la paleta arriba.</span>
      </div>

      <div id="prog-feedback" style="font-weight: 700; color: #FFD166; min-height: 24px; margin-bottom: 12px;"></div>

      <div style="display: flex; justify-content: space-between; gap: 10px;">
        <button id="clear-prog-btn" class="apulab-btn-secondary" style="margin: 0;">🗑️ LIMPIAR</button>
        <button id="run-sim-btn" class="apulab-btn-primary" style="margin: 0; padding: 10px 24px;">🚀 INICIAR SIMULACIÓN</button>
      </div>
    `;

    container.appendChild(editorDiv);

    // Event listeners
    editorDiv.querySelectorAll('.add-cmd-btn').forEach(btn => {
      (btn as HTMLButtonElement).onclick = (e) => {
        if (this.isSimulating) return;
        const cmd = (e.currentTarget as HTMLButtonElement).getAttribute('data-cmd') as GridCommand;
        this.currentCommands.push(cmd);
        this.updateProgramQueueUI(config);

        TelemetryService.getInstance().recordEvent({
          sceneId: 'Level3ProgrammingScene',
          challengeId: config.id,
          eventType: 'program_changed',
          payload: { command_added: cmd, current_program: this.currentCommands }
        });
      };
    });

    const clearBtn = document.getElementById('clear-prog-btn');
    if (clearBtn) {
      clearBtn.onclick = () => {
        if (this.isSimulating) return;
        this.currentCommands = [];
        this.updateProgramQueueUI(config);
      };
    }

    const runBtn = document.getElementById('run-sim-btn');
    if (runBtn) {
      runBtn.onclick = () => {
        if (this.isSimulating || this.currentCommands.length === 0) return;
        this.runSimulationAnimation(index);
      };
    }
  }

  private updateProgramQueueUI(config: any): void {
    const queueBox = document.getElementById('program-queue-box');
    const countLabel = document.getElementById('block-count-label');
    if (!queueBox) return;

    if (countLabel) {
      countLabel.innerText = `Bloques: ${this.currentCommands.length} ${config.blockLimit ? `/ Máx ${config.blockLimit}` : ''}`;
    }

    if (this.currentCommands.length === 0) {
      queueBox.innerHTML = `<span style="color: #B8C2CC; font-style: italic;">Aún no agregaste comandos. Haz clic en la paleta arriba.</span>`;
      return;
    }

    const commandLabels: Record<string, string> = {
      'MOVE_FORWARD': 'AVANZAR',
      'TURN_LEFT': 'GIRAR IZQUIERDA',
      'TURN_RIGHT': 'GIRAR DERECHA',
      'REPEAT_2_MOVE': 'REPETIR x2 AVANZAR',
      'REPEAT_3_MOVE': 'REPETIR x3 AVANZAR'
    };

    queueBox.innerHTML = this.currentCommands.map((cmd, idx) => `
      <div id="cmd-step-${idx}" style="background: #2D2654; padding: 6px 12px; border-radius: 8px; border: 1px solid #4D4288; color: #FFFFFF; font-weight: 600; font-size: 0.9rem;">
        ${idx + 1}. ${commandLabels[cmd] || cmd}
      </div>
    `).join('');
  }

  private runSimulationAnimation(index: number): void {
    this.isSimulating = true;
    this.attemptCount++;
    const config = PROGRAMMING_CHALLENGES[index];

    const res = ProgramGridEngine.simulateProgram(config, this.currentCommands);

    TelemetryService.getInstance().recordEvent({
      sceneId: 'Level3ProgrammingScene',
      challengeId: config.id,
      eventType: 'simulation_started',
      attemptNumber: this.attemptCount,
      payload: {
        program_sequence: this.currentCommands,
        block_count: this.currentCommands.length,
        loop_used: res.loopUsed,
        repeat_count: res.repeatCount,
        blocks_saved: res.blocksSaved
      }
    });

    const gridOriginX = 100;
    const gridOriginY = 160;
    const tileSize = 70;
    const roverSprite = this.children.getByName('rover_sprite') as Phaser.GameObjects.Image;

    let stepIndex = 0;

    const stepInterval = setInterval(() => {
      if (stepIndex >= res.states.length) {
        clearInterval(stepInterval);
        this.isSimulating = false;

        // Simulation finish handle
        const fb = document.getElementById('prog-feedback');
        if (fb) fb.innerText = res.feedback;

        TelemetryService.getInstance().recordEvent({
          sceneId: 'Level3ProgrammingScene',
          challengeId: config.id,
          eventType: 'feedback_shown',
          payload: { feedback: res.feedback, result: res.success ? 'success' : 'failed' }
        });

        TelemetryService.getInstance().recordEvent({
          sceneId: 'Level3ProgrammingScene',
          challengeId: config.id,
          eventType: 'attempt_finished',
          attemptNumber: this.attemptCount,
          result: res.success ? 'success' : 'failed',
          errorCode: res.errorCode
        });

        if (res.success) {
          TelemetryService.getInstance().recordEvent({
            sceneId: 'Level3ProgrammingScene',
            challengeId: config.id,
            eventType: 'challenge_completed',
            attemptNumber: this.attemptCount
          });
          GameState.getInstance().recordChallengeResult({
            challengeId: config.id,
            attempts: this.attemptCount,
            completed: true,
            hintsUsed: false,
            durationSeconds: 0
          });

          setTimeout(() => {
            const dom = document.getElementById('prog-grid-dom');
            if (dom) dom.remove();
            this.stageIndex++;
            this.loadStage(this.stageIndex);
          }, 1800);
        } else {
          // Return rover to start
          setTimeout(() => {
            if (roverSprite) {
              const rx = gridOriginX + config.start.x * tileSize + tileSize / 2 - 2;
              const ry = gridOriginY + config.start.y * tileSize + tileSize / 2 - 2;
              roverSprite.setPosition(rx, ry);
            }
          }, 1500);
        }
        return;
      }

      const st = res.states[stepIndex];
      if (roverSprite) {
        const targetX = gridOriginX + st.x * tileSize + tileSize / 2 - 2;
        const targetY = gridOriginY + st.y * tileSize + tileSize / 2 - 2;
        roverSprite.setPosition(targetX, targetY);
      }

      TelemetryService.getInstance().recordEvent({
        sceneId: 'Level3ProgrammingScene',
        challengeId: config.id,
        eventType: 'command_executed',
        payload: { step: stepIndex, state: st }
      });

      stepIndex++;
    }, 450);
  }

  // ==========================================
  // STAGE 3C: LANDING CASE
  // ==========================================
  private renderLandingStage(): void {
    const { width, height } = this.scale;
    this.children.removeAll();
    PlaceholderArt.drawSpaceLabBackground(this);
    GameState.getInstance().updateProgress('Level3ProgrammingScene', 3, '3C_LANDING');

    TelemetryService.getInstance().recordEvent({
      sceneId: 'Level3ProgrammingScene',
      challengeId: '3C_LANDING',
      eventType: 'challenge_started'
    });

    this.renderLandingPhaseUI();
  }

  private renderLandingPhaseUI(): void {
    const container = document.getElementById('game-container');
    if (!container) return;

    const existing = document.getElementById('landing-dom');
    if (existing) existing.remove();

    const phase = LANDING_PHASES[this.landingPhaseIndex];

    const overlay = document.createElement('div');
    overlay.id = 'landing-dom';
    overlay.className = 'apulab-overlay';

    const telemetryLines = Object.entries(phase.telemetryDisplay).map(([k, v]) => `
      <div style="font-size: 1.05rem; color: #F8F9FA;">
        <span style="color: #00F2FE; text-transform: uppercase; font-weight: 700;">${k}:</span> ${v}
      </div>
    `).join('');

    const actionsHtml = phase.actions.map(a => `
      <label style="display: flex; align-items: center; gap: 10px; margin: 8px 0; font-size: 1.05rem; cursor: pointer; color: #F8F9FA;">
        <input type="radio" name="landing_action" value="${a.id}" style="transform: scale(1.2);" />
        ${a.label}
      </label>
    `).join('');

    const reasonsHtml = phase.reasons.map(r => `
      <label style="display: flex; align-items: center; gap: 10px; margin: 8px 0; font-size: 1.05rem; cursor: pointer; color: #F8F9FA;">
        <input type="radio" name="landing_reason" value="${r.id}" style="transform: scale(1.2);" />
        ${r.label}
      </label>
    `).join('');

    overlay.innerHTML = `
      <div class="apulab-card" style="max-width: 780px; text-align: left;">
        <div class="apulab-title" style="font-size: 1.8rem; margin-bottom: 4px;">NIVEL 3C: SECUENCIA DE DECISIÓN DE ATERRIZAJE EN MARTE</div>
        <div class="apulab-subtitle" style="margin-bottom: 16px; color: #E2E8F0;">
          Paso ${this.landingPhaseIndex + 1} de 4: <strong>${phase.phaseName}</strong>
        </div>

        <div style="background: #0B0E26; border: 2px solid #00F2FE; border-radius: 14px; padding: 14px; margin-bottom: 16px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;">
          ${telemetryLines}
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
          <div style="background: rgba(20, 25, 56, 0.8); border: 2px solid #4D4288; border-radius: 12px; padding: 14px;">
            <div style="font-weight: 700; color: #FFD166; margin-bottom: 8px;">1. Selecciona la Acción Correcta:</div>
            ${actionsHtml}
          </div>

          <div style="background: rgba(20, 25, 56, 0.8); border: 2px solid #4D4288; border-radius: 12px; padding: 14px;">
            <div style="font-weight: 700; color: #FFD166; margin-bottom: 8px;">2. Selecciona la Razón Científica:</div>
            ${reasonsHtml}
          </div>
        </div>

        <div id="landing-feedback" style="font-weight: 700; color: #FFD166; min-height: 24px; margin-bottom: 12px;"></div>

        <div style="text-align: center;">
          <button id="test-landing-btn" class="apulab-btn-primary">🛸 ENVIAR DECISIÓN DE ATERRIZAJE</button>
        </div>
      </div>
    `;

    container.appendChild(overlay);

    const testBtn = document.getElementById('test-landing-btn');
    if (testBtn) {
      testBtn.onclick = () => {
        document.getElementsByName('landing_action').forEach(r => {
          if ((r as HTMLInputElement).checked) this.selectedLandingAction = (r as HTMLInputElement).value;
        });
        document.getElementsByName('landing_reason').forEach(r => {
          if ((r as HTMLInputElement).checked) this.selectedLandingReason = (r as HTMLInputElement).value;
        });

        this.landingAttempts++;
        const res = ProgramGridEngine.testLandingPhase(
          this.landingPhaseIndex,
          this.selectedLandingAction,
          this.selectedLandingReason
        );

        TelemetryService.getInstance().recordEvent({
          sceneId: 'Level3ProgrammingScene',
          challengeId: '3C_LANDING',
          eventType: 'solution_submitted',
          attemptNumber: this.landingAttempts,
          payload: {
            phase_id: phase.id,
            selected_action: this.selectedLandingAction,
            selected_reason: this.selectedLandingReason
          },
          result: res.success ? 'success' : 'failed',
          errorCode: res.errorCode
        });

        const fb = document.getElementById('landing-feedback');
        if (fb) fb.innerText = res.feedback;

        TelemetryService.getInstance().recordEvent({
          sceneId: 'Level3ProgrammingScene',
          challengeId: '3C_LANDING',
          eventType: 'feedback_shown',
          payload: { feedback: res.feedback, result: res.success ? 'success' : 'failed' }
        });

        TelemetryService.getInstance().recordEvent({
          sceneId: 'Level3ProgrammingScene',
          challengeId: '3C_LANDING',
          eventType: 'attempt_finished',
          attemptNumber: this.landingAttempts,
          payload: { phase_id: phase.id, selected_action: this.selectedLandingAction, selected_reason: this.selectedLandingReason },
          result: res.success ? 'success' : 'failed',
          errorCode: res.errorCode
        });

        if (res.success) {
          if (this.landingPhaseIndex < LANDING_PHASES.length - 1) {
            setTimeout(() => {
              this.landingPhaseIndex++;
              this.renderLandingPhaseUI();
            }, 1200);
          } else {
            // Completed all 4 phases!
            TelemetryService.getInstance().recordEvent({
              sceneId: 'Level3ProgrammingScene',
              challengeId: '3C_LANDING',
              eventType: 'challenge_completed'
            });
            GameState.getInstance().recordChallengeResult({
              challengeId: '3C_LANDING',
              attempts: this.landingAttempts,
              completed: true,
              hintsUsed: false,
              durationSeconds: 0
            });

            setTimeout(() => {
              overlay.remove();
              this.scene.start('FinalScene');
            }, 1800);
          }
        }
      };
    }
  }
}
