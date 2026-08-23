import * as Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // Showloading text while procedural textures generate
    const { width, height } = this.scale;
    this.add.text(width / 2, height / 2, 'Inicializando Sistema APULAB STATION...', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '24px',
      color: '#00F2FE'
    }).setOrigin(0.5);

    this.load.pack('menu', 'assets/boot/menu/menu-pack.json');
    this.load.pack('intro', 'assets/boot/intro/intro-pack.json');
  }

  create() {
    this.generateProceduralTextures();
    this.scene.start('MainMenuScene');
  }

  private generateProceduralTextures(): void {
    // 1. Starry Space Background Texture
    const bgCanvas = this.textures.createCanvas('space_bg', 1280, 720);
    if (bgCanvas) {
      const ctx = bgCanvas.getContext();
      const grad = ctx.createRadialGradient(640, 360, 50, 640, 360, 800);
      grad.addColorStop(0, '#1A224D');
      grad.addColorStop(0.5, '#141938');
      grad.addColorStop(1, '#0B0E26');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1280, 720);

      // Draw distant stars
      for (let i = 0; i < 180; i++) {
        const x = Math.random() * 1280;
        const y = Math.random() * 720;
        const r = Math.random() * 2 + 0.5;
        const alpha = Math.random() * 0.8 + 0.2;
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw faint purple nebula dust
      for (let i = 0; i < 4; i++) {
        const nx = Math.random() * 1280;
        const ny = Math.random() * 720;
        const nr = Math.random() * 250 + 150;
        const nGrad = ctx.createRadialGradient(nx, ny, 10, nx, ny, nr);
        nGrad.addColorStop(0, 'rgba(77, 66, 136, 0.15)');
        nGrad.addColorStop(1, 'rgba(11, 14, 38, 0)');
        ctx.fillStyle = nGrad;
        ctx.beginPath();
        ctx.arc(nx, ny, nr, 0, Math.PI * 2);
        ctx.fill();
      }
      bgCanvas.refresh();
    }

    // 2. Holographic Rover Avatar (Opportunity)
    const roverCanvas = this.textures.createCanvas('rover_avatar', 160, 160);
    if (roverCanvas) {
      const ctx = roverCanvas.getContext();
      ctx.clearRect(0, 0, 160, 160);

      // Holographic glow ring
      const gGrad = ctx.createRadialGradient(80, 80, 40, 80, 80, 75);
      gGrad.addColorStop(0, 'rgba(0, 242, 254, 0.4)');
      gGrad.addColorStop(1, 'rgba(0, 242, 254, 0)');
      ctx.fillStyle = gGrad;
      ctx.beginPath();
      ctx.arc(80, 80, 75, 0, Math.PI * 2);
      ctx.fill();

      // Rover main body (Chassis)
      ctx.fillStyle = '#FFD166';
      ctx.fillRect(40, 70, 80, 40);
      ctx.strokeStyle = '#00F2FE';
      ctx.lineWidth = 3;
      ctx.strokeRect(40, 70, 80, 40);

      // Wheels
      ctx.fillStyle = '#3B326B';
      ctx.beginPath();
      ctx.arc(45, 115, 14, 0, Math.PI * 2);
      ctx.arc(80, 115, 14, 0, Math.PI * 2);
      ctx.arc(115, 115, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#00F2FE';
      ctx.beginPath();
      ctx.arc(45, 115, 14, 0, Math.PI * 2);
      ctx.arc(80, 115, 14, 0, Math.PI * 2);
      ctx.arc(115, 115, 14, 0, Math.PI * 2);
      ctx.stroke();

      // Mast & NavCam camera eye
      ctx.fillStyle = '#4D4288';
      ctx.fillRect(75, 35, 10, 35);
      ctx.fillStyle = '#00F2FE';
      ctx.beginPath();
      ctx.arc(80, 35, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0B0E26';
      ctx.beginPath();
      ctx.arc(80, 35, 5, 0, Math.PI * 2);
      ctx.fill();

      // Solar panel top
      ctx.fillStyle = '#00C6FF';
      ctx.fillRect(30, 65, 100, 6);

      roverCanvas.refresh();
    }

    // 3. Hubble Satellite Texture
    const hubbleCanvas = this.textures.createCanvas('hubble_dish', 140, 140);
    if (hubbleCanvas) {
      const ctx = hubbleCanvas.getContext();
      ctx.fillStyle = '#00F2FE';
      ctx.beginPath();
      ctx.arc(70, 70, 50, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#141938';
      ctx.beginPath();
      ctx.arc(70, 70, 42, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFD166';
      ctx.beginPath();
      ctx.arc(70, 70, 15, 0, Math.PI * 2);
      ctx.fill();
      hubbleCanvas.refresh();
    }

    // 4. Mars Planet Texture
    const marsCanvas = this.textures.createCanvas('mars_planet', 200, 200);
    if (marsCanvas) {
      const ctx = marsCanvas.getContext();
      const grad = ctx.createRadialGradient(90, 80, 10, 100, 100, 100);
      grad.addColorStop(0, '#FF8E72');
      grad.addColorStop(0.7, '#FF6B6B');
      grad.addColorStop(1, '#B71C1C');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(100, 100, 95, 0, Math.PI * 2);
      ctx.fill();

      // Mars polar ice cap
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.beginPath();
      ctx.ellipse(100, 20, 45, 15, 0, 0, Math.PI * 2);
      ctx.fill();
      marsCanvas.refresh();
    }
  }
}
