import * as Phaser from 'phaser';
import { UI_TOKENS } from '../../ui/tokens';

export type MenuButtonVariant = 'primary' | 'secondary';

export interface MenuButtonOptions {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  variant?: MenuButtonVariant;
  iconKey?: string;
  onClick: () => void;
}

const COLORS = {
  primary: {
    normal: 0xFFD166,
    hover: 0xFFE085,
    pressed: 0xD49B00,
    alpha: 0.96,
    border: '#FFFFFF',
    text: UI_TOKENS.colors.backgroundDark
  },
  secondary: {
    normal: 0xFFFFFF,
    hover: 0xFFFFFF,
    pressed: 0xDDE7F2,
    alpha: 0.88,
    border: UI_TOKENS.colors.accent,
    text: UI_TOKENS.colors.backgroundDark
  }
} as const;

export class MenuButton extends Phaser.GameObjects.Container {
  private readonly background: Phaser.GameObjects.Graphics;
  private readonly labelText: Phaser.GameObjects.Text;
  private readonly hitArea: Phaser.GameObjects.Zone;
  private readonly options: Required<Omit<MenuButtonOptions, 'iconKey'>> & Pick<MenuButtonOptions, 'iconKey'>;

  constructor(scene: Phaser.Scene, options: MenuButtonOptions) {
    super(scene, options.x, options.y);

    this.options = {
      variant: 'secondary',
      ...options
    };

    this.background = scene.add.graphics();
    this.labelText = scene.add.text(0, 0, options.label, {
      fontFamily: UI_TOKENS.typography.heading,
      fontSize: this.options.variant === 'primary' ? '24px' : '21px',
      fontStyle: 'bold',
      color: COLORS[this.options.variant].text,
      align: 'center'
    }).setOrigin(0.5);

    this.hitArea = scene.add.zone(0, 0, options.width, options.height)
      .setInteractive({ useHandCursor: true });

    this.add([this.background, this.labelText, this.hitArea]);
    this.setSize(options.width, options.height);
    this.bindPointerStates();
    this.renderState('normal');

    scene.add.existing(this);
  }

  private bindPointerStates(): void {
    this.hitArea.on('pointerover', () => {
      this.renderState('hover');
      this.setScale(1.02);
    });

    this.hitArea.on('pointerout', () => {
      this.renderState('normal');
      this.setScale(1);
    });

    this.hitArea.on('pointerdown', () => {
      this.renderState('pressed');
      this.setScale(0.97);
    });

    this.hitArea.on('pointerup', () => {
      this.renderState('hover');
      this.setScale(1.02);
      this.options.onClick();
    });
  }

  private renderState(state: 'normal' | 'hover' | 'pressed'): void {
    const colors = COLORS[this.options.variant];
    const radius = UI_TOKENS.layout.buttonRadius;

    this.background.clear();
    this.background.fillStyle(colors[state], state === 'hover' ? 0.98 : colors.alpha);
    this.background.lineStyle(2, Phaser.Display.Color.HexStringToColor(colors.border).color, state === 'normal' ? 0.45 : 0.85);
    this.background.fillRoundedRect(
      -this.options.width / 2,
      -this.options.height / 2,
      this.options.width,
      this.options.height,
      radius
    );
    this.background.strokeRoundedRect(
      -this.options.width / 2,
      -this.options.height / 2,
      this.options.width,
      this.options.height,
      radius
    );
  }
}
