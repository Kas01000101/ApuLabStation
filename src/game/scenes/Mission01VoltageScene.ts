import * as Phaser from 'phaser';
import { BATTERY_OPTIONS } from '../../data/roverChallenges';
import { TelemetryService } from '../../systems/TelemetryService';
import { GameState } from '../../systems/GameState';
import { PlaceholderArt } from '../../ui/PlaceholderArt';
import { playUiClick } from '../../ui/audio/playUiClick';
import { clearApuLabDom } from '../../ui/domComponents';
import { MissionChallengeFrame, MissionChallengeLayout, MissionLearningModule, missionLayout } from '../../ui/missionLayout';
import { uiTokens } from '../../ui/tokens';

type VoltageLevel = 'low' | 'adequate' | 'high';

interface VoltageChallenge {
  id: 'MISSION01_VOLTAGE_01' | 'MISSION01_VOLTAGE_02' | 'MISSION01_VOLTAGE_03';
  title: string;
  subtitle: string;
  prompt: string;
}

const VOLTAGE_CHALLENGES: VoltageChallenge[] = [
  {
    id: 'MISSION01_VOLTAGE_01',
    title: 'DESAFÍO 1 DE 3',
    subtitle: 'Reconocer el rango',
    prompt: 'Clasifica cada lectura: menos de 12 V es bajo, de 12 V a 13 V es adecuado, y más de 13 V es alto.'
  },
  {
    id: 'MISSION01_VOLTAGE_02',
    title: 'DESAFÍO 2 DE 3',
    subtitle: 'Elegir el valor correcto',
    prompt: 'KAWSAY-1 necesita un nivel eléctrico adecuado. El valor correcto no es el más alto: es el que cumple los requisitos del sistema.'
  },
  {
    id: 'MISSION01_VOLTAGE_03',
    title: 'DESAFÍO 3 DE 3',
    subtitle: 'Razonar las consecuencias',
    prompt: 'Piensa qué ocurriría si KAWSAY-1 recibe voltaje bajo, adecuado o alto.'
  }
];

const RECOGNITION_READINGS = [
  { id: 'reading_low', voltage: 10.5 },
  { id: 'reading_adequate', voltage: 12.6 },
  { id: 'reading_high', voltage: 14.1 }
];

const CONSEQUENCE_SCENARIOS = [
  {
    id: 'low',
    voltage: 10.8,
    question: 'KAWSAY-1 recibe 10.8 V. ¿Qué podría ocurrir?',
    correct: 'low',
    correctText: 'Algunos sistemas podrían no encender o funcionar correctamente.'
  },
  {
    id: 'high',
    voltage: 14.5,
    question: 'KAWSAY-1 recibe 14.5 V. ¿Qué riesgo existe?',
    correct: 'high',
    correctText: 'Algunos componentes podrían calentarse demasiado o dañarse.'
  },
  {
    id: 'adequate',
    voltage: 12.5,
    question: 'KAWSAY-1 recibe 12.5 V. ¿Qué significa?',
    correct: 'adequate',
    correctText: 'Está dentro del rango adecuado.'
  }
] as const;

const VOLTAGE_LABELS: Record<VoltageLevel, string> = {
  low: 'BAJO',
  adequate: 'ADECUADO',
  high: 'ALTO'
};

const CONSEQUENCE_OPTIONS: Record<VoltageLevel, string> = {
  low: 'Algunos sistemas podrían no encender o funcionar correctamente.',
  adequate: 'El sistema recibe el nivel que necesita.',
  high: 'Algunos componentes podrían calentarse demasiado o dañarse.'
};

const getVoltageLevel = (voltage: number): VoltageLevel => {
  if (voltage < 12) return 'low';
  if (voltage > 13) return 'high';
  return 'adequate';
};

interface VoltageOptionButton {
  graphics: Phaser.GameObjects.Graphics;
  text: Phaser.GameObjects.Text;
  zone: Phaser.GameObjects.Zone;
  level: VoltageLevel;
  readingId: string;
}

interface SelectableCardButton {
  graphics: Phaser.GameObjects.Graphics;
  checkText: Phaser.GameObjects.Text;
  zone: Phaser.GameObjects.Zone;
  id: string;
  accent: number;
  selected: () => boolean;
}

const VOLTAGE_LEARNING_MODULES: MissionLearningModule[] = [
  {
    icon: '▮',
    title: 'BATERÍA',
    body: 'Almacena energía y la suministra al rover.',
    color: 0x00d9ff
  },
  {
    icon: 'V',
    title: 'VOLTAJE',
    body: 'Indica si recibe el nivel eléctrico necesario.',
    color: 0xa987ff
  },
  {
    icon: 'V',
    title: 'UNIDAD',
    body: 'Voltio, unidad utilizada para medir voltaje.',
    color: 0xf2c94c
  }
];

const CARD_ACCENTS = [
  { color: 0x00d9ff, glow: 0x39e7ff },
  { color: 0xa987ff, glow: 0xc58cff },
  { color: 0xff74ca, glow: 0xff69d8 }
] as const;

export class Mission01VoltageScene extends Phaser.Scene {
  private challengeIndex = 0;
  private challengeStartTime = Date.now();
  private attempts: Record<string, number> = {};
  private classifications: Record<string, VoltageLevel | ''> = {};
  private selectedBatteryId = '';
  private selectedConsequences: Record<string, VoltageLevel | ''> = {};
  private voltageOptionButtons: VoltageOptionButton[] = [];
  private selectableCardButtons: SelectableCardButton[] = [];
  private voltageFeedbackText?: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'Mission01VoltageScene' });
  }

  create(): void {
    clearApuLabDom();
    this.challengeIndex = GameState.getInstance().mission01VoltageStep;
    this.attempts = {};
    this.classifications = {};
    this.selectedBatteryId = '';
    this.selectedConsequences = {};
    this.renderChallenge();
  }

  private renderChallenge(): void {
    this.children.removeAll();
    PlaceholderArt.drawSpaceLabBackground(this);

    const challenge = VOLTAGE_CHALLENGES[this.challengeIndex];
    if (!challenge) {
      this.renderMissionComplete();
      return;
    }

    this.challengeStartTime = Date.now();
    GameState.getInstance().updateProgress('Mission01VoltageScene', 1, challenge.id);
    TelemetryService.getInstance().recordEvent({
      sceneId: 'Mission01VoltageScene',
      challengeId: challenge.id,
      eventType: 'challenge_started',
      payload: {
        mission: 'MISSION01_VOLTAGE',
        challenge_number: this.challengeIndex + 1
      }
    });

    if (challenge.id === 'MISSION01_VOLTAGE_01') {
      this.renderRecognizeChallenge(challenge);
    } else if (challenge.id === 'MISSION01_VOLTAGE_02') {
      this.renderChooseValueChallenge(challenge);
    } else {
      this.renderReasoningChallenge(challenge);
    }
  }

  private renderRecognizeChallenge(challenge: VoltageChallenge): void {
    this.voltageOptionButtons = [];
    const frame = this.prepareMissionChallengeFrame(challenge, 'Clasifica las tres mediciones y pulsa comprobar.', () => {
      playUiClick(this);
      const challengeId = challenge.id;
      this.attempts[challengeId] = (this.attempts[challengeId] || 0) + 1;
      const allAnswered = RECOGNITION_READINGS.every((reading) => this.classifications[reading.id]);
      const allCorrect = RECOGNITION_READINGS.every((reading) => this.classifications[reading.id] === getVoltageLevel(reading.voltage));

      if (!allAnswered) {
        this.showVoltageFeedback('Revisa el rango:', 'Clasifica las tres lecturas antes de comprobar.', false);
        this.recordVoltageAttempt(challengeId, false, 'missing_classification', { classifications: this.classifications });
        return;
      }

      if (!allCorrect) {
        this.showVoltageFeedback('Revisa el rango:', 'Menos de 12 V es bajo; 12 V a 13 V es adecuado.', false);
        this.recordVoltageAttempt(challengeId, false, 'wrong_classification', { classifications: this.classifications });
        return;
      }

      this.showVoltageFeedback('✓ ¡Bien!', '12.6 V está dentro del rango adecuado.', true);
      this.completeChallenge(challengeId, { classifications: this.classifications });
    });
    this.drawRangeRuleBand(frame);
    this.drawReadingCards(frame);
  }

  private prepareMissionChallengeFrame(challenge: VoltageChallenge, feedbackMessage: string, onCta: () => void): MissionChallengeFrame {
    document.getElementById('mission01-voltage-dom')?.remove();
    this.selectableCardButtons = [];
    const frame = MissionChallengeLayout.drawFrame(
      this,
      {
        missionTitle: 'MISIÓN 01 · VOLTAJE',
        challengeTitle: challenge.title,
        subtitle: challenge.subtitle,
        current: this.challengeIndex + 1,
        total: VOLTAGE_CHALLENGES.length
      },
      VOLTAGE_LEARNING_MODULES,
      onCta,
      feedbackMessage
    );
    this.voltageFeedbackText = frame.feedbackText;
    return frame;
  }

  private drawRangeRuleBand(frame: MissionChallengeFrame): void {
    const { typography, fontFamily } = missionLayout;
    const x = frame.challengeArea.x + 14;
    const y = frame.challengeArea.y + 8;
    const w = frame.challengeArea.width - 28;
    const h = 64;
    const g = this.add.graphics();
    g.fillStyle(0x0b0e26, 0.42);
    g.fillRoundedRect(x, y, w, h, 18);
    g.lineStyle(2, 0xffffff, 0.22);
    g.strokeRoundedRect(x + 4, y + 4, w - 8, h - 8, 14);

    const items = [
      { x: x + 42, top: 'MENOS DE 12 V', bottom: 'BAJO', color: '#48DFFF' },
      { x: x + Math.round(w / 3) + 42, top: '12–13 V', bottom: 'ADECUADO', color: '#F2C94C' },
      { x: x + Math.round((w / 3) * 2) + 42, top: 'MÁS DE 13 V', bottom: 'ALTO', color: '#FF7ECF' }
    ];

    items.forEach((item) => {
      this.add.text(item.x, y + 12, item.top, {
        fontFamily,
        fontSize: `${typography.state}px`,
        fontStyle: uiTokens.typography.weight.bold,
        color: item.color
      });
      this.add.text(item.x, y + 34, item.bottom, {
        fontFamily,
        fontSize: `${typography.sectionTitle}px`,
        fontStyle: '800',
        color: '#FFFFFF'
      });
    });
  }

  private drawReadingCards(frame: MissionChallengeFrame): void {
    const { typography, fontFamily } = missionLayout;
    RECOGNITION_READINGS.forEach((reading, index) => {
      const rect = frame.cardRects[index];
      const { color, glow } = CARD_ACCENTS[index];
      const { x, y, width, height, radius } = rect;
      const g = this.add.graphics();
      g.fillStyle(0x050410, 0.22);
      g.fillRoundedRect(x + 10, y + 13, width, height, radius);
      g.lineStyle(8, glow, 0.18);
      g.strokeRoundedRect(x - 2, y - 2, width + 4, height + 4, radius + 2);
      g.fillGradientStyle(0x18205a, color, 0x2d2654, 0x17133a, 0.98, 0.92, 0.98, 0.98);
      g.fillRoundedRect(x, y, width, height, radius);
      g.lineStyle(3, 0xffffff, 0.58);
      g.strokeRoundedRect(x + 5, y + 5, width - 10, height - 10, radius - 5);
      g.fillStyle(0xffffff, 0.12);
      g.fillRoundedRect(x + 26, y + 20, width - 52, 40, 20);

      this.add.text(x + width / 2, y + 40, 'MEDICIÓN', {
        fontFamily,
        fontSize: `${typography.sectionTitle}px`,
        fontStyle: uiTokens.typography.weight.bold,
        color: '#FFFFFF'
      }).setOrigin(0.5);

      this.add.text(x + width / 2, y + 104, `${reading.voltage} V`, {
        fontFamily,
        fontSize: `${typography.cardValue}px`,
        fontStyle: '800',
        color: '#FFFFFF'
      }).setOrigin(0.5).setShadow(0, 0, 'rgba(0, 242, 254, 0.34)', 12, false, true);

      const levels: VoltageLevel[] = ['low', 'adequate', 'high'];
      levels.forEach((level, index) => {
        const buttonX = x + 48;
        const buttonY = y + 150 + index * 34;
        this.createVoltageOptionButton(reading.id, level, buttonX, buttonY, width - 96, 28, color);
      });
    });
  }

  private createVoltageOptionButton(readingId: string, level: VoltageLevel, x: number, y: number, width: number, height: number, accent: number): void {
    const graphics = this.add.graphics();
    const text = this.add.text(x + width / 2, y + height / 2, VOLTAGE_LABELS[level], {
      fontFamily: missionLayout.fontFamily,
      fontSize: `${missionLayout.typography.option}px`,
      fontStyle: uiTokens.typography.weight.bold,
      color: '#FFFFFF'
    }).setOrigin(0.5);
    const zone = this.add.zone(x, y, width, height).setOrigin(0).setInteractive({ useHandCursor: true });
    const button: VoltageOptionButton = { graphics, text, zone, level, readingId };
    this.voltageOptionButtons.push(button);
    this.updateVoltageOptionButton(button, false);

    zone.on(Phaser.Input.Events.POINTER_OVER, () => {
      this.updateVoltageOptionButton(button, this.classifications[readingId] === level, true);
    });
    zone.on(Phaser.Input.Events.POINTER_OUT, () => {
      this.updateVoltageOptionButton(button, this.classifications[readingId] === level);
    });
    zone.on(Phaser.Input.Events.POINTER_UP, () => {
      playUiClick(this);
      this.classifications[readingId] = level;
      this.voltageOptionButtons
        .filter((candidate) => candidate.readingId === readingId)
        .forEach((candidate) => this.updateVoltageOptionButton(candidate, candidate.level === level));
    });
  }

  private updateVoltageOptionButton(button: VoltageOptionButton, selected: boolean, hover = false): void {
    const { x, y, width, height } = button.zone;
    button.graphics.clear();
    button.graphics.fillStyle(selected ? 0xf2c94c : 0x0b0e26, selected ? 0.96 : 0.46);
    button.graphics.fillRoundedRect(x, y, width, height, 12);
    button.graphics.lineStyle(2, selected ? 0xffffff : hover ? 0x00f2fe : 0xffffff, selected ? 0.82 : hover ? 0.75 : 0.28);
    button.graphics.strokeRoundedRect(x + 1, y + 1, width - 2, height - 2, 11);
    button.text.setColor(selected ? '#302A5C' : '#FFFFFF');
  }

  private showVoltageFeedback(title: string, body: string, success: boolean): void {
    if (!this.voltageFeedbackText) return;
    this.voltageFeedbackText.setText(`${title}\n${body}`);
    this.voltageFeedbackText.setColor(success ? '#74D99F' : '#FFD166');
  }

  private drawBatteryChoiceCards(frame: MissionChallengeFrame): void {
    BATTERY_OPTIONS.forEach((battery, index) => {
      const rect = frame.cardRects[index];
      const accent = CARD_ACCENTS[index];
      this.drawMeasurementChoiceCard({
        rect,
        title: `CARD ${index + 1}`,
        value: `${battery.voltage} V`,
        helper: 'Medición disponible',
        accentColor: accent.color,
        glowColor: accent.glow,
        selected: () => this.selectedBatteryId === battery.id,
        onSelect: () => {
          this.selectedBatteryId = battery.id;
          this.updateSelectableCards();
        }
      });
    });
  }

  private drawReasoningCards(frame: MissionChallengeFrame): void {
    CONSEQUENCE_SCENARIOS.forEach((scenario, index) => {
      const rect = frame.cardRects[index];
      const accent = CARD_ACCENTS[index];
      this.drawScenarioChoiceCard(rect, scenario, accent.color, accent.glow);
    });
  }

  private drawMeasurementChoiceCard(options: {
    rect: MissionChallengeFrame['cardRects'][number];
    title: string;
    value: string;
    helper: string;
    accentColor: number;
    glowColor: number;
    selected: () => boolean;
    onSelect: () => void;
  }): void {
    const { rect, title, value, helper, accentColor, glowColor, selected, onSelect } = options;
    this.drawCardShell(rect, accentColor, glowColor);

    this.add.text(rect.x + rect.width / 2, rect.y + 44, title, {
      fontFamily: missionLayout.fontFamily,
      fontSize: `${missionLayout.typography.sectionTitle}px`,
      fontStyle: uiTokens.typography.weight.bold,
      color: '#FFFFFF'
    }).setOrigin(0.5);

    this.add.text(rect.x + rect.width / 2, rect.y + 116, value, {
      fontFamily: missionLayout.fontFamily,
      fontSize: `${missionLayout.typography.cardValue}px`,
      fontStyle: '800',
      color: '#FFFFFF'
    }).setOrigin(0.5).setShadow(0, 0, 'rgba(0, 242, 254, 0.34)', 12, false, true);

    this.add.text(rect.x + rect.width / 2, rect.y + 170, helper, {
      fontFamily: missionLayout.fontFamily,
      fontSize: `${missionLayout.typography.body}px`,
      fontStyle: uiTokens.typography.weight.semibold,
      color: '#E7E4FF'
    }).setOrigin(0.5);

    const stateGraphics = this.add.graphics();
    const stateText = this.add.text(rect.x + rect.width / 2, rect.y + 220, '', {
      fontFamily: missionLayout.fontFamily,
      fontSize: `${missionLayout.typography.state}px`,
      fontStyle: uiTokens.typography.weight.bold,
      color: '#302A5C'
    }).setOrigin(0.5);

    const zone = this.add.zone(rect.x, rect.y, rect.width, rect.height).setOrigin(0).setInteractive({ useHandCursor: true });
    const button: SelectableCardButton = {
      graphics: stateGraphics,
      checkText: stateText,
      zone,
      id: title,
      accent: accentColor,
      selected
    };
    this.selectableCardButtons.push(button);
    this.updateSelectableCard(button);

    zone.on(Phaser.Input.Events.POINTER_UP, () => {
      playUiClick(this);
      onSelect();
    });
  }

  private drawScenarioChoiceCard(
    rect: MissionChallengeFrame['cardRects'][number],
    scenario: (typeof CONSEQUENCE_SCENARIOS)[number],
    accentColor: number,
    glowColor: number
  ): void {
    this.drawCardShell(rect, accentColor, glowColor);

    this.add.text(rect.x + rect.width / 2, rect.y + 38, `${scenario.voltage} V`, {
      fontFamily: missionLayout.fontFamily,
      fontSize: `${missionLayout.typography.cardValue}px`,
      fontStyle: '800',
      color: '#FFFFFF'
    }).setOrigin(0.5).setShadow(0, 0, 'rgba(0, 242, 254, 0.34)', 12, false, true);

    this.add.text(rect.x + 36, rect.y + 80, scenario.question.replace(`KAWSAY-1 recibe ${scenario.voltage} V. `, ''), {
      fontFamily: missionLayout.fontFamily,
      fontSize: `${missionLayout.typography.body}px`,
      fontStyle: uiTokens.typography.weight.semibold,
      color: '#FFFFFF',
      wordWrap: { width: rect.width - 72, useAdvancedWrap: true }
    });

    const levels: VoltageLevel[] = ['low', 'adequate', 'high'];
    levels.forEach((level, index) => {
      const optionY = rect.y + 142 + index * 36;
      this.drawScenarioOption(rect.x + 36, optionY, rect.width - 72, 30, scenario.id, level, accentColor);
    });
  }

  private drawScenarioOption(x: number, y: number, width: number, height: number, scenarioId: string, level: VoltageLevel, accentColor: number): void {
    const graphics = this.add.graphics();
    const text = this.add.text(x + 16, y + height / 2, CONSEQUENCE_OPTIONS[level], {
      fontFamily: missionLayout.fontFamily,
      fontSize: `${missionLayout.typography.state}px`,
      fontStyle: uiTokens.typography.weight.bold,
      color: '#FFFFFF',
      wordWrap: { width: width - 32, useAdvancedWrap: true }
    }).setOrigin(0, 0.5);
    const zone = this.add.zone(x, y, width, height).setOrigin(0).setInteractive({ useHandCursor: true });
    const button: VoltageOptionButton = { graphics, text, zone, level, readingId: scenarioId };
    this.voltageOptionButtons.push(button);
    this.updateVoltageOptionButton(button, false);

    zone.on(Phaser.Input.Events.POINTER_OVER, () => {
      this.updateVoltageOptionButton(button, this.selectedConsequences[scenarioId] === level, true);
    });
    zone.on(Phaser.Input.Events.POINTER_OUT, () => {
      this.updateVoltageOptionButton(button, this.selectedConsequences[scenarioId] === level);
    });
    zone.on(Phaser.Input.Events.POINTER_UP, () => {
      playUiClick(this);
      this.selectedConsequences[scenarioId] = level;
      this.voltageOptionButtons
        .filter((candidate) => candidate.readingId === scenarioId)
        .forEach((candidate) => this.updateVoltageOptionButton(candidate, candidate.level === level));
    });

    void accentColor;
  }

  private drawCardShell(rect: MissionChallengeFrame['cardRects'][number], accentColor: number, glowColor: number): void {
    const g = this.add.graphics();
    g.fillStyle(0x050410, 0.22);
    g.fillRoundedRect(rect.x + 10, rect.y + 13, rect.width, rect.height, rect.radius);
    g.lineStyle(8, glowColor, 0.18);
    g.strokeRoundedRect(rect.x - 2, rect.y - 2, rect.width + 4, rect.height + 4, rect.radius + 2);
    g.fillGradientStyle(0x18205a, accentColor, 0x2d2654, 0x17133a, 0.98, 0.92, 0.98, 0.98);
    g.fillRoundedRect(rect.x, rect.y, rect.width, rect.height, rect.radius);
    g.lineStyle(3, 0xffffff, 0.48);
    g.strokeRoundedRect(rect.x + 5, rect.y + 5, rect.width - 10, rect.height - 10, rect.radius - 5);
    g.fillStyle(0xffffff, 0.12);
    g.fillRoundedRect(rect.x + 26, rect.y + 20, rect.width - 52, 40, 20);
  }

  private updateSelectableCards(): void {
    this.selectableCardButtons.forEach((button) => this.updateSelectableCard(button));
  }

  private updateSelectableCard(button: SelectableCardButton): void {
    const { x, y, width, height } = button.zone;
    const selected = button.selected();
    button.graphics.clear();
    button.graphics.lineStyle(5, selected ? 0xf2c94c : button.accent, selected ? 0.95 : 0);
    button.graphics.strokeRoundedRect(x + 9, y + 9, width - 18, height - 18, 18);
    button.graphics.fillStyle(selected ? 0xf2c94c : 0x0b0e26, selected ? 0.96 : 0.5);
    button.graphics.fillRoundedRect(x + width / 2 - 74, y + height - 66, 148, 34, 17);
    button.checkText.setText(selected ? '✓ SELECCIONADO' : 'SELECCIONAR');
    button.checkText.setColor(selected ? '#302A5C' : '#FFFFFF');
  }

  private renderChooseValueChallenge(challenge: VoltageChallenge): void {
    this.selectedBatteryId = '';
    const frame = this.prepareMissionChallengeFrame(challenge, 'Elige el voltaje adecuado para KAWSAY-1.', () => {
      playUiClick(this);
      const challengeId = challenge.id;
      this.attempts[challengeId] = (this.attempts[challengeId] || 0) + 1;
      const selected = BATTERY_OPTIONS.find((battery) => battery.id === this.selectedBatteryId);

      if (!selected) {
        this.showVoltageFeedback('Elige un valor:', 'Selecciona una de las tres mediciones antes de comprobar.', false);
        this.recordVoltageAttempt(challengeId, false, 'no_voltage_selected', {});
        return;
      }

      if (getVoltageLevel(selected.voltage) !== 'adequate') {
        this.showVoltageFeedback('Inténtalo nuevamente:', `${selected.voltage} V no está dentro del rango adecuado de 12 V a 13 V.`, false);
        this.recordVoltageAttempt(challengeId, false, getVoltageLevel(selected.voltage) === 'low' ? 'below_range' : 'above_range', {
          selected_voltage: selected.voltage
        });
        return;
      }

      this.showVoltageFeedback('✓ Correcto', '12.4 V está dentro del rango 12 V a 13 V.', true);
      this.completeChallenge(challengeId, { selected_voltage: selected.voltage });
    });
    this.drawBatteryChoiceCards(frame);
  }

  private renderReasoningChallenge(challenge: VoltageChallenge): void {
    this.selectedConsequences = {};
    const frame = this.prepareMissionChallengeFrame(challenge, 'Relaciona cada medición con su consecuencia.', () => {
      playUiClick(this);
      const challengeId = challenge.id;
      this.attempts[challengeId] = (this.attempts[challengeId] || 0) + 1;
      const allAnswered = CONSEQUENCE_SCENARIOS.every((scenario) => this.selectedConsequences[scenario.id]);
      const allCorrect = CONSEQUENCE_SCENARIOS.every((scenario) => this.selectedConsequences[scenario.id] === scenario.correct);

      if (!allAnswered) {
        this.showVoltageFeedback('Falta una respuesta:', 'Selecciona una consecuencia para cada medición.', false);
        this.recordVoltageAttempt(challengeId, false, 'missing_consequence', { selected_consequences: this.selectedConsequences });
        return;
      }

      if (!allCorrect) {
        this.showVoltageFeedback('Inténtalo nuevamente:', 'Bajo puede impedir encender; alto puede dañar; adecuado está dentro del rango.', false);
        this.recordVoltageAttempt(challengeId, false, 'wrong_consequence', { selected_consequences: this.selectedConsequences });
        return;
      }

      this.showVoltageFeedback('✓ Correcto', 'Razonaste las consecuencias de cada nivel de voltaje.', true);
      this.completeChallenge(challengeId, { selected_consequences: this.selectedConsequences });
    });
    this.drawReasoningCards(frame);
  }

  private completeChallenge(challengeId: VoltageChallenge['id'], payload: Record<string, unknown>): void {
    this.recordVoltageAttempt(challengeId, true, undefined, payload);
    GameState.getInstance().recordChallengeResult({
      challengeId,
      attempts: this.attempts[challengeId] || 1,
      completed: true,
      hintsUsed: false,
      durationSeconds: Math.round((Date.now() - this.challengeStartTime) / 1000)
    });
    GameState.getInstance().setMission01VoltageStep((this.challengeIndex + 1) as 1 | 2 | 3);

    TelemetryService.getInstance().recordEvent({
      sceneId: 'Mission01VoltageScene',
      challengeId,
      eventType: 'challenge_completed',
      attemptNumber: this.attempts[challengeId] || 1,
      durationSeconds: Math.round((Date.now() - this.challengeStartTime) / 1000)
    });

    setTimeout(() => {
      this.challengeIndex++;
      this.renderChallenge();
    }, 1300);
  }

  private recordVoltageAttempt(
    challengeId: VoltageChallenge['id'],
    success: boolean,
    errorCode: string | undefined,
    payload: Record<string, unknown>
  ): void {
    const durationSeconds = Math.round((Date.now() - this.challengeStartTime) / 1000);

    TelemetryService.getInstance().recordEvent({
      sceneId: 'Mission01VoltageScene',
      challengeId,
      eventType: 'solution_submitted',
      attemptNumber: this.attempts[challengeId] || 1,
      payload,
      result: success ? 'success' : 'failed',
      errorCode,
      hintUsed: false,
      durationSeconds
    });

    TelemetryService.getInstance().recordEvent({
      sceneId: 'Mission01VoltageScene',
      challengeId,
      eventType: 'attempt_finished',
      attemptNumber: this.attempts[challengeId] || 1,
      payload,
      result: success ? 'success' : 'failed',
      errorCode,
      hintUsed: false,
      durationSeconds
    });
  }

  private renderMissionComplete(): void {
    this.children.removeAll();
    PlaceholderArt.drawSpaceLabBackground(this);
    GameState.getInstance().setMission01VoltageStep(3);
    GameState.getInstance().updateProgress('Mission01VoltageScene', 1, 'MISSION01_VOLTAGE_COMPLETE');

    const container = document.getElementById('game-container');
    if (!container) return;

    const existing = document.getElementById('mission01-voltage-dom');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'mission01-voltage-dom';
    overlay.className = 'apulab-overlay';
    overlay.innerHTML = `
      <div class="apulab-card" style="max-width: 720px; text-align: center;">
        <div class="apulab-progress-indicator" style="font-size: 1.3rem; margin-bottom: 12px;">●●● 3 / 3</div>
        <div class="apulab-title" style="font-size: 2.2rem;">MISIÓN 01 COMPLETADA</div>
        <div class="apulab-subtitle" style="color: #E2E8F0; margin-bottom: 18px;">
          KAWSAY-1 ya tiene validada su energía de voltaje.
        </div>
        <button id="return-hub-btn" class="apulab-btn-primary">REGRESAR AL HUB</button>
      </div>
    `;
    container.appendChild(overlay);

    const returnButton = document.getElementById('return-hub-btn');
    if (!returnButton) return;

    returnButton.onclick = () => {
      playUiClick(this);
      overlay.remove();
      this.scene.start('Level1RoverHubScene');
    };
  }
}
