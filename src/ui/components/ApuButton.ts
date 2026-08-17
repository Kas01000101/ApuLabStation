import * as Phaser from 'phaser';
import { uiTokens } from '../tokens';

export type ApuButtonVariant = 'primary' | 'secondary' | 'utilityDark' | 'utilityLight';

export interface ApuButtonOptions {
  x: number;
  y: number;
  label: string;
  variant?: ApuButtonVariant;
  onClick: () => void;
  width?: number;
  height?: number;
}

type ButtonState = 'normal' | 'hover' | 'pressed';

const toColor = (value: string): number => Phaser.Display.Color.HexStringToColor(value).color;

const variantTokens = uiTokens.button.variants;

export class ApuButton extends Phaser.GameObjects.Container {
  private readonly shadowLayer: Phaser.GameObjects.Graphics;
  private readonly bodyLayer: Phaser.GameObjects.Graphics;
  private readonly highlightLayer: Phaser.GameObjects.Graphics;
  private readonly labelText: Phaser.GameObjects.Text;
  private readonly hitArea: Phaser.GameObjects.Zone;
  private readonly options: Required<ApuButtonOptions>;
  private currentTween?: Phaser.Tweens.Tween;
  private isPointerOver = false;

  constructor(scene: Phaser.Scene, options: ApuButtonOptions) {
    super(scene, options.x, options.y);

    this.options = {
      variant: 'primary',
      width: uiTokens.button.width,
      height: uiTokens.button.height,
      ...options
    };

    this.shadowLayer = scene.add.graphics();
    this.bodyLayer = scene.add.graphics();
    this.highlightLayer = scene.add.graphics();
    this.labelText = scene.add.text(0, 0, options.label.toUpperCase(), {
      fontFamily: uiTokens.typography.button.family,
      fontSize: `${uiTokens.typography.button.size}px`,
      fontStyle: uiTokens.typography.button.weight,
      color: variantTokens[this.options.variant].text,
      align: 'center'
    }).setOrigin(0.5);

    this.hitArea = scene.add.zone(0, 0, this.options.width, this.options.height)
      .setInteractive({ useHandCursor: true });

    this.add([this.shadowLayer, this.bodyLayer, this.highlightLayer, this.labelText, this.hitArea]);
    this.setSize(this.options.width, this.options.height);
    this.renderState('normal');
    this.bindPointerStates();

    scene.add.existing(this);
  }

  private bindPointerStates(): void {
    this.hitArea.on('pointerover', () => {
      this.isPointerOver = true;
      this.renderState('hover');
      this.animateTo(uiTokens.motion.scale.hover, 0);
    });

    this.hitArea.on('pointerout', () => {
      this.isPointerOver = false;
      this.renderState('normal');
      this.animateTo(uiTokens.motion.scale.normal, 0);
    });

    this.hitArea.on('pointerdown', () => {
      this.renderState('pressed');
      this.animateTo(uiTokens.motion.scale.pressed, uiTokens.button.pressedYOffset);
    });

    this.hitArea.on('pointerup', () => {
      const nextState: ButtonState = this.isPointerOver ? 'hover' : 'normal';
      this.renderState(nextState);
      this.animateTo(this.isPointerOver ? uiTokens.motion.scale.hover : uiTokens.motion.scale.normal, 0);
      this.options.onClick();
    });
  }

  private animateTo(scale: number, yOffset: number): void {
    this.currentTween?.stop();
    this.currentTween = this.scene.tweens.add({
      targets: this,
      scale,
      y: this.options.y + yOffset,
      duration: uiTokens.motion.duration.fast,
      ease: uiTokens.motion.ease.out
    });
  }

  private renderState(state: ButtonState): void {
    const variant = variantTokens[this.options.variant];
    const width = this.options.width;
    const height = this.options.height;
    const radius = uiTokens.button.radius;
    const shadowOffset = state === 'pressed' ? uiTokens.button.shadowPressedOffset : uiTokens.button.shadowOffset;
    const bodyColor = state === 'normal' ? variant.body : variant[state];

    this.shadowLayer.clear();
    this.shadowLayer.fillStyle(toColor(variant.shadow), uiTokens.elevation.button.alpha);
    this.shadowLayer.fillRoundedRect(-width / 2, -height / 2 + shadowOffset, width, height, radius);

    this.bodyLayer.clear();
    this.bodyLayer.fillStyle(toColor(bodyColor), 1);
    this.bodyLayer.lineStyle(uiTokens.button.borderWidth, toColor(variant.border), uiTokens.button.borderAlpha);
    this.bodyLayer.fillRoundedRect(-width / 2, -height / 2, width, height, radius);
    this.bodyLayer.strokeRoundedRect(-width / 2, -height / 2, width, height, radius);

    this.highlightLayer.clear();
    this.highlightLayer.fillStyle(toColor(uiTokens.colors.highlight.soft), state === 'pressed' ? 0.08 : 0.18);
    this.highlightLayer.fillRoundedRect(
      -width / 2 + uiTokens.spacing.md,
      -height / 2 + uiTokens.spacing.sm,
      width - uiTokens.spacing.md * 2,
      uiTokens.button.highlightHeight,
      uiTokens.radius.medium
    );
  }
}
