import * as Phaser from 'phaser';
import * as THREE from 'three';
import { GameState } from '../../systems/GameState';
import { TelemetryService } from '../../systems/TelemetryService';
import { uiTokens } from '../../ui/tokens';
import { playUiClick } from '../../ui/audio/playUiClick';
import { clearApuLabDom } from '../../ui/domComponents';
import { GameHudButton, ProgressBadge, type HudButtonLatency } from '../../ui/components/HudButton';
import { ThreeOverlay } from '../three/ThreeOverlay';
import { KawsayVisual } from '../three/KawsayVisual';
import { THREE_ASSETS } from '../three/assets/AssetManifest';
import { ThreeDisposer } from '../three/core/ThreeDisposer';
import { InteractionManager } from '../three/interaction/InteractionManager';
import type { DomainEventEmitter, SnapPayload, SnapPolarity } from '../three/interaction/InteractionTypes';
import { ApuLabMaterials } from '../three/props/ApuLabMaterials';
import { Cable } from '../three/props/Cable';
import { MultimeterVisual } from '../three/visuals/MultimeterVisual';
import { PowerModuleVisual } from '../three/visuals/PowerModuleVisual';
import { Probe } from '../three/props/Probe';

type ObjectiveState = 'available' | 'locked' | 'completed';
type VoltageMeasurementState = 'awaiting-connections' | 'partial-connection' | 'reversed-polarity' | 'correct-measurement' | 'completed';

interface ProbeConnectionState {
  redTarget: SnapPolarity | null;
  blackTarget: SnapPolarity | null;
}

interface HubObjective {
  id: 'VOLTAGE_01' | 'VOLTAGE_02' | 'VOLTAGE_03';
  number: string;
  title: string;
  subtitle: string;
  status: ObjectiveState;
  challengeId: string;
  objectiveType: 'voltage';
  icon: 'battery' | 'voltage' | 'alert';
}

interface ObjectiveCard {
  objective: HubObjective;
  container: Phaser.GameObjects.Container;
  shadow: Phaser.GameObjects.Graphics;
  glow: Phaser.GameObjects.Graphics;
  panel: Phaser.GameObjects.Graphics;
  highlight: Phaser.GameObjects.Graphics;
  icon: Phaser.GameObjects.Graphics;
  accents: Phaser.GameObjects.Graphics;
  statusShadow: Phaser.GameObjects.Graphics;
  statusPill: Phaser.GameObjects.Graphics;
  statusHighlight: Phaser.GameObjects.Graphics;
  statusIcon: Phaser.GameObjects.Graphics;
  statusText: Phaser.GameObjects.Text;
  hitArea?: Phaser.GameObjects.Zone;
}

interface CardVisual {
  body: string;
  bodyAlpha: number;
  top: string;
  topAlpha: number;
  bottom: string;
  bottomAlpha: number;
  border: string;
  borderAlpha: number;
  glowWidth: number;
  glowAlpha: number;
  highlightAlpha: number;
  accentAlpha: number;
  accent: string;
  glow: string;
  number: string;
  numberGlow: string;
  title: string;
  subtitle: string;
  badgeTop: string;
  badgeBottom: string;
  badgeBorder: string;
  statusText: string;
  iconAccent: string;
  lockedAlpha: number;
}

const INTRO_BACKGROUND_KEY = 'level1_intro_background';
const LAB_BACKGROUND_KEY = 'level1_lab_background';
const NEXT_SCENE_KEY = 'Mission01VoltageScene';
const HUB_SCENE_KEY = 'Level1RoverHubScene';
const CARD_WIDTH = 314;
const CARD_HEIGHT = 152;
const CARD_GAP = 28;
const CARD_RADIUS = 28;
const KAWSAY_PLATFORM_Y = 0.7;
const KAWSAY_TARGET_WIDTH = 1.46;
const KAWSAY_FRONT_YAW = Phaser.Math.DegToRad(6.5);
const APULAB_PROPS_PHASE_1_ID = 'apulab_props_phase_1';
const VOLTAGE_WORKBENCH_TOP_Y = -1.128;
const toColor = (value: string): number => Phaser.Display.Color.HexStringToColor(value).color;

export class Level1RoverHubScene extends Phaser.Scene {
  private background?: Phaser.GameObjects.Image;
  private missionHeaderContainer?: Phaser.GameObjects.Container;
  private headerPlate?: Phaser.GameObjects.Graphics;
  private titleExtrusion?: Phaser.GameObjects.Text;
  private titleOutline?: Phaser.GameObjects.Text;
  private titleMain?: Phaser.GameObjects.Text;
  private descriptionText?: Phaser.GameObjects.Text;
  private objectiveCards: ObjectiveCard[] = [];
  private threeOverlay?: ThreeOverlay;
  private kawsayVisual?: KawsayVisual;
  private apuLabPropsInteraction?: InteractionManager;
  private mode: 'hub' | 'voltageChallenge' = 'hub';
  private voltageChallengeHud?: Phaser.GameObjects.Container;

  constructor() {
    super({ key: 'Level1RoverHubScene' });
  }

  create(): void {
    clearApuLabDom();
    GameState.getInstance().updateProgress(HUB_SCENE_KEY, 1, 'LEVEL1_ROVER_HUB');

    this.createBackground();
    this.createHeader();
    this.createObjectiveCards();
    this.layoutScene();
    this.createThreeOverlay();
    this.playIntroMotion();

    this.scale.on(Phaser.Scale.Events.RESIZE, this.layoutScene, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.cleanup, this);
    this.events.once(Phaser.Scenes.Events.DESTROY, this.cleanup, this);
  }

  private createBackground(): void {
    const { centerX, centerY } = this.cameras.main;
    this.background = this.add.image(centerX, centerY, INTRO_BACKGROUND_KEY).setOrigin(0.5).setDepth(0);
  }

  private createHeader(): void {
    const fontFamily = uiTokens.typography.family.primary;
    const title = 'PREPARA KAWSAY-1 PARA MARTE';
    const description = 'Controla su energía resolviendo tres desafíos progresivos de voltaje.';

    this.missionHeaderContainer = this.add.container(0, 0).setDepth(18).setAlpha(0);

    this.headerPlate = this.add.graphics();

    this.titleExtrusion = this.add.text(3, 3, title, {
      fontFamily,
      fontSize: '34px',
      fontStyle: '800',
      color: '#302A5C',
      stroke: '#302A5C',
      strokeThickness: 5,
      align: 'center'
    }).setOrigin(0.5);
    this.titleExtrusion.setLineSpacing(-2);

    this.titleOutline = this.add.text(0, 0, title, {
      fontFamily,
      fontSize: '34px',
      fontStyle: '800',
      color: '#FFFFFF',
      stroke: '#8E5BD9',
      strokeThickness: 5,
      align: 'center'
    }).setOrigin(0.5);
    this.titleOutline.setLineSpacing(-2);

    this.titleMain = this.add.text(0, 0, title, {
      fontFamily,
      fontSize: '34px',
      fontStyle: '800',
      color: '#FFFFFF',
      stroke: '#FFFFFF',
      strokeThickness: 1,
      align: 'center'
    }).setOrigin(0.5);
    this.titleMain.setLineSpacing(-2);

    this.descriptionText = this.add.text(
      0,
      0,
      description,
      {
        fontFamily,
        fontSize: '15px',
        fontStyle: uiTokens.typography.weight.semibold,
        color: '#F3F0FF',
        align: 'center',
        wordWrap: {
          width: 680,
          useAdvancedWrap: true
        }
      }
    ).setOrigin(0.5);
    this.descriptionText.setShadow(0, 1, '#17132F', 4, false, true);

    this.missionHeaderContainer.add([
      this.headerPlate,
      this.titleExtrusion,
      this.titleOutline,
      this.titleMain,
      this.descriptionText
    ]);
  }

  private createObjectiveCards(): void {
    this.objectiveCards = this.getMission01VoltageObjectives().map((objective) => this.createObjectiveCard(objective));
  }

  private getMission01VoltageObjectives(): HubObjective[] {
    const progress = this.getVoltageCompletedCount();
    return [
      {
        id: 'VOLTAGE_01',
        number: '01',
        title: 'VOLTAJE 1',
        subtitle: 'Reconoce el rango correcto',
        status: this.getObjectiveStatus(progress, 1),
        challengeId: 'MISSION01_VOLTAGE_01',
        objectiveType: 'voltage',
        icon: 'battery'
      },
      {
        id: 'VOLTAGE_02',
        number: '02',
        title: 'VOLTAJE 2',
        subtitle: 'Elige el valor adecuado',
        status: this.getObjectiveStatus(progress, 2),
        challengeId: 'MISSION01_VOLTAGE_02',
        objectiveType: 'voltage',
        icon: 'voltage'
      },
      {
        id: 'VOLTAGE_03',
        number: '03',
        title: 'VOLTAJE 3',
        subtitle: 'Comprende qué pasa si el voltaje baja o sube demasiado',
        status: this.getObjectiveStatus(progress, 3),
        challengeId: 'MISSION01_VOLTAGE_03',
        objectiveType: 'voltage',
        icon: 'alert'
      }
    ];
  }

  private getObjectiveStatus(progress: 0 | 1 | 2 | 3, step: 1 | 2 | 3): ObjectiveState {
    if (progress >= step) return 'completed';
    if (progress === step - 1) return 'available';
    return 'locked';
  }

  private getVoltageCompletedCount(): 0 | 1 | 2 | 3 {
    return GameState.getInstance().mission01VoltageStep;
  }

  private createObjectiveCard(objective: HubObjective): ObjectiveCard {
    const container = this.add.container(0, 0).setDepth(20);
    const shadow = this.add.graphics();
    const glow = this.add.graphics();
    const panel = this.add.graphics();
    const highlight = this.add.graphics();
    const icon = this.add.graphics();
    const accents = this.add.graphics();
    const statusShadow = this.add.graphics();
    const statusPill = this.add.graphics();
    const statusHighlight = this.add.graphics();
    const statusIcon = this.add.graphics();
    const visual = this.getCardVisual(objective);

    this.drawVoltageGlyph(icon, objective.icon, visual);

    const numberText = this.add.text(-118, -49, objective.number, {
      fontFamily: uiTokens.typography.family.primary,
      fontSize: '38px',
      fontStyle: '800',
      color: visual.number,
      align: 'center'
    }).setOrigin(0, 0.5);
    numberText.setShadow(0, 0, visual.numberGlow, 7, false, true);

    const titleText = this.add.text(-118, -5, this.getDisplayTitle(objective), {
      fontFamily: uiTokens.typography.family.primary,
      fontSize: '21px',
      fontStyle: uiTokens.typography.weight.bold,
      color: visual.title,
      align: 'left',
      lineSpacing: 4,
      wordWrap: {
        width: CARD_WIDTH - 150,
        useAdvancedWrap: true
      }
    }).setOrigin(0, 0.5);
    titleText.setShadow(0, 2, 'rgba(23, 19, 47, 0.42)', 3, false, true);

    const subtitleText = this.add.text(-118, 25, objective.subtitle, {
      fontFamily: uiTokens.typography.family.primary,
      fontSize: objective.id === 'VOLTAGE_03' ? '12px' : '13px',
      fontStyle: uiTokens.typography.weight.medium,
      color: visual.subtitle,
      align: 'left'
    }).setOrigin(0, 0.5);
    subtitleText.setShadow(0, 1, 'rgba(23, 19, 47, 0.32)', 2, false, true);

    const statusText = this.add.text(0, 54, this.getStatusLabel(objective.status), {
      fontFamily: uiTokens.typography.family.primary,
      fontSize: '12px',
      fontStyle: uiTokens.typography.weight.bold,
      color: visual.statusText,
      align: 'center'
    }).setOrigin(0.5);

    const card: ObjectiveCard = {
      objective,
      container,
      shadow,
      glow,
      panel,
      highlight,
      icon,
      accents,
      statusShadow,
      statusPill,
      statusHighlight,
      statusIcon,
      statusText
    };

    container.add([
      shadow,
      glow,
      panel,
      highlight,
      icon,
      accents,
      statusShadow,
      statusPill,
      statusHighlight,
      statusIcon,
      numberText,
      titleText,
      subtitleText,
      statusText
    ]);
    container.setAlpha(0);
    this.drawCard(card, false);

    if (objective.status === 'available') {
      const hitArea = this.add.zone(0, 0, CARD_WIDTH, CARD_HEIGHT).setInteractive({ useHandCursor: true });
      container.add(hitArea);
      card.hitArea = hitArea;

      hitArea.on(Phaser.Input.Events.POINTER_OVER, () => {
        this.drawCard(card, true);
        this.tweens.add({
          targets: container,
          scale: 1.02,
          y: this.getCardRestY(container) - 2,
          duration: 120,
          ease: 'Sine.easeOut'
        });
      });

      hitArea.on(Phaser.Input.Events.POINTER_OUT, () => {
        this.drawCard(card, false);
        this.tweens.add({
          targets: container,
          scale: 1,
          y: this.getCardRestY(container),
          duration: 120,
          ease: 'Sine.easeOut'
        });
      });

      hitArea.on(Phaser.Input.Events.POINTER_DOWN, () => {
        playUiClick(this);
        this.tweens.add({
          targets: container,
          scale: 0.98,
          y: this.getCardRestY(container) + 2,
          duration: 80,
          ease: 'Sine.easeOut'
        });
      });

      hitArea.on(Phaser.Input.Events.POINTER_UP, () => {
        this.tweens.add({
          targets: container,
          scale: 1,
          y: this.getCardRestY(container),
          duration: 90,
          ease: 'Sine.easeOut'
        });
        this.startObjective(objective);
      });
    }

    return card;
  }

  private drawCard(card: ObjectiveCard, hover: boolean): void {
    const visual = this.getCardVisual(card.objective);
    const width = CARD_WIDTH;
    const height = CARD_HEIGHT;
    const radius = CARD_RADIUS;
    const borderColor = toColor(visual.border);

    card.shadow.clear();
    card.shadow.fillStyle(0x050410, hover ? 0.32 : 0.26);
    card.shadow.fillRoundedRect(-width / 2 + 8, -height / 2 + 13, width - 16, height, radius);
    card.shadow.fillStyle(toColor(visual.glow), hover ? 0.16 : 0.1);
    card.shadow.fillRoundedRect(-width / 2 + 20, -height / 2 + 22, width - 40, height - 2, radius);

    card.glow.clear();
    card.glow.lineStyle(hover ? visual.glowWidth + 5 : visual.glowWidth, toColor(visual.glow), hover ? visual.glowAlpha + 0.12 : visual.glowAlpha);
    card.glow.strokeRoundedRect(-width / 2 - 4, -height / 2 - 4, width + 8, height + 8, radius + 4);
    card.glow.lineStyle(2, 0xffffff, card.objective.status === 'available' ? 0.24 : 0.16);
    card.glow.strokeRoundedRect(-width / 2 + 4, -height / 2 + 4, width - 8, height - 8, radius - 4);

    card.panel.clear();
    card.panel.fillStyle(toColor(visual.bottom), 1);
    card.panel.fillRoundedRect(-width / 2, -height / 2, width, height, radius);
    card.panel.fillStyle(toColor(visual.body), hover ? 1 : visual.bodyAlpha);
    card.panel.fillRoundedRect(-width / 2 + 4, -height / 2 + 4, width - 8, height - 8, radius - 4);
    card.panel.fillStyle(toColor(visual.top), hover ? visual.topAlpha + 0.12 : visual.topAlpha);
    card.panel.fillRoundedRect(-width / 2 + 7, -height / 2 + 7, width - 14, height * 0.48, radius - 7);
    card.panel.fillStyle(0xffffff, hover ? 0.11 : 0.08);
    card.panel.fillRoundedRect(-width / 2 + 12, -height / 2 + 10, width - 24, 30, 18);
    card.panel.lineStyle(3, borderColor, hover ? visual.borderAlpha + 0.08 : visual.borderAlpha);
    card.panel.strokeRoundedRect(-width / 2, -height / 2, width, height, radius);
    card.panel.lineStyle(1, 0xffffff, card.objective.status === 'available' ? 0.42 : 0.3);
    card.panel.strokeRoundedRect(-width / 2 + 5, -height / 2 + 5, width - 10, height - 10, radius - 5);

    card.highlight.clear();
    card.highlight.fillStyle(0xffffff, hover ? visual.highlightAlpha + 0.08 : visual.highlightAlpha);
    card.highlight.fillRoundedRect(-width / 2 + 38, -height / 2 + 13, width - 76, 8, 5);
    card.highlight.fillStyle(0xffffff, hover ? 0.17 : 0.12);
    card.highlight.fillRoundedRect(-width / 2 + 66, -height / 2 + 27, width - 132, 4, 3);
    card.highlight.fillStyle(borderColor, card.objective.status === 'available' ? 0.44 : 0.28);
    card.highlight.fillRoundedRect(-64, -height / 2 + 38, 128, 3, 2);

    this.drawCardAccents(card.accents, visual, hover);

    this.drawStatusState(card);
  }

  private drawVoltageGlyph(graphics: Phaser.GameObjects.Graphics, icon: HubObjective['icon'], visual: CardVisual): void {
    graphics.clear();
    const accent = toColor(visual.iconAccent);
    graphics.fillStyle(0xffffff, 0.18);
    graphics.fillRoundedRect(82, -54, 52, 52, 14);
    graphics.lineStyle(2, 0xffffff, 0.72);
    graphics.strokeRoundedRect(82, -54, 52, 52, 14);

    if (icon === 'battery') {
      graphics.lineStyle(3, 0xffffff, 0.9);
      graphics.strokeRoundedRect(96, -41, 25, 28, 5);
      graphics.fillStyle(0xffffff, 0.8);
      graphics.fillRoundedRect(104, -47, 9, 6, 3);
      graphics.fillStyle(accent, 0.96);
      graphics.fillRoundedRect(101, -25, 15, 7, 3);
      return;
    }

    if (icon === 'voltage') {
      graphics.lineStyle(4, accent, 0.95);
      graphics.beginPath();
      graphics.moveTo(94, -26);
      graphics.lineTo(104, -14);
      graphics.lineTo(120, -42);
      graphics.strokePath();
      graphics.fillStyle(0xffffff, 0.95);
      graphics.fillCircle(94, -26, 4);
      graphics.fillCircle(120, -42, 4);
      return;
    }

    graphics.lineStyle(4, accent, 0.95);
    graphics.beginPath();
    graphics.moveTo(108, -45);
    graphics.lineTo(125, -15);
    graphics.lineTo(91, -15);
    graphics.closePath();
    graphics.strokePath();
    graphics.fillStyle(0xffffff, 0.95);
    graphics.fillRoundedRect(106, -34, 4, 12, 2);
    graphics.fillCircle(108, -18, 2.5);
  }

  private drawCardAccents(accents: Phaser.GameObjects.Graphics, visual: CardVisual, hover: boolean): void {
    const width = CARD_WIDTH;
    const height = CARD_HEIGHT;
    const color = toColor(visual.accent);
    const alpha = hover ? visual.accentAlpha + 0.08 : visual.accentAlpha;
    const inset = 12;
    const length = 22;

    accents.clear();
    accents.lineStyle(2, color, alpha);
    accents.beginPath();
    accents.moveTo(-width / 2 + inset, -height / 2 + inset + length);
    accents.lineTo(-width / 2 + inset, -height / 2 + inset);
    accents.lineTo(-width / 2 + inset + length, -height / 2 + inset);
    accents.moveTo(width / 2 - inset - length, -height / 2 + inset);
    accents.lineTo(width / 2 - inset, -height / 2 + inset);
    accents.lineTo(width / 2 - inset, -height / 2 + inset + length);
    accents.moveTo(-width / 2 + inset, height / 2 - inset - length);
    accents.lineTo(-width / 2 + inset, height / 2 - inset);
    accents.lineTo(-width / 2 + inset + length, height / 2 - inset);
    accents.moveTo(width / 2 - inset - length, height / 2 - inset);
    accents.lineTo(width / 2 - inset, height / 2 - inset);
    accents.lineTo(width / 2 - inset, height / 2 - inset - length);
    accents.strokePath();
  }

  private drawStatusState(card: ObjectiveCard): void {
    const visual = this.getCardVisual(card.objective);

    card.statusShadow.clear();
    card.statusPill.clear();
    card.statusHighlight.clear();
    card.statusIcon.clear();

    const isAvailable = card.objective.status === 'available';
    const pillWidth = isAvailable ? 124 : 122;
    const pillHeight = 28;
    const pillX = -pillWidth / 2;
    const pillY = 42;

    card.statusText.setVisible(true);
    card.statusText.setText(this.getStatusLabel(card.objective.status));

    card.statusShadow.fillStyle(0x050410, isAvailable ? 0.24 : 0.18);
    card.statusShadow.fillRoundedRect(pillX + 2, pillY + 4, pillWidth, pillHeight, pillHeight / 2);

    card.statusPill.fillStyle(toColor(visual.badgeBottom), 1);
    card.statusPill.fillRoundedRect(pillX, pillY, pillWidth, pillHeight, pillHeight / 2);
    card.statusPill.fillStyle(toColor(visual.badgeTop), 0.95);
    card.statusPill.fillRoundedRect(pillX + 2, pillY + 2, pillWidth - 4, pillHeight * 0.52, pillHeight / 2 - 2);
    card.statusPill.lineStyle(1.5, toColor(visual.badgeBorder), 0.96);
    card.statusPill.strokeRoundedRect(pillX, pillY, pillWidth, pillHeight, pillHeight / 2);

    card.statusHighlight.fillStyle(0xffffff, isAvailable ? 0.34 : 0.24);
    card.statusHighlight.fillRoundedRect(pillX + 18, pillY + 4, pillWidth - 36, 4, 3);

    if (card.objective.status === 'locked') {
      card.statusText.setColor(visual.statusText);
      card.statusText.setPosition(10, 56);
      this.drawStatusLock(card.statusIcon, -46, 56, visual.statusText);
    } else if (card.objective.status === 'completed') {
      card.statusText.setColor(visual.statusText);
      card.statusText.setPosition(10, 56);
      this.drawStatusCheck(card.statusIcon, -46, 55);
    } else {
      card.statusText.setColor(visual.statusText);
      card.statusText.setPosition(0, 56);
    }
  }

  private drawStatusLock(icon: Phaser.GameObjects.Graphics, x: number, y: number, colorValue: string = uiTokens.colors.brand.lavender): void {
    const color = toColor(colorValue);

    icon.lineStyle(1.5, color, 0.9);
    icon.strokeRoundedRect(x - 5, y - 2, 10, 8, 2);
    icon.strokeCircle(x, y - 3, 5);
    icon.fillStyle(color, 0.9);
    icon.fillCircle(x, y + 2, 1.3);
  }

  private drawStatusCheck(icon: Phaser.GameObjects.Graphics, x: number, y: number): void {
    icon.lineStyle(2, toColor(uiTokens.colors.text.onDark), 0.92);
    icon.beginPath();
    icon.moveTo(x - 5, y);
    icon.lineTo(x - 1, y + 4);
    icon.lineTo(x + 7, y - 5);
    icon.strokePath();
  }

  private getCardVisual(objective: HubObjective): CardVisual {
    const lockedAlpha = objective.status === 'locked' ? 0.82 : 1;

    if (objective.status === 'completed') {
      return {
        body: '#35C7D7',
        bodyAlpha: 0.98,
        top: '#7FF4FF',
        topAlpha: 0.58,
        bottom: '#4D4288',
        bottomAlpha: 1,
        border: '#D9F7FF',
        borderAlpha: 0.96,
        glowWidth: 8,
        glowAlpha: 0.28,
        highlightAlpha: 0.28,
        accentAlpha: 0.52,
        accent: '#F2C94C',
        glow: '#39E7FF',
        number: uiTokens.colors.text.onDark,
        numberGlow: 'rgba(0, 242, 254, 0.58)',
        title: uiTokens.colors.text.onDark,
        subtitle: uiTokens.colors.brand.cream,
        badgeTop: '#A7FFF7',
        badgeBottom: '#3BE9D9',
        badgeBorder: '#E7FFFF',
        statusText: uiTokens.colors.text.onDark,
        iconAccent: '#F2C94C',
        lockedAlpha
      };
    }

    if (objective.id === 'VOLTAGE_02') {
      return {
        body: '#8A5CFF',
        bodyAlpha: lockedAlpha,
        top: '#C38CFF',
        topAlpha: 0.66,
        bottom: '#5B3FD6',
        bottomAlpha: 1,
        border: '#F0D8FF',
        borderAlpha: 0.96,
        glowWidth: 8,
        glowAlpha: 0.3,
        highlightAlpha: 0.28,
        accentAlpha: 0.58,
        accent: '#FFE5FF',
        glow: '#D66BFF',
        number: '#FFFFFF',
        numberGlow: 'rgba(214, 107, 255, 0.68)',
        title: uiTokens.colors.text.onDark,
        subtitle: '#FFF3FF',
        badgeTop: '#EED8FF',
        badgeBottom: '#C7A7FF',
        badgeBorder: '#FFFFFF',
        statusText: '#5A3A86',
        iconAccent: '#F2C94C',
        lockedAlpha
      };
    }

    if (objective.id === 'VOLTAGE_03') {
      return {
        body: '#E85ABF',
        bodyAlpha: lockedAlpha,
        top: '#FF90D9',
        topAlpha: 0.64,
        bottom: '#6F4AD8',
        bottomAlpha: 1,
        border: '#FFD5F2',
        borderAlpha: 0.95,
        glowWidth: 8,
        glowAlpha: 0.28,
        highlightAlpha: 0.26,
        accentAlpha: 0.54,
        accent: '#CFFAFF',
        glow: '#FF69D8',
        number: '#FFFFFF',
        numberGlow: 'rgba(255, 105, 216, 0.68)',
        title: uiTokens.colors.text.onDark,
        subtitle: '#FFF2FB',
        badgeTop: '#DDFBFF',
        badgeBottom: '#7DEDF2',
        badgeBorder: '#FFFFFF',
        statusText: '#1B5D58',
        iconAccent: '#00F2FE',
        lockedAlpha
      };
    }

    return {
      body: '#22BFEA',
      bodyAlpha: 1,
      top: '#66F4FF',
      topAlpha: 0.68,
      bottom: '#366CE8',
      bottomAlpha: 1,
      border: '#D9F7FF',
      borderAlpha: 0.98,
      glowWidth: 11,
      glowAlpha: 0.42,
      highlightAlpha: 0.34,
      accentAlpha: 0.66,
      accent: '#C9F7FF',
      glow: '#39E7FF',
      number: '#FFFFFF',
      numberGlow: 'rgba(0, 242, 254, 0.72)',
      title: uiTokens.colors.text.onDark,
      subtitle: '#F2FBFF',
      badgeTop: '#FFD85E',
      badgeBottom: '#F2C94C',
      badgeBorder: '#FFF1B2',
      statusText: '#5A4300',
      iconAccent: '#F2C94C',
      lockedAlpha
    };
  }

  private getStatusLabel(status: ObjectiveState): string {
    if (status === 'completed') return 'COMPLETADA';
    if (status === 'locked') return 'BLOQUEADO';
    return 'ENTRAR';
  }

  private getProgressLabel(progress: 0 | 1 | 2 | 3): string {
    return `${progress} / 3`;
  }

  private getProgressTrack(progress: 0 | 1 | 2 | 3): string {
    const dots = [0, 1, 2].map((index) => index < progress ? '●' : '○');
    return `${dots[0]} ━━━ ${dots[1]} ━━━ ${dots[2]}`;
  }

  private getDisplayTitle(objective: HubObjective): string {
    if (objective.status !== 'locked') return objective.title;
    return objective.title.replace(' ', '\n');
  }

  private layoutScene(): void {
    if (this.mode !== 'hub') return;

    const { width, height } = this.scale;
    this.layoutBackground();
    this.layoutHeader(width, height);

    const cardY = Math.min(height - 104, height * 0.765);
    const gap = Math.min(Math.max(width * 0.018, 18), CARD_GAP);
    const totalWidth = CARD_WIDTH * this.objectiveCards.length + gap * (this.objectiveCards.length - 1);
    const startX = width / 2 - totalWidth / 2 + CARD_WIDTH / 2;
    this.objectiveCards.forEach((card, index) => {
      card.container.setPosition(startX + index * (CARD_WIDTH + gap), cardY);
      card.container.setData('restY', cardY);
    });
  }

  private getCardRestY(container: Phaser.GameObjects.Container): number {
    return (container.getData('restY') as number | undefined) ?? container.y;
  }

  private layoutBackground(): void {
    if (!this.background) return;

    const { width, height } = this.scale;
    const source = this.background.texture.getSourceImage() as HTMLImageElement | HTMLCanvasElement;
    const sourceWidth = source.width || this.background.width;
    const sourceHeight = source.height || this.background.height;
    const scale = Math.max(width / sourceWidth, height / sourceHeight);

    this.background
      .setPosition(width / 2, height / 2)
      .setScale(scale);
  }

  private setBackgroundTexture(textureKey: string): void {
    if (!this.background || this.background.texture.key === textureKey) return;

    this.background.setTexture(textureKey);
    this.layoutBackground();
  }

  private layoutHeader(width: number, height: number): void {
    if (
      !this.missionHeaderContainer ||
      !this.headerPlate ||
      !this.titleExtrusion ||
      !this.titleOutline ||
      !this.titleMain ||
      !this.descriptionText
    ) return;

    const titleText = 'PREPARA KAWSAY-1 PARA MARTE';
    const titleMaxWidth = width * 0.82;
    const useTwoLines = width < 940;
    const displayTitle = useTwoLines ? 'PREPARA KAWSAY-1\nPARA MARTE' : titleText;
    const titleFontSize = Phaser.Math.Clamp(Math.floor(width * 0.034), 30, 36);
    const titleLayers = [this.titleExtrusion, this.titleOutline, this.titleMain];

    titleLayers.forEach((layer) => {
      layer.setText(displayTitle);
      layer.setFontSize(titleFontSize);
      layer.setWordWrapWidth(titleMaxWidth, true);
    });

    const titleHeight = this.titleMain.height;
    const titleY = titleHeight / 2;
    const descriptionY = titleY + titleHeight / 2 + 5 + this.descriptionText.height / 2;
    const descriptionWrapWidth = Math.min(width * 0.84, 720);
    const headerTopY = height < 620 ? 10 : 12;
    const plateWidth = Math.min(width * 0.78, 860);
    const plateHeight = Math.max(104, descriptionY + this.descriptionText.height / 2 + 18);

    this.headerPlate.clear();
    this.headerPlate.fillStyle(0x0b0e26, 0.48);
    this.headerPlate.fillRoundedRect(-plateWidth / 2, -4, plateWidth, plateHeight, 28);
    this.headerPlate.lineStyle(2, 0x00f2fe, 0.46);
    this.headerPlate.strokeRoundedRect(-plateWidth / 2 + 5, 1, plateWidth - 10, plateHeight - 10, 24);
    this.headerPlate.lineStyle(2, 0xf2c94c, 0.5);
    this.headerPlate.beginPath();
    this.headerPlate.moveTo(-plateWidth / 2 + 70, plateHeight - 10);
    this.headerPlate.lineTo(plateWidth / 2 - 70, plateHeight - 10);
    this.headerPlate.strokePath();

    this.titleExtrusion.setPosition(3, titleY + 3);
    this.titleOutline.setPosition(0, titleY);
    this.titleMain.setPosition(0, titleY);
    this.descriptionText.setPosition(0, descriptionY);
    this.descriptionText.setWordWrapWidth(descriptionWrapWidth, true);
    this.descriptionText.setFontSize(width < 900 ? 13 : 14);

    this.missionHeaderContainer.setPosition(width / 2, headerTopY);
  }

  private startObjective(objective: HubObjective): void {
    if (objective.status !== 'available') return;

    GameState.getInstance().updateProgress(HUB_SCENE_KEY, 1, objective.challengeId);
    TelemetryService.getInstance().recordEvent({
      sceneId: HUB_SCENE_KEY,
      challengeId: objective.challengeId,
      eventType: 'challenge_started',
      payload: {
        mission_id: 'kawsay_1',
        mission: 'kawsay_1',
        objective: objective.objectiveType,
        objective_id: objective.id,
        objective_type: objective.objectiveType,
        source: 'level1_rover_hub'
      }
    });

    if (objective.id === 'VOLTAGE_01') {
      this.enterVoltageChallengeMode();
      return;
    }

    this.scene.start(NEXT_SCENE_KEY);
  }

  private createThreeOverlay(): void {
    if (typeof document === 'undefined') return;

    const container = document.getElementById('game-container');
    if (!container) return;

    this.threeOverlay = new ThreeOverlay(container);
    this.threeOverlay.start();
    void this.loadThreeModels();
  }

  private async loadThreeModels(): Promise<void> {
    if (!this.threeOverlay) return;

    const kawsayModel = await this.threeOverlay.loadModelInstance(THREE_ASSETS.kawsay).catch((error: unknown) => {
      console.error(`[ApuLab] Failed to load KAWSAY-1 GLB: ${THREE_ASSETS.kawsay}`, error);
      return undefined;
    });

    if (kawsayModel) {
      this.kawsayVisual = new KawsayVisual(kawsayModel, {
        targetWidth: KAWSAY_TARGET_WIDTH,
        platformY: KAWSAY_PLATFORM_Y,
        entryDurationSeconds: 1.45
      });

      const kawsayConfig = {
        id: 'kawsay_1',
        url: THREE_ASSETS.kawsay,
        position: { x: 0.02, y: this.kawsayVisual.getPlatformAlignedY(), z: 0.04 },
        rotation: { x: 0, y: KAWSAY_FRONT_YAW, z: 0 },
        scale: this.kawsayVisual.scale
      };

      this.threeOverlay.addObject(kawsayConfig, this.kawsayVisual.root, undefined, this.kawsayVisual);
      if (this.mode === 'voltageChallenge') {
        this.setKawsayVisualVisible(false);
      }
    }

    const hopperConfig = {
      id: 'hopper',
      url: THREE_ASSETS.hopper,
      position: { x: -1.45, y: -0.42, z: 0.28 },
      rotation: { x: 0, y: 0.28, z: 0 },
      scale: 0.78,
      idle: 'hopper' as const
    };

    try {
      await this.threeOverlay.loadModel(hopperConfig);
    } catch {
      console.warn(`[ApuLab] Pending Level 1 hub 3D asset: ${hopperConfig.url}`);
    }
  }

  private enterVoltageChallengeMode(): void {
    if (this.mode === 'voltageChallenge') return;

    this.mode = 'voltageChallenge';
    this.setBackgroundTexture(LAB_BACKGROUND_KEY);
    this.setHubModeVisible(false);
    void this.createVoltageChallengeHud();
    this.threeOverlay?.applyCameraPreset('voltageWorkbench', 0.36);
    this.threeOverlay?.applyLightingPreset('voltage-workbench');
    this.setKawsayVisualVisible(false);
    this.createApuLabPropsPrototype();
  }

  private exitVoltageChallengeMode(): void {
    if (this.mode === 'hub') return;

    this.mode = 'hub';
    this.setBackgroundTexture(INTRO_BACKGROUND_KEY);
    this.voltageChallengeHud?.destroy(true);
    this.voltageChallengeHud = undefined;
    this.apuLabPropsInteraction?.dispose();
    this.apuLabPropsInteraction = undefined;
    this.threeOverlay?.removeObject(APULAB_PROPS_PHASE_1_ID);
    this.threeOverlay?.setOutlinedObjects([]);
    this.threeOverlay?.applyCameraPreset('hub', 0.32);
    this.threeOverlay?.applyLightingPreset('hub');
    this.setKawsayVisualVisible(true);
    this.setHubModeVisible(true);
    this.layoutScene();
  }

  private setKawsayVisualVisible(visible: boolean): void {
    if (this.kawsayVisual) {
      this.kawsayVisual.root.visible = visible;
    }

    this.threeOverlay?.getScene().traverse((object) => {
      if (object.name.startsWith('Kawsay')) {
        object.visible = visible;
      }
    });
  }

  private setHubModeVisible(visible: boolean): void {
    this.missionHeaderContainer?.setVisible(visible);
    this.objectiveCards.forEach((card) => {
      card.container.setVisible(visible);
      if (!card.hitArea) return;
      if (visible) {
        card.hitArea.setInteractive({ useHandCursor: true });
      } else {
        card.hitArea.disableInteractive();
      }
    });
  }

  private async createVoltageChallengeHud(): Promise<void> {
    this.voltageChallengeHud?.destroy(true);
    await this.prepareChallengeHudFonts();
    if (this.mode !== 'voltageChallenge') return;

    const fontFamily = uiTokens.typography.family.primary;
    const hudTokens = uiTokens.hud.challenge;
    const hud = this.add.container(0, 0).setDepth(40);
    const controlHeight = hudTokens.controlHeight;
    const controlTop = hudTokens.safeArea.top;
    const controlGap = hudTokens.gap;
    const explainWidth = hudTokens.explanationButton.width;
    const iconButtonSize = hudTokens.iconButton.size;
    const progressWidth = hudTokens.progress.width;
    const groupRight = uiTokens.sizes.canvas.width - hudTokens.safeArea.right;
    const groupWidth = explainWidth + iconButtonSize + progressWidth + controlGap * 2;
    const groupLeft = groupRight - groupWidth;
    const topControls = this.add.container(groupLeft, controlTop);

    const title = this.add.text(hudTokens.safeArea.left, 52, 'VOLTAJE', {
      fontFamily,
      fontSize: '32px',
      fontStyle: uiTokens.typography.weight.bold,
      color: uiTokens.colors.text.onDark
    }).setOrigin(0, 0);
    title.setShadow(0, 3, 'rgba(45, 38, 84, 0.52)', 4, false, true);

    const instruction = this.add.text(hudTokens.safeArea.left, 91, 'Conecta las puntas para medir el voltaje', {
      fontFamily,
      fontSize: '19px',
      fontStyle: uiTokens.typography.weight.semibold,
      color: uiTokens.colors.brand.cream
    }).setOrigin(0, 0);
    instruction.setShadow(0, 2, 'rgba(45, 38, 84, 0.46)', 3, false, true);

    const explainButton = new GameHudButton(this, {
      x: explainWidth / 2,
      y: 0,
      width: explainWidth,
      height: controlHeight,
      icon: 'play',
      variant: 'yellowPrimary',
      label: 'VER EXPLICACIÓN',
      latencyLabel: 'VER EXPLICACIÓN',
      onClick: (latency) => this.requestVoltageExplanation(latency)
    });

    const bookButtonX = explainWidth + controlGap + iconButtonSize / 2;
    const bookButton = new GameHudButton(this, {
      x: bookButtonX,
      y: 0,
      width: iconButtonSize,
      height: iconButtonSize,
      icon: 'book',
      variant: 'blueIcon',
      latencyLabel: 'BOOK',
      onClick: (latency) => this.requestConceptHelp(latency)
    });

    const progressX = explainWidth + controlGap + iconButtonSize + controlGap + progressWidth / 2;
    const progressBadge = new ProgressBadge(this, {
      x: progressX,
      y: 0,
      current: this.getVoltageChallengeProgressStep(),
      total: 3
    });

    topControls.add([explainButton, bookButton, progressBadge]);
    hud.add([title, instruction, topControls]);
    this.voltageChallengeHud = hud;

    this.tweens.add({
      targets: instruction,
      alpha: 0.94,
      delay: 5200,
      duration: 650,
      ease: 'Sine.easeOut'
    });
  }

  private async prepareChallengeHudFonts(): Promise<void> {
    if (!document.fonts) return;
    await document.fonts.load('600 14px Poppins');
    await document.fonts.ready;
  }

  private requestVoltageExplanation(latency?: HudButtonLatency): void {
    const t2 = performance.now();
    if (import.meta.env.DEV && latency) {
      console.debug(`[HUD latency] ${latency.label} T2-T0 ${(t2 - latency.t0).toFixed(2)}ms`);
      console.debug(`[HUD latency] ${latency.label} T3 unavailable: no local content listener found`);
    }
    this.events.emit('voltage-explanation-requested');
  }

  private requestConceptHelp(latency?: HudButtonLatency): void {
    const t2 = performance.now();
    if (import.meta.env.DEV && latency) {
      console.debug(`[HUD latency] ${latency.label} T2-T0 ${(t2 - latency.t0).toFixed(2)}ms`);
      console.debug(`[HUD latency] ${latency.label} T3 unavailable: no local content listener found`);
    }
    this.events.emit('concept-help-requested', {
      challengeId: GameState.getInstance().currentChallenge,
      source: 'voltage_challenge_hud'
    });
  }

  private getVoltageChallengeProgressBadge(): string {
    return `${this.getVoltageChallengeProgressStep()} / 3`;
  }

  private getVoltageChallengeProgressStep(): number {
    const currentChallenge = GameState.getInstance().currentChallenge;
    const match = currentChallenge.match(/MISSION01_VOLTAGE_0?([1-3])$/);
    if (match) return Number(match[1]);

    const step = GameState.getInstance().mission01VoltageStep;
    return Phaser.Math.Clamp(step || 1, 1, 3);
  }

  private createApuLabPropsPrototype(): void {
    if (!this.threeOverlay || this.apuLabPropsInteraction) return;

    const root = new THREE.Group();
    root.name = 'ApuLabPropsPhase1Prototype';
    const materials = new ApuLabMaterials();
    const multimeter = new MultimeterVisual(this.threeOverlay.getAssetManager());
    const blackProbe = new Probe({
      id: 'black_probe_01',
      polarity: 'negative',
      bodyColor: 0x080a0f,
      cableColor: 0x1c1f24,
      homePosition: new THREE.Vector3(0.28, -1.08, 1.02),
      scale: 0.4
    }, materials);
    const redProbe = new Probe({
      id: 'red_probe_01',
      polarity: 'positive',
      bodyColor: 0xe53945,
      cableColor: 0xa3131d,
      homePosition: new THREE.Vector3(-0.08, -1.08, 0.82),
      scale: 0.4
    }, materials);
    const redCable = new Cable('red_cable_01', redProbe.cableColor);
    const blackCable = new Cable('black_cable_01', blackProbe.cableColor);
    const electricalModule = new PowerModuleVisual('kawsay_power_module_01', materials, new THREE.Vector3(1.1, -0.84, 0.58));
    const disposer = new ThreeDisposer();
    const connections: ProbeConnectionState = {
      redTarget: null,
      blackTarget: null
    };
    let measurementState: VoltageMeasurementState = 'awaiting-connections';
    let snapCount = 0;
    let reversedCount = 0;
    let completed = false;
    const challengeStartedAt = performance.now();
    let firstInteractionAt: number | null = null;
    let completionTimer: Phaser.Time.TimerEvent | undefined;

    const workSurfaceMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1e24,
      roughness: 0.58,
      metalness: 0.16
    });
    const workSurfaceEdgeMaterial = new THREE.MeshStandardMaterial({
      color: 0x454b55,
      roughness: 0.42,
      metalness: 0.5
    });
    const workSurface = new THREE.Mesh(
      new THREE.BoxGeometry(3.48, 0.04, 0.9),
      workSurfaceMaterial
    );
    workSurface.name = 'VoltageChallengeWorkSurface';
    workSurface.position.set(0.02, -1.152, 0.67);
    workSurface.rotation.x = THREE.MathUtils.degToRad(0);
    workSurface.receiveShadow = true;

    const frontEdge = new THREE.Mesh(new THREE.BoxGeometry(3.52, 0.026, 0.038), workSurfaceEdgeMaterial);
    frontEdge.name = 'VoltageChallengeWorkSurfaceFrontEdge';
    frontEdge.position.set(0.02, -1.118, 1.13);
    frontEdge.receiveShadow = true;

    const rearEdge = new THREE.Mesh(new THREE.BoxGeometry(3.1, 0.014, 0.018), materials.violet);
    rearEdge.name = 'VoltageChallengeWorkSurfaceRearAccent';
    rearEdge.position.set(0.02, -1.13, 0.22);

    const leftGuide = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.01, 0.66), materials.cyanEmissive);
    leftGuide.name = 'VoltageChallengeWorkSurfaceLeftGuide';
    leftGuide.position.set(-1.48, -1.124, 0.68);

    const rightGuide = leftGuide.clone();
    rightGuide.name = 'VoltageChallengeWorkSurfaceRightGuide';
    rightGuide.position.x = 1.52;

    multimeter.object.position.set(-0.94, -0.48, 0.66);
    multimeter.object.scale.setScalar(0.88);
    multimeter.object.rotation.set(THREE.MathUtils.degToRad(76), THREE.MathUtils.degToRad(5), 0);
    blackProbe.object.rotation.z = THREE.MathUtils.degToRad(-7);
    redProbe.object.rotation.z = THREE.MathUtils.degToRad(4);
    electricalModule.object.rotation.x = THREE.MathUtils.degToRad(-10);
    electricalModule.object.scale.setScalar(0.92);

    root.add(workSurface, frontEdge, rearEdge, leftGuide, rightGuide, multimeter.object, blackCable.object, redCable.object, blackProbe.object, redProbe.object, electricalModule.object);
    this.configureVoltageWorkbenchShadows(multimeter.object, blackCable.object, redCable.object, blackProbe.object, redProbe.object, electricalModule.object);
    this.alignObjectBottomToY(blackProbe.object, VOLTAGE_WORKBENCH_TOP_Y + 0.016);
    this.alignObjectBottomToY(redProbe.object, VOLTAGE_WORKBENCH_TOP_Y + 0.016);
    this.alignObjectBottomToY(electricalModule.object, VOLTAGE_WORKBENCH_TOP_Y + 0.01);
    blackProbe.setHomeFromCurrent();
    redProbe.setHomeFromCurrent();

    const updateCables = (): void => {
      redCable.update(multimeter.getJackWorldPosition('voltage'), redProbe.getCableAnchorWorldPosition());
      blackCable.update(multimeter.getJackWorldPosition('com'), blackProbe.getCableAnchorWorldPosition());
    };

    const evaluateMeasurement = (): { reading: number; state: VoltageMeasurementState } => {
      completionTimer?.remove(false);
      completionTimer = undefined;

      let reading = 0;
      if (connections.redTarget === 'positive' && connections.blackTarget === 'negative') {
        reading = 12.6;
        measurementState = completed ? 'completed' : 'correct-measurement';
      } else if (connections.redTarget === 'negative' && connections.blackTarget === 'positive') {
        reading = -12.6;
        measurementState = 'reversed-polarity';
        reversedCount += 1;
      } else if (connections.redTarget || connections.blackTarget) {
        measurementState = 'partial-connection';
      } else {
        measurementState = 'awaiting-connections';
      }

      multimeter.setReading(reading);
      eventEmitter.emit('measurement-changed', {
        reading,
        measurementState,
        redTarget: connections.redTarget,
        blackTarget: connections.blackTarget
      });

      if (measurementState === 'correct-measurement' && !completed) {
        electricalModule.pulseValidMeasurement();
        completionTimer = this.time.delayedCall(950, () => {
          if (connections.redTarget !== 'positive' || connections.blackTarget !== 'negative' || completed) return;
          completed = true;
          measurementState = 'completed';
          const durationSeconds = (performance.now() - challengeStartedAt) / 1000;
          const payload = {
            voltage: 12.6,
            polarity: 'correct',
            redTarget: connections.redTarget,
            blackTarget: connections.blackTarget,
            snapCount,
            reversedCount,
            timeToFirstInteractionSeconds: firstInteractionAt ? (firstInteractionAt - challengeStartedAt) / 1000 : null,
            timeToCorrectMeasurementSeconds: durationSeconds,
            hintUsed: false
          };
          eventEmitter.emit('measurement-complete', payload);
        });
      }

      return { reading, state: measurementState };
    };

    void multimeter.load().then(() => {
      this.configureVoltageWorkbenchShadows(multimeter.object);
      this.alignObjectBottomToY(multimeter.object, VOLTAGE_WORKBENCH_TOP_Y + 0.012);
      multimeter.setReading(0);
      updateCables();
    }).catch((error: unknown) => {
      console.error('[ApuLab] Failed to load real multimeter GLB', error);
    });

    const eventEmitter: DomainEventEmitter = {
      emit: (eventName: 'probe-snapped' | 'probe-disconnected' | 'measurement-changed' | 'measurement-complete', payload: SnapPayload | Record<string, unknown>) => {
        this.events.emit(eventName, payload);
        TelemetryService.getInstance().recordEvent({
          sceneId: HUB_SCENE_KEY,
          challengeId: 'APULAB_PROPS_PHASE_1',
          eventType: eventName,
          payload: {
            event_name: eventName,
            ...payload
          },
          result: eventName === 'measurement-complete' ? 'success' : 'pending'
        });
      }
    };

    this.apuLabPropsInteraction = new InteractionManager({
      container: this.threeOverlay.getContainer(),
      camera: this.threeOverlay.getCamera(),
      eventEmitter,
      canSnap: (probe, target) => {
        const occupyingProbe = [redProbe, blackProbe].find((candidate) => candidate.connectedTarget === target.id);
        return !occupyingProbe || occupyingProbe.id === probe.id;
      },
      onProbeDisconnected: (probe, targetId) => {
        if (!firstInteractionAt) firstInteractionAt = performance.now();
        if (probe.polarity === 'positive') {
          connections.redTarget = null;
        } else {
          connections.blackTarget = null;
        }
        if (targetId === electricalModule.positiveSnapTarget.id) {
          electricalModule.setTerminalSnapped('positive', false);
        }
        if (targetId === electricalModule.negativeSnapTarget.id) {
          electricalModule.setTerminalSnapped('negative', false);
        }
        evaluateMeasurement();
      },
      onProbeSnapped: (probe, target) => {
        if (!firstInteractionAt) firstInteractionAt = performance.now();
        snapCount += 1;
        if (probe.polarity === 'positive') {
          connections.redTarget = target.polarity;
        } else {
          connections.blackTarget = target.polarity;
        }
        electricalModule.setTerminalSnapped(target.polarity, true);
        evaluateMeasurement();
      },
      onOutlinedObjectsChange: (objects) => this.threeOverlay?.setOutlinedObjects(objects)
    });
    this.apuLabPropsInteraction.registerDraggable(blackProbe);
    this.apuLabPropsInteraction.registerDraggable(redProbe);
    this.apuLabPropsInteraction.registerSnapTarget(electricalModule.positiveSnapTarget);
    this.apuLabPropsInteraction.registerSnapTarget(electricalModule.negativeSnapTarget);
    multimeter.setReading(0);
    updateCables();

    this.threeOverlay.addObject(
      {
        id: APULAB_PROPS_PHASE_1_ID,
        url: 'procedural://apulab-props-phase-1',
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: 1
      },
      root,
      undefined,
      {
        update: (delta) => {
          electricalModule.update(delta);
          updateCables();
        },
        dispose: () => {
          completionTimer?.remove(false);
          this.apuLabPropsInteraction?.dispose();
          this.apuLabPropsInteraction = undefined;
          redCable.dispose();
          blackCable.dispose();
          redProbe.dispose();
          blackProbe.dispose();
          multimeter.dispose();
          electricalModule.dispose();
          materials.dispose();
          disposer.disposeMaterial(workSurfaceMaterial);
          disposer.disposeMaterial(workSurfaceEdgeMaterial);
          disposer.disposeObject(root);
        }
      }
    );
  }

  private configureVoltageWorkbenchShadows(...objects: THREE.Object3D[]): void {
    objects.forEach((object) => {
      object.traverse((child) => {
        const mesh = child as THREE.Mesh;
        if (!mesh.isMesh) return;
        mesh.castShadow = true;
        mesh.receiveShadow = mesh.name.toLowerCase().includes('worksurface');
      });
    });
  }

  private alignObjectBottomToY(object: THREE.Object3D, targetY: number): void {
    object.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(object);
    if (!Number.isFinite(box.min.y)) return;
    object.position.y += targetY - box.min.y;
  }

  private playIntroMotion(): void {
    const headerTargets = [this.missionHeaderContainer].filter(Boolean);
    this.missionHeaderContainer?.setY(this.missionHeaderContainer.y - 6);
    this.tweens.add({
      targets: headerTargets,
      alpha: 1,
      y: '+=6',
      duration: 260,
      delay: 100,
      ease: 'Sine.easeOut'
    });

    this.objectiveCards.forEach((card, index) => {
      const restY = this.getCardRestY(card.container);
      card.container.setY(restY + 8);
      this.tweens.add({
        targets: card.container,
        alpha: 1,
        y: restY,
        duration: 300,
        delay: 900 + index * 90,
        ease: 'Sine.easeOut'
      });
    });

    const activeCard = this.objectiveCards.find((card) => card.objective.status === 'available');
    if (activeCard) {
      this.time.delayedCall(1600, () => {
        if (activeCard.container.active) {
          this.drawCard(activeCard, true);
          this.time.delayedCall(220, () => this.drawCard(activeCard, false));
        }
      });
    }
  }

  private cleanup(): void {
    this.scale.off(Phaser.Scale.Events.RESIZE, this.layoutScene, this);
    this.tweens.killTweensOf([this.missionHeaderContainer, ...this.objectiveCards.map((card) => card.container)]);
    this.apuLabPropsInteraction?.dispose();
    this.apuLabPropsInteraction = undefined;
    this.threeOverlay?.destroy();
    this.threeOverlay = undefined;
    this.kawsayVisual = undefined;
  }
}
