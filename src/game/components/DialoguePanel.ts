import * as Phaser from 'phaser';
import { UI_TOKENS } from '../../ui/tokens';
import { MenuButton } from './MenuButton';

export interface DialoguePanelOptions {
  title: string;
  body: string;
  buttonLabel: string;
  onClose: () => void;
}

export class DialoguePanel extends Phaser.GameObjects.Container {
  constructor(scene: Phaser.Scene, options: DialoguePanelOptions) {
    const { width, height } = scene.scale;
    super(scene, width / 2, height / 2);

    const panelWidth = 640;
    const panelHeight = 300;
    const backdrop = scene.add.rectangle(0, 0, width, height, 0xFFFFFF, 0.45)
      .setOrigin(0.5);
    const panel = scene.add.graphics();
    panel.fillStyle(Phaser.Display.Color.HexStringToColor(UI_TOKENS.colors.panel).color, 0.92);
    panel.lineStyle(2, Phaser.Display.Color.HexStringToColor(UI_TOKENS.colors.accent).color, 0.55);
    panel.fillRoundedRect(-panelWidth / 2, -panelHeight / 2, panelWidth, panelHeight, UI_TOKENS.layout.cardRadius);
    panel.strokeRoundedRect(-panelWidth / 2, -panelHeight / 2, panelWidth, panelHeight, UI_TOKENS.layout.cardRadius);

    const title = scene.add.text(0, -96, options.title, {
      fontFamily: UI_TOKENS.typography.heading,
      fontSize: '30px',
      fontStyle: 'bold',
      color: UI_TOKENS.colors.accent,
      align: 'center'
    }).setOrigin(0.5);

    const body = scene.add.text(0, -24, options.body, {
      fontFamily: UI_TOKENS.typography.body,
      fontSize: '20px',
      color: UI_TOKENS.colors.text,
      align: 'center',
      wordWrap: { width: 500 }
    }).setOrigin(0.5);

    const closeButton = new MenuButton(scene, {
      x: 0,
      y: 96,
      width: 220,
      height: 58,
      label: options.buttonLabel,
      variant: 'primary',
      onClick: () => {
        options.onClose();
        this.destroy();
      }
    });

    this.add([backdrop, panel, title, body, closeButton]);
    this.setDepth(1000);
    scene.add.existing(this);
  }
}
