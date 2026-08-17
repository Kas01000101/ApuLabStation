import * as Phaser from 'phaser';

export class PlaceholderArt {
  /**
   * Draws a cohesive, child-friendly space lab background on the current scene canvas.
   */
  public static drawSpaceLabBackground(scene: Phaser.Scene): void {
    const { width, height } = scene.scale;

    // 1. Dark navy space background
    const bg = scene.add.graphics();
    bg.fillGradientStyle(0x0B0E26, 0x0B0E26, 0x141938, 0x1A224D, 1);
    bg.fillRect(0, 0, width, height);

    // 2. Stars
    this.drawStars(scene);

    // 3. Space Station Observation Window & Planet outside
    this.drawPlanet(scene);

    // 4. Lab Architectural Frame & Panels
    this.drawLabPanel(scene);

    // 5. Hologram Sci-Fi Table Accent at bottom
    this.drawHologramTable(scene);
  }

  public static drawStars(scene: Phaser.Scene): void {
    const { width, height } = scene.scale;
    const g = scene.add.graphics();
    g.fillStyle(0xFFFFFF, 0.6);

    // Seeded star placement simulation
    const starCoords = [
      { x: 120, y: 80, r: 1.5, a: 0.8 },
      { x: 250, y: 140, r: 1.0, a: 0.5 },
      { x: 420, y: 60, r: 2.0, a: 0.9 },
      { x: 680, y: 110, r: 1.2, a: 0.7 },
      { x: 890, y: 75, r: 1.8, a: 0.8 },
      { x: 1050, y: 130, r: 1.0, a: 0.4 },
      { x: 1180, y: 90, r: 2.2, a: 0.95 },
      { x: 80, y: 300, r: 1.2, a: 0.6 },
      { x: 1200, y: 320, r: 1.5, a: 0.7 },
      { x: 150, y: 520, r: 1.0, a: 0.5 },
      { x: 1120, y: 550, r: 1.8, a: 0.8 }
    ];

    starCoords.forEach(s => {
      g.fillStyle(0xFFFFFF, s.a);
      g.fillCircle(s.x, s.y, s.r);
    });
  }

  public static drawPlanet(scene: Phaser.Scene): void {
    const g = scene.add.graphics();

    // Red Planet (Mars) visible through space window in upper right
    const px = 1080;
    const py = 180;
    const pr = 110;

    // Atmosphere halo glow
    g.fillStyle(0xFF6B6B, 0.15);
    g.fillCircle(px, py, pr + 18);

    // Main planet body gradient
    g.fillStyle(0xCC443B, 0.9);
    g.fillCircle(px, py, pr);

    // Surface texture details (craters & polar cap)
    g.fillStyle(0x992B24, 0.7);
    g.fillCircle(px - 25, py - 10, 30);
    g.fillCircle(px + 30, py + 25, 22);

    // Ice cap
    g.fillStyle(0xE2E8F0, 0.85);
    g.fillCircle(px - 10, py - pr + 15, 20);
  }

  public static drawLabPanel(scene: Phaser.Scene): void {
    const { width, height } = scene.scale;
    const g = scene.add.graphics();

    // Space station window frame arches
    g.lineStyle(4, 0x4D4288, 0.7);
    g.strokeRoundedRect(20, 20, width - 40, height - 40, 24);

    // Glowing cyan corner accents
    g.lineStyle(3, 0x00F2FE, 0.8);
    // Top-Left corner accent
    g.beginPath();
    g.moveTo(20, 70);
    g.lineTo(20, 20);
    g.lineTo(70, 20);
    g.strokePath();

    // Top-Right corner accent
    g.beginPath();
    g.moveTo(width - 70, 20);
    g.lineTo(width - 20, 20);
    g.lineTo(width - 20, 70);
    g.strokePath();

    // Bottom-Left corner accent
    g.beginPath();
    g.moveTo(20, height - 70);
    g.lineTo(20, height - 20);
    g.lineTo(70, height - 20);
    g.strokePath();

    // Bottom-Right corner accent
    g.beginPath();
    g.moveTo(width - 70, height - 20);
    g.lineTo(width - 20, height - 20);
    g.lineTo(width - 20, height - 70);
    g.strokePath();
  }

  public static drawHologramTable(scene: Phaser.Scene): void {
    const { width, height } = scene.scale;
    const g = scene.add.graphics();

    // Hologram projection base line at bottom of HUD
    g.fillStyle(0x00F2FE, 0.12);
    g.fillRect(100, height - 16, width - 200, 4);

    g.fillStyle(0x4D4288, 0.3);
    g.fillRoundedRect(180, height - 12, width - 360, 8, 4);
  }
}
