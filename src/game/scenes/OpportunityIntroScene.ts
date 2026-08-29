import * as Phaser from 'phaser';
import '@fontsource/nunito-sans/latin-400.css';
import { GameState } from '../../systems/GameState';
import { TelemetryService } from '../../systems/TelemetryService';
import { clearApuLabDom } from '../../ui/domComponents';

interface IntroSlide {
  textureKey: string;
  text: string;
}

interface NavigationButton {
  container: Phaser.GameObjects.Container;
  shadow: Phaser.GameObjects.Graphics;
  background: Phaser.GameObjects.Graphics;
  label: Phaser.GameObjects.Text;
  setLabel: (text: string) => void;
  setWidth: (width: number) => void;
  setPosition: (x: number, y: number) => void;
  setVisible: (visible: boolean) => void;
  destroy: () => void;
}

type DialogAnimatable =
  | Phaser.GameObjects.Graphics
  | Phaser.GameObjects.Text
  | Phaser.GameObjects.Container;

const NEXT_SCENE_KEY = 'Level1RoverHubScene';
const FADE_OUT_MS = 130;
const FADE_IN_MS = 210;
const NUNITO_FONT_FACE = '"Nunito Sans"';
const DIALOG_FONT_FAMILY = `${NUNITO_FONT_FACE}, Arial, sans-serif`;
const DIALOG_FONT_WEIGHT = '400';
const DIALOG_FONT_STYLE = 'normal';
const DIALOG_FONT_SIZE = 15;
const BUTTON_FONT_SIZE = 12;
const PANEL_WIDTH_RATIO = 0.6;
const PANEL_MAX_WIDTH = 700;
const PANEL_MIN_HEIGHT = 58;
const PANEL_MAX_HEIGHT = 105;
const PANEL_BOTTOM_MARGIN = 56;
const PANEL_RADIUS = 24;
const PANEL_HORIZONTAL_PADDING = 22;
const PANEL_TOP_PADDING = 14;
const BUTTON_HEIGHT = 28;
const PANEL_BOTTOM_PADDING = 20;
const BUTTON_WIDTH = 86;
const FINAL_BUTTON_WIDTH = 100;
const BUTTON_RADIUS = BUTTON_HEIGHT / 2;
const NAV_CLICK_MIN_INTERVAL_MS = 90;

export class OpportunityIntroScene extends Phaser.Scene {
  private currentSlideIndex = 0;

  private readonly slides: IntroSlide[] = [
    {
      textureKey: 'story_01',
      text: 'Llevo días pensando en esto… Cada vez que creo que ya lo entendí, termino tachando algo y empezando otra vez. Quiero verlo funcionar de verdad… pero todavía no sé cómo.'
    },
    {
      textureKey: 'story_02',
      text: 'Entonces apareció una carta inesperada. Venía de un lugar llamado ApuLab Station.'
    },
    {
      textureKey: 'story_03',
      text: '¿A mí? ¿De verdad me eligieron a mí? Sentí emoción… pero también muchas dudas.'
    },
    {
      textureKey: 'story_04',
      text: 'No sabía si estaba lista, pero había algo dentro de mí que quería intentarlo.'
    },
    {
      textureKey: 'story_05',
      text: 'Cuando llegué a ApuLab Station y vi la Tierra desde ahí, sentí que todo era mucho más grande de lo que imaginaba.'
    },
    {
      textureKey: 'story_06',
      text: 'Después conocí a mujeres peruanas que hicieron historia en la ciencia. Verlas me hizo pensar que quizá yo también podía encontrar mi lugar.'
    },
    {
      textureKey: 'story_07',
      text: 'Y entonces comenzó mi verdadera misión. Ese sería apenas el inicio de todo lo que estaba por descubrir.'
    }
  ];

  private storyImage?: Phaser.GameObjects.Image;
  private dialogShadow?: Phaser.GameObjects.Graphics;
  private dialogPanel?: Phaser.GameObjects.Graphics;
  private dialogText?: Phaser.GameObjects.Text;
  private previousButton?: NavigationButton;
  private nextButton?: NavigationButton;
  private activeTween?: Phaser.Tweens.Tween;
  private isTransitioning = false;
  private lastNavigationClickAt = 0;

  private dialogBounds = new Phaser.Geom.Rectangle();
  private buttonCenterY = 0;

  private readonly handleKeyDown = (event: KeyboardEvent): void => {
    if (event.key === 'Enter' || event.key === 'ArrowRight') {
      this.goNext();
    } else if (event.key === 'ArrowLeft') {
      this.goPrevious();
    }
  };

  constructor() {
    super({ key: 'OpportunityIntroScene' });
  }

  async create(): Promise<void> {
    clearApuLabDom();

    this.currentSlideIndex = 0;
    this.isTransitioning = false;
    this.createStoryImage();
    await this.ensureDialogFontReady();
    this.createDialogUI();
    this.bindControls();
    this.showSlide(0, false);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.cleanup, this);
    this.events.once(Phaser.Scenes.Events.DESTROY, this.cleanup, this);
  }

  private createStoryImage(): void {
    const camera = this.cameras.main;
    this.storyImage = this.add
      .image(camera.centerX, camera.centerY, this.slides[0].textureKey)
      .setOrigin(0.5)
      .setDepth(10);
    this.fitImageToCamera();
  }

  private createDialogUI(): void {
    const width = this.scale.width;
    const panelWidth = this.getDialogPanelWidth();
    const panelHeight = PANEL_MIN_HEIGHT;
    const x = (width - panelWidth) / 2;
    const y = this.scale.height - PANEL_BOTTOM_MARGIN - panelHeight;
    const textCenterX = x + panelWidth / 2;
    const dialogFontSize = DIALOG_FONT_SIZE;

    this.dialogBounds.setTo(x, y, panelWidth, panelHeight);

    this.dialogShadow = this.add.graphics().setDepth(19);

    this.dialogPanel = this.add.graphics().setDepth(22);

    this.dialogText = this.add.text(textCenterX, y + PANEL_TOP_PADDING, '', {
      fontFamily: DIALOG_FONT_FAMILY,
      fontSize: `${dialogFontSize}px`,
      fontStyle: `${DIALOG_FONT_STYLE} ${DIALOG_FONT_WEIGHT}`,
      color: '#FFFFFF',
      align: 'center',
      strokeThickness: 0,
      lineSpacing: 3,
      shadow: {
        offsetX: 0,
        offsetY: 1,
        color: 'rgba(0, 0, 0, 0.18)',
        blur: 1,
        fill: true
      },
      wordWrap: {
        width: panelWidth - PANEL_HORIZONTAL_PADDING * 2,
        useAdvancedWrap: true
      }
    }).setOrigin(0.5, 0).setDepth(23);

    this.previousButton = this.createNavigationButton('Anterior', () => this.goPrevious());
    this.nextButton = this.createNavigationButton('Siguiente', () => this.goNext());
  }

  private getDialogPanelWidth(): number {
    return Math.min(this.scale.width * PANEL_WIDTH_RATIO, PANEL_MAX_WIDTH);
  }

  private updateDialogLayout(): void {
    if (!this.dialogText || !this.dialogShadow || !this.dialogPanel) return;

    const panelWidth = this.getDialogPanelWidth();
    const panelCenterX = this.scale.width / 2;
    const panelX = panelCenterX - panelWidth / 2;
    const wordWrapWidth = panelWidth - PANEL_HORIZONTAL_PADDING * 2;

    this.dialogText.setWordWrapWidth(wordWrapWidth, true);
    const textHeight = Math.ceil(this.dialogText.height);
    const calculatedHeight = textHeight + PANEL_TOP_PADDING + PANEL_BOTTOM_PADDING;
    const panelHeight = Phaser.Math.Clamp(calculatedHeight, PANEL_MIN_HEIGHT, PANEL_MAX_HEIGHT);
    const panelBottom = this.scale.height - PANEL_BOTTOM_MARGIN;
    const panelTop = panelBottom - panelHeight;
    const buttonCenterY = panelBottom;

    this.dialogBounds.setTo(panelX, panelTop, panelWidth, panelHeight);
    this.buttonCenterY = buttonCenterY;

    this.dialogShadow.clear();
    this.dialogShadow.fillStyle(0x000000, 0.2);
    this.dialogShadow.fillRoundedRect(
      panelX - 5,
      panelTop + 4,
      panelWidth + 10,
      panelHeight + 6,
      PANEL_RADIUS + 4
    );

    this.dialogPanel.clear();
    this.dialogPanel.fillStyle(0x252736, 0.78);
    this.dialogPanel.fillRoundedRect(panelX, panelTop, panelWidth, panelHeight, PANEL_RADIUS);
    this.dialogPanel.lineStyle(2, 0x72758a, 0.55);
    this.dialogPanel.strokeRoundedRect(panelX, panelTop, panelWidth, panelHeight, PANEL_RADIUS);

    this.dialogText.setPosition(panelCenterX, panelTop + PANEL_TOP_PADDING);
    this.dialogText.setData('dialogBaseY', this.dialogText.y);
  }

  private createNavigationButton(label: string, onClick: () => void): NavigationButton {
    let buttonWidth = BUTTON_WIDTH;
    const buttonHeight = BUTTON_HEIGHT;
    const radius = BUTTON_RADIUS;
    const container = this.add.container(0, 0).setDepth(24);
    const shadow = this.add.graphics();
    const background = this.add.graphics();
    const hitArea = this.add.zone(0, 0, buttonWidth, buttonHeight).setOrigin(0.5);
    const buttonText = this.add.text(0, 0, label, {
      fontFamily: DIALOG_FONT_FAMILY,
      fontSize: `${BUTTON_FONT_SIZE}px`,
      fontStyle: `${DIALOG_FONT_STYLE} ${DIALOG_FONT_WEIGHT}`,
      color: '#676078',
      align: 'center'
    }).setOrigin(0.5);

    const draw = (fillColor = 0xf8f7fb, isHover = false): void => {
      shadow.clear();
      shadow.fillStyle(0x000000, isHover ? 0.11 : 0.08);
      shadow.fillRoundedRect(-buttonWidth / 2 + 1, -buttonHeight / 2 + 3, buttonWidth - 2, buttonHeight, radius);

      background.clear();
      background.fillStyle(fillColor, 1);
      background.fillRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, radius);
      background.lineStyle(1, isHover ? 0xcfd1dc : 0xd9dae2, 1);
      background.strokeRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, radius);
    };

    draw();
    container.add([shadow, background, hitArea, buttonText]);
    container.setSize(buttonWidth, buttonHeight);
    hitArea.setInteractive();
    hitArea.input!.cursor = 'pointer';

    hitArea.on(Phaser.Input.Events.POINTER_OVER, () => {
      draw(0xffffff, true);
      this.tweens.add({ targets: container, scale: 1.01, duration: 80, ease: 'Sine.easeOut' });
    });
    hitArea.on(Phaser.Input.Events.POINTER_OUT, () => {
      draw();
      this.tweens.add({ targets: container, scale: 1, duration: 80, ease: 'Sine.easeOut' });
    });
    hitArea.on(Phaser.Input.Events.POINTER_DOWN, () => {
      draw(0xe9e5ef);
      this.tweens.add({ targets: container, scale: 0.94, duration: 55, ease: 'Sine.easeOut' });
    });
    hitArea.on(Phaser.Input.Events.POINTER_UP, () => {
      if (this.isTransitioning) return;

      draw();
      this.tweens.add({ targets: container, scale: 1, duration: 70, ease: 'Sine.easeOut' });
      this.playNavigationClick();
      onClick();
    });

    return {
      container,
      shadow,
      background,
      label: buttonText,
      setLabel: (text: string) => buttonText.setText(text),
      setWidth: (width: number) => {
        buttonWidth = width;
        hitArea.setSize(buttonWidth, buttonHeight);
        container.setSize(buttonWidth, buttonHeight);
        draw();
      },
      setPosition: (x: number, y: number) => {
        container.setData('dialogBaseY', y);
        return container.setPosition(x, y);
      },
      setVisible: (visible: boolean) => {
        this.tweens.killTweensOf(container);
        container.setVisible(visible).setActive(visible);
        if (visible) {
          container.setAlpha(1);
          hitArea.setInteractive();
          hitArea.input!.cursor = 'pointer';
        } else {
          container.setAlpha(0);
          hitArea.disableInteractive();
        }
      },
      destroy: () => container.destroy(true)
    };
  }

  private async ensureDialogFontReady(): Promise<void> {
    if (!('fonts' in document)) return;

    const fontRequest = `${DIALOG_FONT_WEIGHT} ${DIALOG_FONT_SIZE}px ${NUNITO_FONT_FACE}`;
    if (document.fonts.check(fontRequest)) return;

    await Promise.race([
      document.fonts.load(fontRequest),
      new Promise((resolve) => window.setTimeout(resolve, 1200))
    ]);
  }

  private playNavigationClick(): void {
    const now = this.time.now;
    if (now - this.lastNavigationClickAt < NAV_CLICK_MIN_INTERVAL_MS) return;
    if (this.sound.mute || this.sound.volume <= 0) return;

    const soundManager = this.sound as Phaser.Sound.WebAudioSoundManager;
    const audioContext = soundManager.context;
    if (!audioContext) return;

    const playClick = (): void => {
      const startTime = audioContext.currentTime;
      const endTime = startTime + 0.075;
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      const destination = soundManager.destination ?? audioContext.destination;
      const peakGain = 0.06 * Phaser.Math.Clamp(this.sound.volume, 0, 1);

      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(650, startTime);
      oscillator.frequency.exponentialRampToValueAtTime(480, endTime);

      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.exponentialRampToValueAtTime(peakGain, startTime + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, endTime);

      oscillator.connect(gain);
      gain.connect(destination);
      oscillator.start(startTime);
      oscillator.stop(endTime + 0.01);
      oscillator.onended = () => {
        oscillator.disconnect();
        gain.disconnect();
      };
    };

    this.lastNavigationClickAt = now;
    if (audioContext.state === 'suspended') {
      void audioContext.resume().then(playClick).catch(() => undefined);
      return;
    }

    playClick();
  }

  private bindControls(): void {
    this.input.keyboard?.on(Phaser.Input.Keyboard.Events.ANY_KEY_DOWN, this.handleKeyDown);
  }

  private showSlide(index: number, withTransition = true): void {
    if (index < 0 || index >= this.slides.length || !this.storyImage || !this.dialogText) return;
    if (this.isTransitioning) return;

    const slide = this.slides[index];
    if (!this.textures.exists(slide.textureKey)) {
      this.finishIntro();
      return;
    }

    const applySlide = (): void => {
      this.currentSlideIndex = index;
      this.storyImage?.setTexture(slide.textureKey).setAlpha(1);
      this.fitImageToCamera();
      this.dialogText?.setText(slide.text);
      this.updateDialogLayout();
      GameState.getInstance().updateProgress('OpportunityIntroScene', 0, slide.textureKey);
      this.updateNavigationButtons();
      this.animateDialogEntrance();
    };

    if (!withTransition) {
      applySlide();
      return;
    }

    this.isTransitioning = true;
    this.activeTween?.stop();
    this.activeTween = this.tweens.add({
      targets: this.storyImage,
      alpha: 0,
      duration: FADE_OUT_MS,
      ease: 'Sine.easeIn',
      onComplete: () => {
        applySlide();
        this.activeTween = this.tweens.add({
          targets: this.storyImage,
          alpha: 1,
          duration: FADE_IN_MS,
          ease: 'Sine.easeOut',
          onComplete: () => {
            this.activeTween = undefined;
            this.isTransitioning = false;
          }
        });
      }
    });
  }

  private animateDialogEntrance(): void {
    const dialogObjects = this.getDialogEntranceObjects();

    dialogObjects.forEach((object) => {
      this.tweens.killTweensOf(object);
      const baseY = (object.getData('dialogBaseY') as number | undefined) ?? object.y;
      object.setData('dialogBaseY', baseY);
      object.setAlpha(0);
      object.setY(baseY + 12);
    });

    this.tweens.add({
      targets: dialogObjects,
      alpha: 1,
      y: (target: DialogAnimatable) => target.getData('dialogBaseY') as number,
      duration: 280,
      ease: 'Cubic.Out'
    });

    if (this.dialogText) {
      this.tweens.killTweensOf(this.dialogText);
      const textBaseY = (this.dialogText.getData('dialogBaseY') as number | undefined) ?? this.dialogText.y;
      this.dialogText.setData('dialogBaseY', textBaseY);
      this.dialogText.setAlpha(0);
      this.dialogText.setY(textBaseY + 8);
      this.tweens.add({
        targets: this.dialogText,
        alpha: 1,
        y: textBaseY,
        duration: 190,
        ease: 'Sine.easeOut',
        delay: 40
      });
    }
  }

  private getDialogEntranceObjects(): DialogAnimatable[] {
    const objects: Array<DialogAnimatable | undefined> = [
      this.dialogShadow,
      this.dialogPanel,
      this.previousButton?.container,
      this.nextButton?.container
    ];

    return objects.filter((object): object is DialogAnimatable => object !== undefined && object.visible);
  }

  private getDialogObjects(): DialogAnimatable[] {
    const objects: Array<DialogAnimatable | undefined> = [
      this.dialogShadow,
      this.dialogPanel,
      this.dialogText,
      this.previousButton?.container,
      this.nextButton?.container
    ];

    return objects.filter((object): object is DialogAnimatable => Boolean(object));
  }

  private updateNavigationButtons(): void {
    if (!this.previousButton || !this.nextButton) return;

    const buttonY = this.buttonCenterY;
    const centerX = this.dialogBounds.centerX;
    const leftX = centerX - 105;
    const rightX = centerX + 105;

    if (this.currentSlideIndex === 0) {
      this.previousButton.setVisible(false);
      this.nextButton.setWidth(BUTTON_WIDTH);
      this.nextButton.setLabel('Siguiente');
      this.nextButton.setPosition(centerX, buttonY);
      return;
    }

    this.previousButton.setVisible(true);
    this.previousButton.setWidth(BUTTON_WIDTH);
    this.previousButton.setPosition(leftX, buttonY);
    this.nextButton.setPosition(rightX, buttonY);

    if (this.currentSlideIndex === this.slides.length - 1) {
      this.nextButton.setWidth(FINAL_BUTTON_WIDTH);
      this.nextButton.setLabel('Comenzar');
    } else {
      this.nextButton.setWidth(BUTTON_WIDTH);
      this.nextButton.setLabel('Siguiente');
    }
  }

  private goNext(): void {
    if (this.isTransitioning) return;

    this.recordNavigationEvent('next');
    if (this.currentSlideIndex >= this.slides.length - 1) {
      this.finishIntro();
      return;
    }

    this.showSlide(this.currentSlideIndex + 1);
  }

  private goPrevious(): void {
    if (this.isTransitioning || this.currentSlideIndex <= 0) return;

    this.recordNavigationEvent('previous');
    this.showSlide(this.currentSlideIndex - 1);
  }

  private recordNavigationEvent(direction: 'next' | 'previous'): void {
    TelemetryService.getInstance().recordEvent({
      sceneId: 'OpportunityIntroScene',
      eventType: 'solution_changed',
      payload: {
        intro_step_id: this.slides[this.currentSlideIndex].textureKey,
        intro_step_index: this.currentSlideIndex,
        intro_direction: direction
      }
    });
  }

  private fitImageToCamera(): void {
    if (!this.storyImage) return;

    const camera = this.cameras.main;
    const source = this.storyImage.texture.getSourceImage() as HTMLImageElement | HTMLCanvasElement;
    const sourceWidth = source.width || this.storyImage.width;
    const sourceHeight = source.height || this.storyImage.height;
    const scale = Math.min(camera.width / sourceWidth, camera.height / sourceHeight);

    this.storyImage
      .setOrigin(0.5)
      .setPosition(camera.centerX, camera.centerY)
      .setScale(scale);
  }

  private finishIntro(): void {
    if (this.isTransitioning) return;

    TelemetryService.getInstance().recordEvent({
      sceneId: 'OpportunityIntroScene',
      eventType: 'opportunity_intro_completed',
      payload: {
        intro_step_count: this.slides.length
      }
    });

    this.cleanup();
    this.scene.start(NEXT_SCENE_KEY);
  }

  private cleanup(): void {
    this.input.keyboard?.off(Phaser.Input.Keyboard.Events.ANY_KEY_DOWN, this.handleKeyDown);
    this.activeTween?.stop();
    this.activeTween = undefined;
    this.tweens.killTweensOf(this.getDialogObjects());
    this.storyImage?.destroy();
    this.storyImage = undefined;
    this.dialogShadow?.destroy();
    this.dialogShadow = undefined;
    this.dialogPanel?.destroy();
    this.dialogPanel = undefined;
    this.dialogText?.destroy();
    this.dialogText = undefined;
    this.previousButton?.destroy();
    this.previousButton = undefined;
    this.nextButton?.destroy();
    this.nextButton = undefined;
    this.isTransitioning = false;
    clearApuLabDom();
  }
}
