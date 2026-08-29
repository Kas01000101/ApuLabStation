import * as Phaser from 'phaser';
import { UI_TOKENS, uiTokens } from '../../ui/tokens';
import { ApuButton } from '../../ui/components/ApuButton';

export interface DialoguePanelOptions {
  title: string;
  body: string;
  buttonLabel: string;
  onClose: () => void;
  onButtonPress?: () => void;
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
      fontSize: `${uiTokens.typography.heading.size}px`,
      fontStyle: 'bold',
      color: UI_TOKENS.colors.accent,
      align: 'center'
    }).setOrigin(0.5);

    const body = scene.add.text(0, -24, options.body, {
      fontFamily: UI_TOKENS.typography.body,
      fontSize: `${uiTokens.typography.body.size}px`,
      color: UI_TOKENS.colors.text,
      align: 'center',
      wordWrap: { width: 500 }
    }).setOrigin(0.5);

    const closeButton = new ApuButton(scene, {
      x: 0,
      y: 96,
      width: 240,
      height: 60,
      label: options.buttonLabel,
      variant: 'primary',
      clickSound: false,
      onPress: options.onButtonPress,
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
