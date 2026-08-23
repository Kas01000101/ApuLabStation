import * as Phaser from 'phaser';
import mainMenuLayoutRaw from './MainMenuLayout.scene?raw';
import { GameState } from '../../systems/GameState';
import { TelemetryService } from '../../systems/TelemetryService';
import { getResearchRepository } from '../../systems/research/ResearchRepositoryProvider';
import { ApuButton, type ApuButtonVariant } from '../../ui/components/ApuButton';
import { uiTokens } from '../../ui/tokens';
import { DialoguePanel } from '../components/DialoguePanel';
import { AccessModal } from '../../ui/components/AccessModal';
import { clearApuLabDom } from '../../ui/domComponents';

interface EditorImageObject {
  type: 'Image';
  label?: string;
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
  private accessModal?: AccessModal;
  private layoutImagesByLabel = new Map<string, Phaser.GameObjects.Image>();
  private logoShineEffects: Phaser.Types.Actions.AddEffectShineReturn[] = [];

  constructor() {
    super({ key: 'MainMenuScene' });
  }

  create() {
    clearApuLabDom();
    this.cleanupLogoShine();
    this.layoutImagesByLabel.clear();
    this.cameras.main.setBackgroundColor('#FFFFFF');

    this.createEditorLayout();
    this.applyLogoShine();
    this.createMenuButtons();

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.cleanupLogoShine, this);
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
      if (object.label) {
        this.layoutImagesByLabel.set(object.label, image);
      }
    });
  }

  private applyLogoShine(): void {
    const logo = this.layoutImagesByLabel.get('apulab_logo');
    if (!logo || this.renderer.type !== Phaser.WEBGL) return;

    try {
      this.logoShineEffects = Phaser.Actions.AddEffectShine(logo, {
        radius: 0.16,
        direction: Math.PI * 0.18,
        scale: 2,
        duration: 1100,
        repeatDelay: 3800,
        yoyo: false,
        ease: 'Sine.easeInOut',
        colorFactor: [1.08, 1.16, 1.18, 1]
      });
    } catch (error) {
      console.warn('[ApuLab] Logo shine effect unavailable; continuing with static logo.', error);
      this.logoShineEffects = [];
    }
  }

  private cleanupLogoShine(): void {
    this.logoShineEffects.forEach((effect) => {
      try {
        effect.tween?.destroy();
        effect.dynamicTexture?.destroy();
        effect.parallelFilters?.destroy();
        effect.blendFilter?.destroy();
        effect.gradient?.destroy();
      } catch {
        // Phaser 4 can release the internal DynamicTexture stamp before scene shutdown completes.
      }
    });
    this.logoShineEffects = [];
  }

  private createMenuButtons(): void {
    const { width } = this.scale;
    const buttonX = width / 2;
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
        onClick: () => this.showMissionStartModal()
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

  private showMissionStartModal(): void {
    if (this.accessModal) return;

    this.accessModal = new AccessModal({
      onStudySubmit: (code, credential) => this.startSessionFromModal('study', code, credential),
      onDemoSubmit: () => this.startSessionFromModal('demo', '', ''),
      onClose: () => {
        this.accessModal = undefined;
      }
    });
  }

  private async startSessionFromModal(
    mode: 'study' | 'demo',
    rawCode: string,
    credential: string
  ): Promise<boolean> {
    const repository = getResearchRepository();

    if (mode === 'study' && repository.mode === 'mock') {
      this.accessModal?.setError('El modo de investigación no está activo en este entorno. Usa DEMO para desarrollo.');
      return false;
    }

    if (mode === 'study' && (!rawCode || !credential)) {
      this.accessModal?.setError('Completa código y contraseña del estudio.');
      return false;
    }

    const auth = mode === 'study'
      ? await repository.authenticateParticipant({ participantCode: rawCode, credential })
      : null;

    if (mode === 'study' && (!auth?.success || !auth.data)) {
      this.accessModal?.setError('El código o la contraseña no son correctos.');
      return false;
    }

    const gameState = GameState.getInstance();
    gameState.startNewSession(mode, mode === 'study' ? rawCode : null, auth?.data?.participant_id ?? null);
    const sessionResult = await repository.createSession(gameState.getSessionData());
    if (!sessionResult.success) {
      this.accessModal?.setError(mode === 'study' ? 'No se pudo iniciar la sesión de estudio.' : 'No se pudo iniciar la sesión demo.');
      return false;
    }

    TelemetryService.getInstance().recordEvent({
      sceneId: 'MainMenuScene',
      eventType: 'session_started',
      payload: {
        session_id: gameState.sessionId,
        session_mode: gameState.sessionMode
      }
    });

    clearApuLabDom();
    this.scene.start('OpportunityIntroScene');
    return true;
  }
}
