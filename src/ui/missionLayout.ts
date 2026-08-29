import * as Phaser from 'phaser';
import { uiTokens } from './tokens';

export interface MissionLearningModule {
  icon: string;
  title: string;
  body: string;
  color: number;
}

export interface MissionChallengeHeader {
  missionTitle: string;
  challengeTitle: string;
  subtitle: string;
  current: number;
  total: number;
}

export interface MissionChallengeFrame {
  challengeArea: typeof missionLayout.regions.challenge & { x: number; width: number };
  cardRects: Array<{ x: number; y: number; width: number; height: number; radius: number }>;
  feedbackText: Phaser.GameObjects.Text;
}

export const missionLayout = {
  canvas: uiTokens.sizes.canvas,
  safeArea: {
    left: 80,
    right: 80,
    top: 32,
    bottom: 40
  },
  regions: {
    header: {
      y: 32,
      height: 118
    },
    microlearning: {
      y: 165,
      height: 150
    },
    challenge: {
      y: 335,
      height: 400
    },
    feedback: {
      y: 755,
      height: 80
    }
  },
  cta: {
    width: 360,
    height: 72
  },
  challengeCard: {
    width: 440,
    height: 270,
    gap: 38,
    radius: 24
  },
  miniLearningModule: {
    width: 480,
    height: 125,
    gap: 32,
    radius: 18
  },
  typography: {
    missionLabel: 22,
    challengeTitle: 44,
    subtitle: 24,
    sectionTitle: 20,
    cardValue: 44,
    body: 18,
    option: 18,
    cta: 20,
    state: 16
  },
  fontFamily: uiTokens.typography.family.primary
} as const;

export class MissionChallengeLayout {
  public static readonly tokens = missionLayout;

  public static getSafeWidth(): number {
    const { canvas, safeArea } = missionLayout;
    return canvas.width - safeArea.left - safeArea.right;
  }

  public static getChallengeArea(): MissionChallengeFrame['challengeArea'] {
    const { safeArea, regions } = missionLayout;
    return {
      x: safeArea.left,
      y: regions.challenge.y,
      width: this.getSafeWidth(),
      height: regions.challenge.height
    };
  }

  public static getCardRects(): MissionChallengeFrame['cardRects'] {
    const { safeArea, challengeCard } = missionLayout;
    const totalWidth = challengeCard.width * 3 + challengeCard.gap * 2;
    const startX = safeArea.left + Math.round((this.getSafeWidth() - totalWidth) / 2);
    const y = missionLayout.regions.challenge.y + 92;

    return [0, 1, 2].map((index) => ({
      x: startX + index * (challengeCard.width + challengeCard.gap),
      y,
      width: challengeCard.width,
      height: challengeCard.height,
      radius: challengeCard.radius
    }));
  }

  public static drawFrame(
    scene: Phaser.Scene,
    header: MissionChallengeHeader,
    modules: MissionLearningModule[],
    onCta: () => void,
    feedbackMessage: string
  ): MissionChallengeFrame {
    this.drawHeader(scene, header);
    this.drawLearningArea(scene, modules);
    const feedbackText = this.drawFeedbackAndCta(scene, onCta, feedbackMessage);

    return {
      challengeArea: this.getChallengeArea(),
      cardRects: this.getCardRects(),
      feedbackText
    };
  }

  private static drawHeader(scene: Phaser.Scene, header: MissionChallengeHeader): void {
    const { canvas, safeArea, regions, typography, fontFamily } = missionLayout;
    const x = safeArea.left;
    const y = regions.header.y;
    const width = canvas.width - safeArea.left - safeArea.right;
    const height = regions.header.height;
    const plate = scene.add.graphics();
    plate.fillStyle(0x0b0e26, 0.46);
    plate.fillRoundedRect(x, y, width, height, 24);
    plate.lineStyle(2, 0x00f2fe, 0.36);
    plate.strokeRoundedRect(x + 6, y + 6, width - 12, height - 12, 20);
    plate.lineStyle(2, 0xf2c94c, 0.5);
    plate.lineBetween(x + 16, y + height - 10, x + 360, y + height - 10);

    scene.add.text(x + 22, y + 15, header.missionTitle, {
      fontFamily,
      fontSize: `${typography.missionLabel}px`,
      fontStyle: uiTokens.typography.weight.bold,
      color: '#F2C94C'
    });

    const title = scene.add.text(x + 22, y + 42, header.challengeTitle, {
      fontFamily,
      fontSize: `${typography.challengeTitle}px`,
      fontStyle: '800',
      color: '#00F2FE'
    });
    title.setShadow(0, 0, 'rgba(0, 242, 254, 0.42)', 12, false, true);

    scene.add.text(x + 24, y + 88, header.subtitle.toUpperCase(), {
      fontFamily,
      fontSize: `${typography.subtitle}px`,
      fontStyle: uiTokens.typography.weight.bold,
      color: '#FFFFFF'
    });

    const progressDots = Array.from({ length: header.total }, (_, index) => index < header.current ? '●' : '○').join(' ━━━ ');
    const progress = scene.add.text(x + width - 456, y + 38, progressDots, {
      fontFamily,
      fontSize: '26px',
      fontStyle: uiTokens.typography.weight.bold,
      color: '#FFFFFF'
    });
    progress.setShadow(0, 0, 'rgba(0, 242, 254, 0.54)', 10, false, true);

    scene.add.text(x + width - 302, y + 76, `${header.current} / ${header.total}`, {
      fontFamily,
      fontSize: `${typography.missionLabel}px`,
      fontStyle: uiTokens.typography.weight.bold,
      color: '#F2C94C'
    }).setOrigin(0.5);
  }

  private static drawLearningArea(scene: Phaser.Scene, modules: MissionLearningModule[]): void {
    const { safeArea, regions, miniLearningModule, typography, fontFamily } = missionLayout;
    const y = regions.microlearning.y + Math.round((regions.microlearning.height - miniLearningModule.height) / 2);
    const moduleCount = modules.length;
    const totalWidth = miniLearningModule.width * moduleCount + miniLearningModule.gap * (moduleCount - 1);
    const startX = safeArea.left + Math.round((this.getSafeWidth() - totalWidth) / 2);

    modules.forEach((module, index) => {
      const x = startX + index * (miniLearningModule.width + miniLearningModule.gap);
      const g = scene.add.graphics();
      g.fillGradientStyle(0x17235d, 0x253eaa, 0x2d2654, 0x151a46, 0.96, 0.96, 0.96, 0.96);
      g.fillRoundedRect(x, y, miniLearningModule.width, miniLearningModule.height, miniLearningModule.radius);
      g.lineStyle(2, module.color, 0.64);
      g.strokeRoundedRect(x + 4, y + 4, miniLearningModule.width - 8, miniLearningModule.height - 8, miniLearningModule.radius - 4);
      g.fillStyle(module.color, 0.22);
      g.fillCircle(x + 58, y + 62, 32);

      scene.add.text(x + 58, y + 62, module.icon, {
        fontFamily,
        fontSize: module.title === 'BATERÍA' ? '28px' : '32px',
        fontStyle: '800',
        color: '#FFFFFF'
      }).setOrigin(0.5);

      scene.add.text(x + 110, y + 28, module.title, {
        fontFamily,
        fontSize: `${typography.sectionTitle}px`,
        fontStyle: uiTokens.typography.weight.bold,
        color: '#FFFFFF'
      });

      scene.add.text(x + 110, y + 58, module.body, {
        fontFamily,
        fontSize: `${typography.body}px`,
        fontStyle: uiTokens.typography.weight.medium,
        color: '#E7E4FF',
        wordWrap: { width: miniLearningModule.width - 142, useAdvancedWrap: true }
      });
    });
  }

  private static drawFeedbackAndCta(scene: Phaser.Scene, onClick: () => void, feedbackMessage: string): Phaser.GameObjects.Text {
    const { canvas, safeArea, regions, cta, typography, fontFamily } = missionLayout;
    const ctaX = canvas.width - safeArea.right - cta.width;
    const ctaY = regions.feedback.y + Math.round((regions.feedback.height - cta.height) / 2);
    const feedbackX = safeArea.left;
    const feedbackWidth = ctaX - feedbackX - 32;
    const feedbackBg = scene.add.graphics();
    feedbackBg.fillStyle(0x0b0e26, 0.42);
    feedbackBg.fillRoundedRect(feedbackX, regions.feedback.y, feedbackWidth, regions.feedback.height, 18);
    feedbackBg.lineStyle(2, 0x4d4288, 0.58);
    feedbackBg.strokeRoundedRect(feedbackX + 4, regions.feedback.y + 4, feedbackWidth - 8, regions.feedback.height - 8, 14);

    const feedbackText = scene.add.text(feedbackX + 26, regions.feedback.y + 18, feedbackMessage, {
      fontFamily,
      fontSize: `${typography.body}px`,
      fontStyle: uiTokens.typography.weight.semibold,
      color: '#F8F9FA',
      wordWrap: { width: feedbackWidth - 52, useAdvancedWrap: true }
    });

    const button = scene.add.container(ctaX, ctaY);
    const shadow = scene.add.graphics();
    const body = scene.add.graphics();
    shadow.fillStyle(0x9f6f00, 0.78);
    shadow.fillRoundedRect(0, 12, cta.width, cta.height, cta.height / 2);
    body.fillGradientStyle(0xfff3a6, 0xffdf62, 0xf2c94c, 0xd99c13, 1, 1, 1, 1);
    body.fillRoundedRect(0, 0, cta.width, cta.height, cta.height / 2);
    body.lineStyle(3, 0xffffff, 0.72);
    body.strokeRoundedRect(3, 3, cta.width - 6, cta.height - 6, (cta.height - 6) / 2);
    body.fillStyle(0xffffff, 0.22);
    body.fillRoundedRect(46, 10, cta.width - 92, 9, 5);
    const label = scene.add.text(cta.width / 2, cta.height / 2, 'COMPROBAR', {
      fontFamily,
      fontSize: `${typography.cta}px`,
      fontStyle: uiTokens.typography.weight.bold,
      color: '#302A5C'
    }).setOrigin(0.5);
    button.add([shadow, body, label]);

    const zone = scene.add.zone(ctaX, ctaY, cta.width, cta.height + 12).setOrigin(0).setInteractive({ useHandCursor: true });
    zone.on(Phaser.Input.Events.POINTER_DOWN, () => button.setY(ctaY + 4));
    zone.on(Phaser.Input.Events.POINTER_OUT, () => button.setY(ctaY));
    zone.on(Phaser.Input.Events.POINTER_UP, () => {
      button.setY(ctaY);
      onClick();
    });

    return feedbackText;
  }
}
