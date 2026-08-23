import * as Phaser from 'phaser';
import { HUBBLE_CHALLENGES } from '../../data/hubbleChallenges';
import { GraphChallengeEngine } from '../../engines/GraphChallengeEngine';
import { TelemetryService } from '../../systems/TelemetryService';
import { GameState } from '../../systems/GameState';
import { PlaceholderArt } from '../../ui/PlaceholderArt';
import { clearApuLabDom } from '../../ui/domComponents';

export class Level2HubbleScene extends Phaser.Scene {
  private challengeIndex: number = 0;
  private engine!: GraphChallengeEngine;
  private challengeStartTime: number = Date.now();
  private feedbackText?: Phaser.GameObjects.Text;
  private logbookText?: Phaser.GameObjects.Text;
  private nodeGraphics: Map<string, Phaser.GameObjects.Container> = new Map();

  constructor() {
    super({ key: 'Level2HubbleScene' });
  }

  create() {
    clearApuLabDom();
    this.challengeIndex = 0;
    this.loadChallenge(0);
  }

  private loadChallenge(index: number): void {
    this.children.removeAll();
    this.nodeGraphics.clear();
    const { width, height } = this.scale;

    // Background Art
    PlaceholderArt.drawSpaceLabBackground(this);
    GameState.getInstance().updateProgress('Level2HubbleScene', 2, '2A_HUBBLE');

    const config = HUBBLE_CHALLENGES[index];
    if (!config) {
      this.scene.start('Level3ProgrammingScene');
      return;
    }

    this.engine = new GraphChallengeEngine(config);
    this.challengeStartTime = Date.now();

    // Log telemetry: challenge_started (Internal IDs stay in English)
    TelemetryService.getInstance().recordEvent({
      sceneId: 'Level2HubbleScene',
      challengeId: '2A_HUBBLE',
      eventType: 'challenge_started'
    });

    // Top Header Box
    const header = this.add.graphics();
    header.fillStyle(0x2D2654, 0.9);
    header.lineStyle(2, 0x00F2FE, 0.8);
    header.fillRoundedRect(20, 15, width - 40, 90, 16);
    header.strokeRoundedRect(20, 15, width - 40, 90, 16);

    this.add.text(40, 30, 'NIVEL 2A: HUBBLE'.toUpperCase(), {
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

    // Hubble Satellite Mascot Icon
    this.add.image(width - 70, 60, 'hubble_dish').setScale(0.6);

    // Draw Edges
    this.drawGraphEdges();

    // Draw Nodes
    this.drawGraphNodes();

    // Side Logbook Box
    const logBg = this.add.graphics();
    logBg.fillStyle(0x141938, 0.9);
    logBg.lineStyle(2, 0x4D4288, 1);
    logBg.fillRoundedRect(width - 340, 120, 320, 480, 16);
    logBg.strokeRoundedRect(width - 340, 120, 320, 480, 16);

    this.add.text(width - 320, 135, '📋 REGISTRO DE SEÑAL', {
      fontFamily: 'Space Grotesk, sans-serif',
      fontSize: '20px',
      color: '#FFD166',
      fontStyle: 'bold'
    });

    this.logbookText = this.add.text(width - 320, 175, '', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '15px',
      color: '#E2E8F0',
      wordWrap: { width: 280 }
    });

    // Feedback Text Area (Bottom)
    this.feedbackText = this.add.text(40, 610, '', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '20px',
      color: '#FFD166',
      fontStyle: 'bold'
    });

    // HTML DOM Action Buttons Overlay (PROBAR RUTA, PISTA, REINICIAR RUTA)
    this.createControlsDOM('2A_HUBBLE');

    this.updateUI();
  }

  private drawGraphEdges(): void {
    const graphics = this.add.graphics();
    graphics.lineStyle(4, 0x4D4288, 0.8);

    const config = this.engine.config;
    config.edges.forEach(edge => {
      const fromNode = config.nodes.find(n => n.id === edge.from);
      const toNode = config.nodes.find(n => n.id === edge.to);
      if (fromNode && toNode) {
        graphics.beginPath();
        graphics.moveTo(fromNode.x, fromNode.y);
        graphics.lineTo(toNode.x, toNode.y);
        graphics.strokePath();
      }
    });
  }

  private drawGraphNodes(): void {
    const config = this.engine.config;

    config.nodes.forEach(n => {
      const container = this.add.container(n.x, n.y);

      const circle = this.add.graphics();
      circle.name = 'node_circle';
      circle.fillStyle(0x2D2654, 1);
      circle.lineStyle(4, 0x00F2FE, 1);
      circle.fillCircle(0, 0, 32);
      circle.strokeCircle(0, 0, 32);

      const label = this.add.text(0, 0, n.id, {
        fontFamily: 'Space Grotesk, sans-serif',
        fontSize: '22px',
        color: '#FFFFFF',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      container.add([circle, label]);
      container.setSize(64, 64);
      container.setInteractive({ useHandCursor: true });

      container.on('pointerdown', () => {
        const res = this.engine.selectNode(n.id);
        TelemetryService.getInstance().recordEvent({
          sceneId: 'Level2HubbleScene',
          challengeId: '2A_HUBBLE',
          eventType: 'selection_changed',
          payload: { selected_node: n.id, current_path: this.engine.state.currentPath },
          result: res.success ? 'success' : 'error',
          errorCode: res.errorCode
        });

        if (this.feedbackText) this.feedbackText.setText(res.message);

        this.updateUI();
      });

      this.nodeGraphics.set(n.id, container);
    });
  }

  private updateUI(): void {
    const path = this.engine.state.currentPath;

    // Redraw node highlights
    this.engine.config.nodes.forEach(n => {
      const container = this.nodeGraphics.get(n.id);
      if (container) {
        const circle = container.getByName('node_circle') as Phaser.GameObjects.Graphics;
        if (circle) {
          circle.clear();
          const isVisited = path.includes(n.id);
          const isCurrent = path[path.length - 1] === n.id;

          if (isCurrent) {
            circle.fillStyle(0xFFD166, 1);
            circle.lineStyle(5, 0x00F2FE, 1);
          } else if (isVisited) {
            circle.fillStyle(0x00F2FE, 1);
            circle.lineStyle(4, 0xFFFFFF, 1);
          } else {
            circle.fillStyle(0x2D2654, 1);
            circle.lineStyle(4, 0x4D4288, 1);
          }
          circle.fillCircle(0, 0, 32);
          circle.strokeCircle(0, 0, 32);
        }
      }
    });

    // Update Logbook
    if (this.logbookText) {
      const logs = this.engine.state.logbook.slice(-10).join('\n• ');
      this.logbookText.setText('• ' + logs);
    }
  }

  private createControlsDOM(challengeId: string): void {
    const container = document.getElementById('game-container');
    if (!container) return;

    const existing = document.getElementById('hubble-ctrl-dom');
    if (existing) existing.remove();

    const ctrlDiv = document.createElement('div');
    ctrlDiv.id = 'hubble-ctrl-dom';
    ctrlDiv.style.position = 'absolute';
    ctrlDiv.style.bottom = '30px';
    ctrlDiv.style.left = '40px';
    ctrlDiv.style.display = 'flex';
    ctrlDiv.style.gap = '14px';
    ctrlDiv.style.zIndex = '50';

    const testBtn = document.createElement('button');
    testBtn.className = 'apulab-btn-primary';
    testBtn.innerText = '📡 PROBAR RUTA';

    const hintBtn = document.createElement('button');
    hintBtn.className = 'apulab-btn-secondary';
    hintBtn.innerText = '💡 PISTA';

    const resetBtn = document.createElement('button');
    resetBtn.className = 'apulab-btn-secondary';
    resetBtn.innerText = '🔄 REINICIAR RUTA';

    testBtn.onclick = () => {
      const res = this.engine.testRoute();
      const durationSeconds = Math.round((Date.now() - this.challengeStartTime) / 1000);

      TelemetryService.getInstance().recordEvent({
        sceneId: 'Level2HubbleScene',
        challengeId,
        eventType: 'solution_submitted',
        attemptNumber: this.engine.state.attempts,
        payload: { path: this.engine.state.currentPath },
        result: res.success ? 'success' : 'failed',
        errorCode: res.errorCode,
        hintUsed: this.engine.state.hintUsed,
        durationSeconds
      });

      if (this.feedbackText) this.feedbackText.setText(res.feedback);

      TelemetryService.getInstance().recordEvent({
        sceneId: 'Level2HubbleScene',
        challengeId,
        eventType: 'feedback_shown',
        payload: { feedback: res.feedback, result: res.success ? 'success' : 'failed' }
      });

      TelemetryService.getInstance().recordEvent({
        sceneId: 'Level2HubbleScene',
        challengeId,
        eventType: 'attempt_finished',
        attemptNumber: this.engine.state.attempts,
        payload: { path: this.engine.state.currentPath },
        result: res.success ? 'success' : 'failed',
        errorCode: res.errorCode,
        hintUsed: this.engine.state.hintUsed,
        durationSeconds
      });

      if (res.success) {
        // Record completed
        TelemetryService.getInstance().recordEvent({
          sceneId: 'Level2HubbleScene',
          challengeId,
          eventType: 'challenge_completed',
          attemptNumber: this.engine.state.attempts,
          durationSeconds
        });

        GameState.getInstance().recordChallengeResult({
          challengeId,
          attempts: this.engine.state.attempts,
          completed: true,
          hintsUsed: this.engine.state.hintUsed,
          durationSeconds
        });

        setTimeout(() => {
          ctrlDiv.remove();
          this.scene.start('Level3ProgrammingScene');
        }, 1800);
      }
    };

    hintBtn.onclick = () => {
      const hintMsg = this.engine.requestHint();
      TelemetryService.getInstance().recordEvent({
        sceneId: 'Level2HubbleScene',
        challengeId,
        eventType: 'hint_requested',
        hintUsed: true
      });
      if (this.feedbackText) this.feedbackText.setText('PISTA: ' + hintMsg);
    };

    resetBtn.onclick = () => {
      this.engine.resetPath();
      if (this.feedbackText) this.feedbackText.setText('Ruta reiniciada en el Punto A.');
      this.updateUI();
    };

    ctrlDiv.appendChild(testBtn);
    ctrlDiv.appendChild(hintBtn);
    ctrlDiv.appendChild(resetBtn);

    container.appendChild(ctrlDiv);
  }
}
