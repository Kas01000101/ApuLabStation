import * as Phaser from 'phaser';
import { playUiClick, playUiHover } from '../audio/playUiClick';
import { uiTokens } from '../tokens';

type HudButtonIcon = 'play' | 'book';
type HudButtonVariant = 'yellowPrimary' | 'blueIcon';

interface HudButtonPalette {
  bodyTop: string;
  body: string;
  border: string;
  depth: string;
  highlight: string;
  glow: string;
  text: string;
  iconMedallion: string;
  iconMedallionBorder: string;
  icon: string;
}

interface GameHudButtonOptions {
  x: number;
  y: number;
  width: number;
  height?: number;
  label?: string;
  icon: HudButtonIcon;
  variant?: HudButtonVariant;
  enabled?: boolean;
  latencyLabel?: string;
  onClick: (latency?: HudButtonLatency) => void;
}

interface ProgressBadgeOptions {
  x: number;
  y: number;
  current: number;
  total: number;
}

export interface HudButtonLatency {
  t0: number;
  t1: number;
  label: string;
}

const BREATHING_DURATION = 2000;
const SWEEP_DURATION = 640;
const SWEEP_INTERVAL = 3400;
const IDLE_GLOW_ALPHA = 0.06;
const IDLE_GLOW_PEAK_ALPHA = 0.11;
const HOVER_GLOW_ALPHA = 0.2;
const PRESSED_GLOW_ALPHA = 0.06;

const toColor = (value: string): number => Phaser.Display.Color.HexStringToColor(value).color;

export class GameHudButton extends Phaser.GameObjects.Container {
  private readonly idleGlowLayer = this.scene.add.graphics();
  private readonly hoverGlowLayer = this.scene.add.graphics();
  private readonly depthLayer = this.scene.add.graphics();
  private readonly bodyLayer = this.scene.add.graphics();
  private readonly sweepLayer = this.scene.add.graphics();
  private readonly contentLayer = this.scene.add.container(0, 0);
  private readonly flashLayer = this.scene.add.graphics();
  private readonly widthValue: number;
  private readonly heightValue: number;
  private readonly palette: HudButtonPalette;
  private readonly enabled: boolean;
  private readonly baseY: number;
  private isPressed = false;
  private isPointerOver = false;
  private actionTriggered = false;
  private idleGlowTween?: Phaser.Tweens.Tween;
  private hoverGlowTween?: Phaser.Tweens.Tween;
  private motionTween?: Phaser.Tweens.Tween;
  private releaseTween?: Phaser.Tweens.Tween;
  private flashTween?: Phaser.Tweens.Tween;
  private sweepTween?: Phaser.Tweens.Tween;
  private sweepTimer?: Phaser.Time.TimerEvent;

  constructor(scene: Phaser.Scene, private readonly options: GameHudButtonOptions) {
    super(scene, options.x, options.y);
    this.baseY = options.y;
    this.widthValue = options.width;
    this.heightValue = options.height ?? uiTokens.hud.challenge.controlHeight;
    this.palette = uiTokens.hud.challenge.button.variants[options.variant ?? 'yellowPrimary'];
    this.enabled = options.enabled ?? true;

    this.add([
      this.idleGlowLayer,
      this.hoverGlowLayer,
      this.depthLayer,
      this.bodyLayer,
      this.sweepLayer,
      this.contentLayer,
      this.flashLayer
    ]);
    this.drawGlow(this.idleGlowLayer);
    this.drawGlow(this.hoverGlowLayer);
    this.idleGlowLayer.setAlpha(IDLE_GLOW_ALPHA);
    this.hoverGlowLayer.setAlpha(0);
    this.draw(false, false);
    this.createContent();
    this.drawFlashSurface();
    this.flashLayer.setAlpha(0);
    this.sweepLayer.setAlpha(0);

    if (this.enabled) {
      this.setSize(this.widthValue, this.heightValue);
      this.setInteractive(
        new Phaser.Geom.Rectangle(
          -this.widthValue / 2,
          -this.heightValue / 2,
          this.widthValue,
          this.heightValue
        ),
        Phaser.Geom.Rectangle.Contains
      );
      this.startIdleGlow();
      this.startSweepTimer();
      this.bindPointerStates();
    }

    scene.add.existing(this);
  }

  private bindPointerStates(): void {
    this.on(Phaser.Input.Events.POINTER_OVER, () => {
      if (this.isPointerOver) return;
      const t0 = performance.now();
      this.isPointerOver = true;
      this.scene.tweens.killTweensOf(this.hoverGlowLayer);
      this.hoverGlowLayer.setAlpha(HOVER_GLOW_ALPHA);
      const t1 = performance.now();
      playUiHover(this.scene);
      const t2 = performance.now();
      this.draw(false, true);
      this.scene.input.setDefaultCursor('pointer');
      this.tweenMotion(this.baseY - 1, 90);
      if (import.meta.env.DEV) {
        const label = this.options.latencyLabel ?? this.options.label ?? this.options.icon;
        console.debug(`[HUD HOVER] ${label} visual ${(t1 - t0).toFixed(2)}ms`);
        console.debug(`[HUD HOVER] ${label} sound ${(t2 - t0).toFixed(2)}ms`);
      }
    });

    this.on(Phaser.Input.Events.POINTER_OUT, () => {
      this.isPointerOver = false;
      this.isPressed = false;
      this.actionTriggered = false;
      this.draw(false, false);
      this.scene.input.setDefaultCursor('default');
      this.tweenMotion(this.baseY, 90);
      this.scene.tweens.killTweensOf(this.hoverGlowLayer);
      this.hoverGlowTween = this.scene.tweens.add({
        targets: this.hoverGlowLayer,
        alpha: 0,
        duration: 70,
        ease: 'Quad.Out'
      });
    });

    this.on(Phaser.Input.Events.POINTER_DOWN, () => {
      if (this.actionTriggered) return;
      const t0 = performance.now();
      this.actionTriggered = true;
      this.isPressed = true;
      const t1 = performance.now();
      this.options.onClick({
        t0,
        t1,
        label: this.options.latencyLabel ?? this.options.label ?? this.options.icon
      });
      if (import.meta.env.DEV) {
        console.debug(`[HUD latency] ${this.options.latencyLabel ?? this.options.label ?? this.options.icon} T1-T0 ${(t1 - t0).toFixed(2)}ms`);
      }
      playUiClick(this.scene);
      this.scene.tweens.killTweensOf(this.hoverGlowLayer);
      this.hoverGlowLayer.setAlpha(PRESSED_GLOW_ALPHA);
      this.draw(true, this.isPointerOver);
      this.tweenMotion(this.baseY + 1, 50);
    });

    this.on(Phaser.Input.Events.POINTER_UP, () => {
      if (!this.isPressed) return;
      this.isPressed = false;
      this.actionTriggered = false;
      this.draw(false, this.isPointerOver);
      this.playFlash();
      this.playReleaseBounce();
    });
  }

  private drawGlow(layer: Phaser.GameObjects.Graphics): void {
    const radius = this.getRadius();
    const glowColor = toColor(this.palette.glow);

    layer.clear();
    layer.fillStyle(glowColor, 0.45);
    layer.fillRoundedRect(
      -this.widthValue / 2 - 7,
      -this.heightValue / 2 - 6,
      this.widthValue + 14,
      this.heightValue + 14,
      radius + 6
    );
    layer.lineStyle(3, glowColor, 1);
    layer.strokeRoundedRect(
      -this.widthValue / 2 - 4,
      -this.heightValue / 2 - 4,
      this.widthValue + 8,
      this.heightValue + 8,
      radius + 4
    );
  }

  private draw(pressed: boolean, hover: boolean): void {
    const tokens = uiTokens.hud.challenge.button;
    const radius = this.getRadius();
    const bodyY = pressed ? tokens.pressedYOffset : 0;
    const depthY = pressed ? tokens.depthPressedOffset : tokens.depthOffset;
    const depthAlpha = pressed ? 0.52 : 1;
    const bodyColor = hover ? this.palette.bodyTop : this.palette.body;

    this.depthLayer.clear();
    this.bodyLayer.clear();

    this.depthLayer.fillStyle(toColor(this.palette.depth), depthAlpha);
    this.depthLayer.fillRoundedRect(
      -this.widthValue / 2,
      -this.heightValue / 2 + depthY,
      this.widthValue,
      this.heightValue,
      radius
    );

    this.bodyLayer.fillStyle(toColor(bodyColor), 1);
    this.bodyLayer.fillRoundedRect(
      -this.widthValue / 2,
      -this.heightValue / 2 + bodyY,
      this.widthValue,
      this.heightValue,
      radius
    );

    this.bodyLayer.lineStyle(tokens.borderWidth, toColor(this.palette.border), 1);
    this.bodyLayer.strokeRoundedRect(
      -this.widthValue / 2,
      -this.heightValue / 2 + bodyY,
      this.widthValue,
      this.heightValue,
      radius
    );

    this.bodyLayer.lineStyle(1, toColor(this.palette.highlight), hover ? 0.28 : 0.22);
    this.bodyLayer.beginPath();
    this.bodyLayer.moveTo(-this.widthValue / 2 + 12, -this.heightValue / 2 + 7 + bodyY);
    this.bodyLayer.lineTo(this.widthValue / 2 - 12, -this.heightValue / 2 + 7 + bodyY);
    this.bodyLayer.strokePath();

    this.contentLayer.setY(bodyY);
    this.flashLayer.setY(bodyY);
  }

  private createContent(): void {
    let labelX = 0;

    if (this.options.icon === 'play') {
      const iconBg = this.scene.add.graphics();
      const x = -this.widthValue / 2 + 20;
      iconBg.fillStyle(0xffffff, 0.16);
      iconBg.fillCircle(x, 0, 11);
      iconBg.lineStyle(1, 0xffffff, 0.82);
      iconBg.strokeCircle(x, 0, 11);
      iconBg.fillStyle(toColor(this.palette.icon), 1);
      iconBg.beginPath();
      iconBg.moveTo(x - 3, -5);
      iconBg.lineTo(x - 3, 5);
      iconBg.lineTo(x + 5, 0);
      iconBg.closePath();
      iconBg.fillPath();
      this.contentLayer.add(iconBg);
      labelX = -47;
    }

    if (this.options.icon === 'book') {
      const book = this.scene.add.graphics();
      book.lineStyle(4, toColor(this.palette.glow), 0.1);
      book.strokeRoundedRect(-12, -12, 24, 24, 6);
      book.lineStyle(2, toColor(this.palette.icon), 1);
      book.beginPath();
      book.moveTo(-10, -8);
      book.lineTo(-1, -6);
      book.lineTo(-1, 9);
      book.lineTo(-10, 7);
      book.closePath();
      book.strokePath();
      book.beginPath();
      book.moveTo(1, -6);
      book.lineTo(10, -8);
      book.lineTo(10, 7);
      book.lineTo(1, 9);
      book.closePath();
      book.strokePath();
      book.lineStyle(1, toColor(this.palette.icon), 0.8);
      book.lineBetween(0, -6, 0, 9);
      this.contentLayer.add(book);
    }

    if (this.options.label) {
      const text = this.scene.add.text(labelX, 0, this.options.label, {
        fontFamily: uiTokens.typography.menuButton.family,
        fontSize: `${uiTokens.hud.challenge.button.fontSize}px`,
        fontStyle: uiTokens.hud.challenge.button.fontWeight,
        color: this.palette.text
      }).setOrigin(this.options.icon === 'play' ? 0 : 0.5, 0.5);
      text.setResolution(2);
      this.contentLayer.add(text);
    }
  }

  private startIdleGlow(): void {
    this.stopIdleGlow();
    this.idleGlowLayer.setAlpha(IDLE_GLOW_ALPHA);
    this.idleGlowTween = this.scene.tweens.add({
      targets: this.idleGlowLayer,
      alpha: IDLE_GLOW_PEAK_ALPHA,
      duration: BREATHING_DURATION,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  private stopIdleGlow(): void {
    this.idleGlowTween?.stop();
    this.idleGlowTween = undefined;
  }

  private tweenMotion(y: number, duration: number): void {
    this.motionTween?.stop();
    this.releaseTween?.stop();
    this.motionTween = this.scene.tweens.add({
      targets: this,
      y,
      duration,
      ease: 'Sine.easeOut'
    });
  }

  private startSweepTimer(): void {
    if (!this.options.label) return;

    this.sweepTimer = this.scene.time.addEvent({
      delay: SWEEP_INTERVAL,
      loop: true,
      callback: () => this.playSweep()
    });
  }

  private playSweep(): void {
    if (this.isPressed) return;

    this.sweepTween?.stop();
    this.sweepLayer.clear();
    this.sweepLayer.fillStyle(0xffffff, 1);
    this.sweepLayer.fillRoundedRect(-7, -this.heightValue / 2 + 6, 14, this.heightValue - 12, 7);
    this.sweepLayer.setPosition(-this.widthValue / 2 - 18, 0);
    this.sweepLayer.setAlpha(0.14);

    this.sweepTween = this.scene.tweens.add({
      targets: this.sweepLayer,
      x: this.widthValue / 2 + 18,
      alpha: 0,
      duration: SWEEP_DURATION,
      ease: 'Sine.easeInOut'
    });
  }

  private drawFlashSurface(): void {
    const tokens = uiTokens.hud.challenge.button;
    const radius = this.getRadius();
    this.flashLayer.clear();
    this.flashLayer.fillStyle(0xffffff, 1);
    this.flashLayer.fillRoundedRect(
      -this.widthValue / 2 + 2,
      -this.heightValue / 2 + 2,
      this.widthValue - 4,
      this.heightValue - 4,
      radius - 2
    );
  }

  private playFlash(): void {
    this.flashTween?.stop();
    this.flashLayer.setAlpha(0.22);
    this.flashTween = this.scene.tweens.add({
      targets: this.flashLayer,
      alpha: 0,
      duration: 90,
      ease: 'Sine.easeOut'
    });
  }

  private playReleaseBounce(): void {
    this.motionTween?.stop();
    this.releaseTween?.stop();
    const finalY = this.isPointerOver ? this.baseY - 2 : this.baseY;
    const settleY = this.isPointerOver ? this.baseY - 1 : this.baseY;

    this.releaseTween = this.scene.tweens.add({
      targets: this,
      y: finalY,
      duration: 40,
      ease: 'Sine.easeOut',
      onComplete: () => {
        this.releaseTween = this.scene.tweens.add({
          targets: this,
          y: settleY,
          duration: 40,
          ease: 'Sine.easeInOut'
        });
      }
    });

    this.scene.tweens.killTweensOf(this.hoverGlowLayer);
    this.hoverGlowLayer.setAlpha(this.isPointerOver ? HOVER_GLOW_ALPHA : 0);
  }

  destroy(fromScene?: boolean): void {
    this.stopIdleGlow();
    this.hoverGlowTween?.stop();
    this.motionTween?.stop();
    this.releaseTween?.stop();
    this.flashTween?.stop();
    this.sweepTween?.stop();
    this.sweepTimer?.remove(false);
    this.removeAllListeners();
    this.scene.input.setDefaultCursor('default');
    super.destroy(fromScene);
  }

  private getRadius(): number {
    if (!this.options.label) return uiTokens.hud.challenge.iconButton.radius;
    return uiTokens.hud.challenge.button.radius;
  }
}

export class ProgressBadge extends Phaser.GameObjects.Container {
  private readonly depthLayer = this.scene.add.graphics();
  private readonly bodyLayer = this.scene.add.graphics();
  private readonly textLayer: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, options: ProgressBadgeOptions) {
    const tokens = uiTokens.hud.challenge.progress;
    super(scene, options.x, options.y);

    this.textLayer = scene.add.text(0, 0, `${options.current} / ${options.total}`, {
      fontFamily: uiTokens.typography.menuButton.family,
      fontSize: `${tokens.fontSize}px`,
      fontStyle: tokens.fontWeight,
      color: tokens.text
    }).setOrigin(0.5);
    this.textLayer.setResolution(2);

    this.add([this.depthLayer, this.bodyLayer, this.textLayer]);
    this.render();
    scene.add.existing(this);
  }

  setProgress(current: number, total: number): void {
    this.textLayer.setText(`${current} / ${total}`);
  }

  private render(): void {
    const tokens = uiTokens.hud.challenge.progress;

    this.depthLayer.fillStyle(toColor(tokens.shadow), 1);
    this.depthLayer.fillRoundedRect(
      -tokens.width / 2,
      -tokens.height / 2 + tokens.depthOffset,
      tokens.width,
      tokens.height,
      tokens.radius
    );

    this.bodyLayer.fillStyle(toColor(tokens.body), 1);
    this.bodyLayer.fillRoundedRect(-tokens.width / 2, -tokens.height / 2, tokens.width, tokens.height, tokens.radius);
    this.bodyLayer.lineStyle(tokens.borderWidth, toColor(tokens.border), 1);
    this.bodyLayer.strokeRoundedRect(-tokens.width / 2, -tokens.height / 2, tokens.width, tokens.height, tokens.radius);
    this.bodyLayer.lineStyle(1, toColor(tokens.highlight), 0.24);
    this.bodyLayer.beginPath();
    this.bodyLayer.moveTo(-tokens.width / 2 + 9, -tokens.height / 2 + 7);
    this.bodyLayer.lineTo(tokens.width / 2 - 9, -tokens.height / 2 + 7);
    this.bodyLayer.strokePath();
  }
}
