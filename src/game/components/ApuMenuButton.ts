import * as Phaser from 'phaser';
import { UI_TOKENS } from '../../ui/tokens';

export type ApuMenuButtonVariant = 'primary' | 'secondary' | 'utility';
export type ApuMenuButtonIcon = 'rocket' | 'resume' | 'settings' | 'credits' | 'close';

export interface ApuMenuButtonOptions {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  icon?: ApuMenuButtonIcon;
  variant?: ApuMenuButtonVariant;
  onClick: () => void;
}

type ButtonState = 'normal' | 'hover' | 'pressed';

const hex = (value: string): number => Phaser.Display.Color.HexStringToColor(value).color;

const VARIANTS = {
  primary: {
    body: 0xFFD166,
    hover: 0xFFE085,
    pressed: 0xE3A900,
    extrusion: 0xC98500,
    border: 0xFFF6D8,
    icon: 0xFFF9EA,
    text: hex(UI_TOKENS.colors.backgroundDark)
  },
  secondary: {
    body: hex(UI_TOKENS.colors.accent),
    hover: 0x5EFBFF,
    pressed: 0x00A7D6,
    extrusion: 0x007C9E,
    border: 0xD7FCFF,
    icon: 0xFFFFFF,
    text: hex(UI_TOKENS.colors.backgroundDark)
  },
  utility: {
    body: hex(UI_TOKENS.colors.panel),
    hover: 0x5A4FA2,
    pressed: 0x2D2654,
    extrusion: 0x211B41,
    border: hex(UI_TOKENS.colors.accent),
    icon: 0xFFFFFF,
    text: 0xFFFFFF
  }
} as const;

export class ApuMenuButton extends Phaser.GameObjects.Container {
  private readonly shadow: Phaser.GameObjects.Graphics;
  private readonly face: Phaser.GameObjects.Graphics;
  private readonly highlight: Phaser.GameObjects.Graphics;
  private readonly icon: Phaser.GameObjects.Graphics;
  private readonly labelText: Phaser.GameObjects.Text;
  private readonly hitArea: Phaser.GameObjects.Zone;
  private readonly options: Required<ApuMenuButtonOptions>;
  private currentTween?: Phaser.Tweens.Tween;
  private isPointerOver = false;

  constructor(scene: Phaser.Scene, options: ApuMenuButtonOptions) {
    super(scene, options.x, options.y);

    this.options = {
      variant: 'secondary',
      icon: 'rocket',
      ...options
    };

    this.shadow = scene.add.graphics();
    this.face = scene.add.graphics();
    this.highlight = scene.add.graphics();
    this.icon = scene.add.graphics();

    this.labelText = scene.add.text(24, 0, options.label.toUpperCase(), {
      fontFamily: UI_TOKENS.typography.heading,
      fontSize: this.options.variant === 'primary' ? '25px' : '23px',
      fontStyle: 'bold',
      color: Phaser.Display.Color.ValueToColor(VARIANTS[this.options.variant].text).rgba,
      align: 'center'
    }).setOrigin(0.5);

    this.hitArea = scene.add.zone(0, 0, options.width, options.height + 8)
      .setInteractive({ useHandCursor: true });

    this.add([this.shadow, this.face, this.highlight, this.icon, this.labelText, this.hitArea]);
    this.setSize(options.width, options.height + 8);
    this.renderState('normal');
    this.bindPointerStates();

    scene.add.existing(this);
  }

  private bindPointerStates(): void {
    this.hitArea.on('pointerover', () => {
      this.isPointerOver = true;
      this.renderState('hover');
      this.animateTo(1.03, 0);
    });

    this.hitArea.on('pointerout', () => {
      this.isPointerOver = false;
      this.renderState('normal');
      this.animateTo(1, 0);
    });

    this.hitArea.on('pointerdown', () => {
      this.renderState('pressed');
      this.animateTo(0.97, 3);
    });

    this.hitArea.on('pointerup', () => {
      const nextState: ButtonState = this.isPointerOver ? 'hover' : 'normal';
      this.renderState(nextState);
      this.animateTo(this.isPointerOver ? 1.03 : 1, 0);
      this.options.onClick();
    });
  }

  private animateTo(scale: number, yOffset: number): void {
    this.currentTween?.stop();
    this.currentTween = this.scene.tweens.add({
      targets: this,
      scale,
      y: this.options.y + yOffset,
      duration: 120,
      ease: 'Sine.easeOut'
    });
  }

  private renderState(state: ButtonState): void {
    const palette = VARIANTS[this.options.variant];
    const width = this.options.width;
    const height = this.options.height;
    const radius = Math.min(32, height / 2);
    const bodyColor = state === 'normal' ? palette.body : palette[state];
    const extrusionOffset = state === 'pressed' ? 3 : 6;

    this.shadow.clear();
    this.shadow.fillStyle(palette.extrusion, 0.96);
    this.shadow.fillRoundedRect(-width / 2, -height / 2 + extrusionOffset, width, height, radius);

    this.face.clear();
    this.face.fillStyle(bodyColor, 0.98);
    this.face.lineStyle(state === 'hover' ? 4 : 3, palette.border, state === 'normal' ? 0.75 : 0.95);
    this.face.fillRoundedRect(-width / 2, -height / 2, width, height, radius);
    this.face.strokeRoundedRect(-width / 2, -height / 2, width, height, radius);

    this.highlight.clear();
    this.highlight.fillStyle(0xFFFFFF, state === 'pressed' ? 0.08 : 0.22);
    this.highlight.fillRoundedRect(-width / 2 + 12, -height / 2 + 8, width - 24, Math.max(9, height * 0.18), radius / 2);

    this.icon.clear();
    this.drawIcon(this.options.icon, -width / 2 + 44, 0, palette.icon);
  }

  private drawIcon(icon: ApuMenuButtonIcon, x: number, y: number, color: number): void {
    this.icon.lineStyle(4, color, 1);
    this.icon.fillStyle(color, 1);

    if (icon === 'rocket') {
      this.icon.fillTriangle(x - 5, y - 18, x - 5, y + 18, x + 18, y);
      this.icon.strokeTriangle(x - 5, y - 18, x - 5, y + 18, x + 18, y);
      this.icon.fillCircle(x - 4, y, 4);
      this.icon.fillTriangle(x - 11, y - 10, x - 19, y - 3, x - 9, y - 1);
      this.icon.fillTriangle(x - 11, y + 10, x - 19, y + 3, x - 9, y + 1);
      return;
    }

    if (icon === 'resume') {
      this.icon.beginPath();
      this.icon.arc(x, y, 15, Phaser.Math.DegToRad(35), Phaser.Math.DegToRad(310), false);
      this.icon.strokePath();
      this.icon.fillTriangle(x + 15, y - 7, x + 25, y - 8, x + 18, y + 2);
      return;
    }

    if (icon === 'settings') {
      this.icon.strokeCircle(x, y, 11);
      this.icon.fillCircle(x, y, 4);
      for (let i = 0; i < 8; i++) {
        const angle = Phaser.Math.DegToRad(i * 45);
        const x1 = x + Math.cos(angle) * 15;
        const y1 = y + Math.sin(angle) * 15;
        const x2 = x + Math.cos(angle) * 20;
        const y2 = y + Math.sin(angle) * 20;
        this.icon.lineBetween(x1, y1, x2, y2);
      }
      return;
    }

    if (icon === 'credits') {
      const points = [];
      for (let i = 0; i < 10; i++) {
        const angle = Phaser.Math.DegToRad(-90 + i * 36);
        const radius = i % 2 === 0 ? 18 : 8;
        points.push(new Phaser.Math.Vector2(x + Math.cos(angle) * radius, y + Math.sin(angle) * radius));
      }
      this.icon.fillPoints(points, true);
      return;
    }

    this.icon.lineBetween(x - 10, y - 10, x + 10, y + 10);
    this.icon.lineBetween(x + 10, y - 10, x - 10, y + 10);
  }
}
