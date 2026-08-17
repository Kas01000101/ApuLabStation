import * as Phaser from 'phaser';
import mainMenuLayoutRaw from './MainMenuLayout.scene?raw';
import { GameState } from '../../systems/GameState';
import { MenuButton } from '../components/MenuButton';
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
    panel.fillStyle(0x2D2654, 0.85);
    panel.lineStyle(3, 0x4D4288, 1);
    panel.fillRoundedRect(width / 2 - 360, 60, 720, 190, 24);
    panel.strokeRoundedRect(width / 2 - 360, 60, 720, 190, 24);

    const titleText = this.add.text(width / 2, 115, 'APULAB STATION', {
      fontFamily: 'Space Grotesk, sans-serif',
      fontSize: '52px',
      color: '#00F2FE',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    titleText.setShadow(0, 0, '#00F2FE', 16, true, true);

    this.add.text(width / 2, 185, 'Explora, experimenta y crea tu misión.', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '22px',
      color: '#F8F9FA'
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
    const firstButtonY = 328;
    const gap = 76;
    const buttons: Array<{ label: string; variant: 'primary' | 'secondary'; onClick: () => void }> = [
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
        variant: 'secondary',
        onClick: () => {
          window.alert('Control de audio y volumen estará disponible en la versión v0.2.');
        }
      },
      {
        label: 'CRÉDITOS',
        variant: 'secondary',
        onClick: () => this.showCreditsModal()
      }
    );

    buttons.forEach((button, index) => {
      new MenuButton(this, {
        x: buttonX,
        y: firstButtonY + index * gap,
        width: button.variant === 'primary' ? 330 : 285,
        height: 60,
        label: button.label,
        variant: button.variant,
        onClick: button.onClick
      }).setDepth(50);
    });
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
