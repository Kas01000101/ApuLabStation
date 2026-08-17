import * as Phaser from 'phaser';
import mainMenuLayoutRaw from './MainMenuLayout.scene?raw';
import { GameState } from '../../systems/GameState';
import { ApuButton, type ApuButtonVariant } from '../../ui/components/ApuButton';
import { uiTokens } from '../../ui/tokens';
import { DialoguePanel } from '../components/DialoguePanel';
import { clearApuLabDom } from '../../ui/domComponents';

interface EditorImageObject {
  type: 'Image';
  texture?: {
    key?: string;
  };
  x?: number;
  y?: number;
  scaleX?: number;
  scaleY?: number;
  angle?: number;
  rotation?: number;
  originX?: number;
  originY?: number;
  depth?: number;
  visible?: boolean;
}

interface EditorSceneLayout {
  displayList?: EditorImageObject[];
}

export class MainMenuScene extends Phaser.Scene {
  private creditsPanel?: DialoguePanel;

  constructor() {
    super({ key: 'MainMenuScene' });
  }

  create() {
    clearApuLabDom();
    const { width } = this.scale;

    this.createEditorLayout();

    const panel = this.add.graphics();
    panel.fillStyle(this.toColor(uiTokens.colors.surface.panel), 0.78);
    panel.lineStyle(3, this.toColor(uiTokens.colors.border.subtle), 0.86);
    panel.fillRoundedRect(width / 2 - 360, 60, 720, 190, uiTokens.radius.large);
    panel.strokeRoundedRect(width / 2 - 360, 60, 720, 190, uiTokens.radius.large);

    const titleText = this.add.text(width / 2, 115, 'APULAB STATION', {
      fontFamily: uiTokens.typography.display.family,
      fontSize: `${uiTokens.typography.display.xl}px`,
      color: uiTokens.colors.text.accent,
      fontStyle: uiTokens.typography.display.weight
    }).setOrigin(0.5);

    titleText.setShadow(0, 0, uiTokens.colors.text.accent, 10, true, true);

    this.add.text(width / 2, 185, 'Explora, experimenta y crea tu misión.', {
      fontFamily: uiTokens.typography.body.family,
      fontSize: `${uiTokens.typography.body.size + 2}px`,
      color: uiTokens.colors.text.onDark
    }).setOrigin(0.5);

    this.createMenuButtons();
  }

  private createEditorLayout(): void {
    const layout = JSON.parse(mainMenuLayoutRaw) as EditorSceneLayout;

    layout.displayList?.forEach((object) => {
      if (object.type !== 'Image' || !object.texture?.key) return;

      const image = this.add.image(object.x ?? 0, object.y ?? 0, object.texture.key);
      image.setScale(object.scaleX ?? 1, object.scaleY ?? object.scaleX ?? 1);

      if (typeof object.angle === 'number') image.setAngle(object.angle);
      if (typeof object.rotation === 'number') image.setRotation(object.rotation);
      if (typeof object.depth === 'number') image.setDepth(object.depth);
      if (typeof object.visible === 'boolean') image.setVisible(object.visible);
      if (typeof object.originX === 'number' || typeof object.originY === 'number') {
        image.setOrigin(object.originX ?? 0.5, object.originY ?? 0.5);
      }
    });
  }

  private createMenuButtons(): void {
    const { width } = this.scale;
    const buttonX = width - 265;
    const groupCenterY = 430;
    const buttonWidth = uiTokens.button.width;
    const buttonHeight = uiTokens.button.height;
    const gap = uiTokens.button.verticalGap;
    const buttons: Array<{
      label: string;
      variant: ApuButtonVariant;
      onClick: () => void;
    }> = [
      {
        label: 'INICIAR MISIÓN',
        variant: 'primary',
        onClick: () => {
          clearApuLabDom();
          this.scene.start('ParticipantCodeScene');
        }
      }
    ];

    if (GameState.hasRecoverableSession()) {
      buttons.push({
        label: 'CONTINUAR',
        variant: 'secondary',
        onClick: () => {
          const gameState = GameState.getInstance();
          gameState.restoreSessionState();
          clearApuLabDom();
          this.scene.start(gameState.currentScene || 'OpportunityIntroScene');
        }
      });
    }

    buttons.push(
      {
        label: 'AJUSTES',
        variant: 'utilityDark',
        onClick: () => {
          window.alert('Control de audio y volumen estará disponible en la versión v0.2.');
        }
      },
      {
        label: 'CRÉDITOS',
        variant: 'utilityLight',
        onClick: () => this.showCreditsModal()
      }
    );

    const totalHeight = buttons.length * buttonHeight + (buttons.length - 1) * gap;
    const firstButtonY = groupCenterY - totalHeight / 2 + buttonHeight / 2;

    buttons.forEach((button, index) => {
      new ApuButton(this, {
        x: buttonX,
        y: firstButtonY + index * (buttonHeight + gap),
        width: buttonWidth,
        height: buttonHeight,
        label: button.label,
        variant: button.variant,
        onClick: button.onClick
      }).setDepth(50);
    });
  }

  private toColor(value: string): number {
    return Phaser.Display.Color.HexStringToColor(value).color;
  }

  private showCreditsModal(): void {
    this.creditsPanel?.destroy();
    this.creditsPanel = new DialoguePanel(this, {
      title: 'APULAB STATION',
      body: 'Juego educativo STEM - Piloto Web v0.1\nDesarrollado para investigación y aprendizaje de ciencias y tecnología.',
      buttonLabel: 'CERRAR',
      onClose: () => {
        this.creditsPanel = undefined;
      }
    });
  }
}
