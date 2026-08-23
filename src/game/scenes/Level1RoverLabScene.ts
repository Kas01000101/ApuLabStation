import * as Phaser from 'phaser';
import { BATTERY_OPTIONS, REASON_OPTIONS, SENSOR_OPTIONS, CALIBRATION_STATIONS } from '../../data/roverChallenges';
import { RoverLabEngine } from '../../engines/RoverLabEngine';
import { TelemetryService } from '../../systems/TelemetryService';
import { GameState } from '../../systems/GameState';
import { PlaceholderArt } from '../../ui/PlaceholderArt';
import { clearApuLabDom } from '../../ui/domComponents';

export class Level1RoverLabScene extends Phaser.Scene {
  private sublevelStage: '2A' | '2B' | '2C' = '2A';
  private engine!: RoverLabEngine;

  // 2A State
  private measuredBatteries: string[] = [];
  private selectedBatteryId: string = '';
  private selectedReasonId: string = '';
  private attempt2A: number = 0;

  // 2B State
  private cardsOpened: string[] = [];
  private selectedSensorIds: string[] = [];
  private sensorSelectionOrder: string[] = [];
  private attempt2B: number = 0;

  // 2C State
  private activeStationIndex: number = 0;
  private stationAdjustSequences: Record<string, number[]> = {};

  constructor() {
    super({ key: 'Level1RoverLabScene' });
  }

  create() {
    clearApuLabDom();
    this.engine = new RoverLabEngine();
    this.sublevelStage = '2A';
    this.renderStage2A();
  }

  // ==========================================
  // SUBLEVEL 2A: MEASURE ENERGY
  // ==========================================
  private renderStage2A(): void {
    const { width, height } = this.scale;
    this.children.removeAll();
    GameState.getInstance().updateProgress('Level1RoverLabScene', 1, '1A_ENERGY');
    PlaceholderArt.drawSpaceLabBackground(this);

    TelemetryService.getInstance().recordEvent({
      sceneId: 'Level1RoverLabScene',
      challengeId: '1A_ENERGY',
      eventType: 'challenge_started'
    });

    const container = document.getElementById('game-container');
    if (!container) return;

    const existing = document.getElementById('rover-lab-dom');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'rover-lab-dom';
    overlay.className = 'apulab-overlay';

    const batCards = BATTERY_OPTIONS.map(bat => `
      <div style="background: #141938; border: 2px solid #4D4288; border-radius: 16px; padding: 16px; width: 180px; text-align: center;">
        <div style="font-weight: 700; color: var(--accent-teal); font-size: 1.2rem; margin-bottom: 8px;">${bat.label.split(' ')[0]} ${bat.label.split(' ')[1]}</div>
        <button class="apulab-btn-secondary measure-bat-btn" data-id="${bat.id}" style="font-size: 0.95rem; padding: 8px 16px; margin: 4px 0;">⚡ MEDIR</button>
        <div id="val-${bat.id}" style="font-weight: 700; font-size: 1.2rem; color: #FFD166; min-height: 28px; margin-top: 6px;">? V</div>
        <button class="apulab-btn-primary select-bat-btn" data-id="${bat.id}" style="font-size: 0.9rem; padding: 6px 14px; margin-top: 8px;">SELECCIONAR</button>
      </div>
    `).join('');

    const reasonOptsHtml = REASON_OPTIONS.map(rsn => `
      <label style="display: flex; align-items: center; gap: 10px; margin: 8px 0; font-size: 1.05rem; cursor: pointer; color: #F8F9FA;">
        <input type="radio" name="bat_reason" value="${rsn.id}" style="transform: scale(1.2);" />
        ${rsn.label}
      </label>
    `).join('');

    overlay.innerHTML = `
      <div class="apulab-card" style="max-width: 780px; text-align: left;">
        <div class="apulab-title" style="font-size: 1.8rem; margin-bottom: 4px;">NIVEL 1A: ENERGÍA DEL ROVER</div>
        <div class="apulab-subtitle" style="margin-bottom: 16px; color: #E2E8F0;">
          Potencia Operativa Objetivo: <strong>12.0 V a 13.0 V</strong>. Mide las baterías y selecciona la opción segura.
        </div>

        <div style="display: flex; justify-content: space-around; margin-bottom: 20px;">
          ${batCards}
        </div>

        <div style="background: rgba(20, 25, 56, 0.8); border: 2px solid var(--panel-border); border-radius: 14px; padding: 16px; margin-bottom: 16px;">
          <div style="font-weight: 700; color: #00F2FE; margin-bottom: 8px;">¿Por qué es correcta esta opción de batería?</div>
          ${reasonOptsHtml}
        </div>

        <div id="bat-feedback" style="font-weight: 700; color: #FFD166; min-height: 24px; margin-bottom: 12px;"></div>

        <div style="text-align: center;">
          <button id="test-battery-btn" class="apulab-btn-primary">⚡ PROBAR BATERÍA</button>
        </div>
      </div>
    `;

    container.appendChild(overlay);

    // Event listeners
    overlay.querySelectorAll('.measure-bat-btn').forEach(btn => {
      (btn as HTMLButtonElement).onclick = (e) => {
        const id = (e.currentTarget as HTMLButtonElement).getAttribute('data-id') || '';
        const bat = BATTERY_OPTIONS.find(b => b.id === id);
        if (bat) {
          if (!this.measuredBatteries.includes(id)) this.measuredBatteries.push(id);
          const valEl = document.getElementById(`val-${id}`);
          if (valEl) valEl.innerText = `${bat.voltage} V`;
        }
      };
    });

    overlay.querySelectorAll('.select-bat-btn').forEach(btn => {
      (btn as HTMLButtonElement).onclick = (e) => {
        this.selectedBatteryId = (e.currentTarget as HTMLButtonElement).getAttribute('data-id') || '';
        const fb = document.getElementById('bat-feedback');
        const bat = BATTERY_OPTIONS.find(b => b.id === this.selectedBatteryId);
        if (fb && bat) fb.innerText = `Seleccionaste ${bat.label}. Elige tu explicación y haz clic en Probar Batería.`;
      };
    });

    const testBtn = document.getElementById('test-battery-btn');
    if (testBtn) {
      testBtn.onclick = () => {
        const radios = document.getElementsByName('bat_reason');
        radios.forEach(r => {
          if ((r as HTMLInputElement).checked) this.selectedReasonId = (r as HTMLInputElement).value;
        });

        this.attempt2A++;
        const res = RoverLabEngine.testBatterySelection(this.selectedBatteryId, this.selectedReasonId, this.attempt2A);

        TelemetryService.getInstance().recordEvent({
          sceneId: 'Level1RoverLabScene',
          challengeId: '1A_ENERGY',
          eventType: 'solution_submitted',
          attemptNumber: this.attempt2A,
          payload: {
            batteries_measured: this.measuredBatteries,
            measurement_order: this.measuredBatteries,
            selected_battery: this.selectedBatteryId,
            selected_reason: this.selectedReasonId
          },
          result: res.success ? 'success' : 'failed',
          errorCode: res.errorCode
        });

        const fb = document.getElementById('bat-feedback');
        if (fb) fb.innerText = res.feedback;

        TelemetryService.getInstance().recordEvent({
          sceneId: 'Level1RoverLabScene',
          challengeId: '1A_ENERGY',
          eventType: 'feedback_shown',
          payload: { feedback: res.feedback, result: res.success ? 'success' : 'failed' }
        });

        TelemetryService.getInstance().recordEvent({
          sceneId: 'Level1RoverLabScene',
          challengeId: '1A_ENERGY',
          eventType: 'attempt_finished',
          attemptNumber: this.attempt2A,
          payload: { selected_battery: this.selectedBatteryId, selected_reason: this.selectedReasonId },
          result: res.success ? 'success' : 'failed',
          errorCode: res.errorCode
        });

        if (res.success) {
          TelemetryService.getInstance().recordEvent({
            sceneId: 'Level1RoverLabScene',
            challengeId: '1A_ENERGY',
            eventType: 'challenge_completed',
            attemptNumber: this.attempt2A
          });
          GameState.getInstance().recordChallengeResult({
            challengeId: '1A_ENERGY',
            attempts: this.attempt2A,
            completed: true,
            hintsUsed: false,
            durationSeconds: 0
          });

          setTimeout(() => {
            overlay.remove();
            this.sublevelStage = '2B';
            this.renderStage2B();
          }, 1800);
        }
      };
    }
  }

  // ==========================================
  // SUBLEVEL 2B: CHOOSE SENSORS
  // ==========================================
  private renderStage2B(): void {
    const { width, height } = this.scale;
    this.children.removeAll();
    GameState.getInstance().updateProgress('Level1RoverLabScene', 1, '1B_SENSORS');
    PlaceholderArt.drawSpaceLabBackground(this);

    TelemetryService.getInstance().recordEvent({
      sceneId: 'Level1RoverLabScene',
      challengeId: '1B_SENSORS',
      eventType: 'challenge_started'
    });

    const container = document.getElementById('game-container');
    if (!container) return;

    const existing = document.getElementById('rover-lab-dom');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'rover-lab-dom';
    overlay.className = 'apulab-overlay';

    const sensorCardsHtml = SENSOR_OPTIONS.map(s => `
      <div style="background: #141938; border: 2px solid #4D4288; border-radius: 14px; padding: 14px; text-align: left; display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <div style="font-weight: 700; color: #00F2FE; font-size: 1.1rem; margin-bottom: 6px;">${s.name}</div>
          <p style="font-size: 0.9rem; color: #E2E8F0; margin-bottom: 8px;">${s.description}</p>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
          <button class="apulab-btn-secondary inspect-sensor-btn" data-id="${s.id}" style="font-size: 0.85rem; padding: 6px 12px; margin: 0;">ℹ️ VER FICHA</button>
          <label style="cursor: pointer; font-weight: 700; color: #FFD166;">
            <input type="checkbox" class="sensor-checkbox" data-id="${s.id}" style="transform: scale(1.3); margin-right: 6px;" /> ELEGIR
          </label>
        </div>
      </div>
    `).join('');

    overlay.innerHTML = `
      <div class="apulab-card" style="max-width: 820px; text-align: left;">
        <div class="apulab-title" style="font-size: 1.8rem; margin-bottom: 4px;">NIVEL 1B: SENSORES DE LA MISIÓN</div>
        <div class="apulab-subtitle" style="margin-bottom: 14px; color: #E2E8F0;">
          Selecciona exactamente <strong>3 sensores prioritarios</strong> para avanzar de forma segura por terreno rocoso, resistir cambios térmicos y analizar minerales.
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 16px;">
          ${sensorCardsHtml}
        </div>

        <div id="sensor-card-info-box" style="background: rgba(45, 38, 84, 0.9); border: 2px solid #00F2FE; border-radius: 12px; padding: 12px; font-size: 0.95rem; color: #00F2FE; min-height: 40px; margin-bottom: 12px;">
          Haz clic en "VER FICHA" en cualquier sensor para leer el análisis técnico del laboratorio.
        </div>

        <div id="sensor-feedback" style="font-weight: 700; color: #FFD166; min-height: 24px; margin-bottom: 12px;"></div>

        <div style="text-align: center;">
          <button id="test-sensors-btn" class="apulab-btn-primary">🛠️ PROBAR CONFIGURACIÓN</button>
        </div>
      </div>
    `;

    container.appendChild(overlay);

    overlay.querySelectorAll('.inspect-sensor-btn').forEach(btn => {
      (btn as HTMLButtonElement).onclick = (e) => {
        const id = (e.currentTarget as HTMLButtonElement).getAttribute('data-id') || '';
        const sensor = SENSOR_OPTIONS.find(s => s.id === id);
        if (sensor) {
          if (!this.cardsOpened.includes(id)) this.cardsOpened.push(id);
          const box = document.getElementById('sensor-card-info-box');
          if (box) box.innerText = `🔍 [${sensor.name}]: ${sensor.priorityReason}`;
        }
      };
    });

    overlay.querySelectorAll('.sensor-checkbox').forEach(cb => {
      (cb as HTMLInputElement).onchange = (e) => {
        const id = (e.currentTarget as HTMLInputElement).getAttribute('data-id') || '';
        const isChecked = (e.currentTarget as HTMLInputElement).checked;

        if (isChecked) {
          if (!this.selectedSensorIds.includes(id)) {
            this.selectedSensorIds.push(id);
            this.sensorSelectionOrder.push(id);
          }
        } else {
          this.selectedSensorIds = this.selectedSensorIds.filter(sId => sId !== id);
        }
      };
    });

    const testBtn = document.getElementById('test-sensors-btn');
    if (testBtn) {
      testBtn.onclick = () => {
        this.attempt2B++;
        const res = RoverLabEngine.testSensorSelection(this.selectedSensorIds);

        TelemetryService.getInstance().recordEvent({
          sceneId: 'Level1RoverLabScene',
          challengeId: '1B_SENSORS',
          eventType: 'solution_submitted',
          attemptNumber: this.attempt2B,
          payload: {
            cards_opened: this.cardsOpened,
            selected_sensors: this.selectedSensorIds,
            sensor_selection_order: this.sensorSelectionOrder,
            missing_priority: res.missingPriorityNames
          },
          result: res.success ? 'success' : 'failed',
          errorCode: res.errorCode
        });

        const fb = document.getElementById('sensor-feedback');
        if (fb) fb.innerText = res.feedback;

        TelemetryService.getInstance().recordEvent({
          sceneId: 'Level1RoverLabScene',
          challengeId: '1B_SENSORS',
          eventType: 'feedback_shown',
          payload: { feedback: res.feedback, result: res.success ? 'success' : 'failed' }
        });

        TelemetryService.getInstance().recordEvent({
          sceneId: 'Level1RoverLabScene',
          challengeId: '1B_SENSORS',
          eventType: 'attempt_finished',
          attemptNumber: this.attempt2B,
          payload: { selected_sensors: this.selectedSensorIds },
          result: res.success ? 'success' : 'failed',
          errorCode: res.errorCode
        });

        if (res.success) {
          TelemetryService.getInstance().recordEvent({
            sceneId: 'Level1RoverLabScene',
            challengeId: '1B_SENSORS',
            eventType: 'challenge_completed',
            attemptNumber: this.attempt2B
          });
          GameState.getInstance().recordChallengeResult({
            challengeId: '1B_SENSORS',
            attempts: this.attempt2B,
            completed: true,
            hintsUsed: false,
            durationSeconds: 0
          });

          setTimeout(() => {
            overlay.remove();
            this.sublevelStage = '2C';
            this.renderStage2C();
          }, 1800);
        }
      };
    }
  }

  // ==========================================
  // SUBLEVEL 2C: CALIBRATE SYSTEMS
  // ==========================================
  private renderStage2C(): void {
    const { width, height } = this.scale;
    this.children.removeAll();
    GameState.getInstance().updateProgress('Level1RoverLabScene', 1, '1C_CALIBRATION');
    PlaceholderArt.drawSpaceLabBackground(this);

    TelemetryService.getInstance().recordEvent({
      sceneId: 'Level1RoverLabScene',
      challengeId: '1C_CALIBRATION',
      eventType: 'challenge_started'
    });

    this.renderCalibrationUI();
  }

  private renderCalibrationUI(): void {
    const container = document.getElementById('game-container');
    if (!container) return;

    const existing = document.getElementById('rover-lab-dom');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'rover-lab-dom';
    overlay.className = 'apulab-overlay';

    const st = CALIBRATION_STATIONS[this.activeStationIndex];
    const currentVal = this.engine.currentReadings[st.id];

    overlay.innerHTML = `
      <div class="apulab-card" style="max-width: 760px; text-align: left;">
        <div class="apulab-title" style="font-size: 1.8rem; margin-bottom: 4px;">NIVEL 1C: CALIBRACIÓN DEL ROVER</div>
        <div class="apulab-subtitle" style="margin-bottom: 16px; color: #E2E8F0;">
          Estación ${this.activeStationIndex + 1} de 3: <strong>${st.name}</strong>
        </div>

        <div style="background: rgba(20, 25, 56, 0.9); border: 2px solid var(--panel-border); border-radius: 16px; padding: 20px; margin-bottom: 20px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 1.15rem;">
            <span>Referencia Objetivo: <strong>${st.reference} ${st.unit}</strong></span>
            <span>Rango de Tolerancia Válido: <strong>${st.validRange[0]} a ${st.validRange[1]} ${st.unit}</strong></span>
          </div>

          <div style="text-align: center; background: #0B0E26; padding: 20px; border-radius: 12px; border: 2px solid #00F2FE; margin-bottom: 16px;">
            <div style="font-size: 0.95rem; color: #B8C2CC;">LECTURA ACTUAL DEL SENSOR</div>
            <div id="calib-curr-val" style="font-size: 3rem; font-weight: 800; color: #FFD166; font-family: 'Space Grotesk', sans-serif;">
              ${currentVal} ${st.unit}
            </div>
            <div id="calib-diff-val" style="font-size: 1rem; color: #00F2FE; margin-top: 4px;">
              Diferencia: ${currentVal - st.reference} ${st.unit}
            </div>
          </div>

          <div style="text-align: center; margin-bottom: 8px;">
            <div style="font-size: 0.95rem; color: #F8F9FA; margin-bottom: 8px;">CONTROLES DE AJUSTE:</div>
            <button class="apulab-btn-secondary calib-adj-btn" data-val="20">+20</button>
            <button class="apulab-btn-secondary calib-adj-btn" data-val="10">+10</button>
            <button class="apulab-btn-secondary calib-adj-btn" data-val="5">+5</button>
            <button class="apulab-btn-secondary calib-adj-btn" data-val="-5">-5</button>
            <button class="apulab-btn-secondary calib-adj-btn" data-val="-10">-10</button>
            <button class="apulab-btn-secondary calib-adj-btn" data-val="-20">-20</button>
          </div>
        </div>

        <div id="calib-feedback" style="font-weight: 700; color: #FFD166; min-height: 24px; margin-bottom: 12px;"></div>

        <div style="text-align: center;">
          <button id="test-calib-btn" class="apulab-btn-primary">🎛️ PROBAR CALIBRACIÓN</button>
        </div>
      </div>
    `;

    container.appendChild(overlay);

    overlay.querySelectorAll('.calib-adj-btn').forEach(btn => {
      (btn as HTMLButtonElement).onclick = (e) => {
        const delta = parseInt((e.currentTarget as HTMLButtonElement).getAttribute('data-val') || '0');
        const newVal = this.engine.adjustStationReading(st.id, delta);

        if (!this.stationAdjustSequences[st.id]) this.stationAdjustSequences[st.id] = [];
        this.stationAdjustSequences[st.id].push(delta);

        const valEl = document.getElementById('calib-curr-val');
        const diffEl = document.getElementById('calib-diff-val');
        if (valEl) valEl.innerText = `${newVal} ${st.unit}`;
        if (diffEl) diffEl.innerText = `Diferencia: ${newVal - st.reference} ${st.unit}`;
      };
    });

    const testBtn = document.getElementById('test-calib-btn');
    if (testBtn) {
      testBtn.onclick = () => {
        const res = this.engine.testCalibrationStation(st.id);
        const attempt = this.engine.calibrationAttempts[st.id];

        TelemetryService.getInstance().recordEvent({
          sceneId: 'Level1RoverLabScene',
          challengeId: '1C_CALIBRATION',
          eventType: 'solution_submitted',
          attemptNumber: attempt,
          payload: {
            station_id: st.id,
            reference_value: st.reference,
            initial_value: st.initialReading,
            current_value: this.engine.currentReadings[st.id],
            adjustment_sequence: this.stationAdjustSequences[st.id] || []
          },
          result: res.success ? 'success' : 'failed',
          errorCode: res.errorCode
        });

        const fb = document.getElementById('calib-feedback');
        if (fb) fb.innerText = res.feedback;

        TelemetryService.getInstance().recordEvent({
          sceneId: 'Level1RoverLabScene',
          challengeId: '1C_CALIBRATION',
          eventType: 'feedback_shown',
          payload: { feedback: res.feedback, result: res.success ? 'success' : 'failed' }
        });

        TelemetryService.getInstance().recordEvent({
          sceneId: 'Level1RoverLabScene',
          challengeId: '1C_CALIBRATION',
          eventType: 'attempt_finished',
          attemptNumber: attempt,
          payload: { station_id: st.id, final_value: this.engine.currentReadings[st.id] },
          result: res.success ? 'success' : 'failed',
          errorCode: res.errorCode
        });

        if (res.success) {
          if (this.activeStationIndex < CALIBRATION_STATIONS.length - 1) {
            setTimeout(() => {
              this.activeStationIndex++;
              this.renderCalibrationUI();
            }, 1200);
          } else {
            // All calibrated
            TelemetryService.getInstance().recordEvent({
              sceneId: 'Level1RoverLabScene',
              challengeId: '1C_CALIBRATION',
              eventType: 'challenge_completed'
            });
            GameState.getInstance().recordChallengeResult({
              challengeId: '1C_CALIBRATION',
              attempts: attempt,
              completed: true,
              hintsUsed: false,
              durationSeconds: 0
            });

            if (fb) fb.innerText = 'Sistemas del rover verificados. El rover está listo para recibir instrucciones.';

            setTimeout(() => {
              overlay.remove();
              this.scene.start('Level2HubbleScene');
            }, 1800);
          }
        }
      };
    }
  }
}
