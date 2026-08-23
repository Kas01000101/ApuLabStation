import * as THREE from 'three';

const vertexShader = `
  attribute float aSize;
  attribute float aPhase;
  attribute float aSpeed;
  attribute float aMinAlpha;
  attribute float aMaxAlpha;
  attribute float aGlow;
  attribute vec3 aColor;
  attribute vec2 aDrift;

  uniform float uTime;
  uniform float uPixelRatio;

  varying float vAlpha;
  varying float vGlow;
  varying vec3 vColor;

  void main() {
    vec3 animatedPosition = position;
    animatedPosition.x += sin(uTime * aSpeed * 0.18 + aPhase) * aDrift.x;
    animatedPosition.y += cos(uTime * aSpeed * 0.12 + aPhase) * aDrift.y;

    float twinkle = 0.5 + 0.5 * sin(uTime * aSpeed + aPhase);
    vAlpha = mix(aMinAlpha, aMaxAlpha, twinkle);
    vGlow = aGlow;
    vColor = aColor;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(animatedPosition, 1.0);
    gl_PointSize = aSize * uPixelRatio;
  }
`;

const fragmentShader = `
  precision mediump float;

  varying float vAlpha;
  varying float vGlow;
  varying vec3 vColor;

  void main() {
    vec2 uv = gl_PointCoord - vec2(0.5);
    float distanceFromCenter = length(uv);
    float core = smoothstep(0.18, 0.0, distanceFromCenter) * 1.35;
    float innerGlow = smoothstep(0.34, 0.04, distanceFromCenter) * 0.72 * vGlow;
    float outerGlow = smoothstep(0.5, 0.12, distanceFromCenter) * 0.48 * vGlow;
    float alpha = min((core + innerGlow + outerGlow) * vAlpha, 1.0);
    vec3 color = vColor * (1.12 + 0.18 * vGlow);

    if (alpha < 0.01) {
      discard;
    }

    gl_FragColor = vec4(color, alpha);
  }
`;

export class StarfieldBackground {
  private renderer?: THREE.WebGLRenderer;
  private scene?: THREE.Scene;
  private camera?: THREE.OrthographicCamera;
  private points?: THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial>;
  private animationFrameId?: number;
  private isRunning = false;
  private readonly clock = new THREE.Clock();

  private readonly handleResize = (): void => this.resize();
  private readonly handleVisibilityChange = (): void => {
    if (document.visibilityState === 'hidden') {
      this.stop();
      return;
    }

    this.start();
  };

  constructor(private readonly container: HTMLElement) {}

  public start(): void {
    if (!this.renderer) {
      this.initialize();
    }

    if (this.isRunning || document.visibilityState === 'hidden') return;

    this.isRunning = true;
    this.clock.start();
    this.render();
  }

  public stop(): void {
    this.isRunning = false;
    if (this.animationFrameId !== undefined) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = undefined;
    }
    this.clock.stop();
  }

  public resize(): void {
    if (!this.renderer || !this.camera) return;

    const width = window.innerWidth;
    const height = window.innerHeight;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

    this.renderer.setPixelRatio(pixelRatio);
    this.renderer.setSize(width, height, false);
    this.camera.left = -width / 2;
    this.camera.right = width / 2;
    this.camera.top = height / 2;
    this.camera.bottom = -height / 2;
    this.camera.updateProjectionMatrix();

    this.createStars(width, height, pixelRatio);
  }

  public destroy(): void {
    this.stop();
    window.removeEventListener('resize', this.handleResize);
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    this.points?.geometry.dispose();
    this.points?.material.dispose();
    this.renderer?.dispose();
    this.renderer?.domElement.remove();
    this.points = undefined;
    this.renderer = undefined;
    this.scene = undefined;
    this.camera = undefined;
  }

  private initialize(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, 0, 10);
    this.camera.position.z = 5;

    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'low-power'
    });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setPixelRatio(pixelRatio);
    this.renderer.setSize(width, height, false);
    this.renderer.domElement.setAttribute('aria-hidden', 'true');
    this.container.appendChild(this.renderer.domElement);

    this.createStars(width, height, pixelRatio);
    window.addEventListener('resize', this.handleResize);
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
  }

  private createStars(width: number, height: number, pixelRatio: number): void {
    if (!this.scene) return;

    if (this.points) {
      this.scene.remove(this.points);
      this.points.geometry.dispose();
      this.points.material.dispose();
    }

    const starCount = PhaserSafeMath.clamp(Math.round((width * height) / 6500), 170, 230);
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);
    const phases = new Float32Array(starCount);
    const speeds = new Float32Array(starCount);
    const minAlphas = new Float32Array(starCount);
    const maxAlphas = new Float32Array(starCount);
    const glows = new Float32Array(starCount);
    const drifts = new Float32Array(starCount * 2);
    const palette = [
      new THREE.Color('#FFFFFF'),
      new THREE.Color('#DDEBFF'),
      new THREE.Color('#CFC8FF'),
      new THREE.Color('#FFD978')
    ];

    for (let i = 0; i < starCount; i++) {
      const groupRoll = Math.random();
      const isBright = groupRoll > 0.9;
      const isMedium = groupRoll > 0.6 && !isBright;
      const color = Math.random() < 0.08 ? palette[3] : palette[PhaserSafeMath.integer(0, 2)];
      const positionIndex = i * 3;
      const colorIndex = i * 3;
      const driftIndex = i * 2;

      positions[positionIndex] = PhaserSafeMath.float(-width / 2, width / 2);
      positions[positionIndex + 1] = PhaserSafeMath.float(-height / 2, height / 2);
      positions[positionIndex + 2] = 0;

      colors[colorIndex] = color.r;
      colors[colorIndex + 1] = color.g;
      colors[colorIndex + 2] = color.b;

      sizes[i] = isBright
        ? PhaserSafeMath.float(4.5, 7.5)
        : isMedium
          ? PhaserSafeMath.float(2.6, 4.2)
          : PhaserSafeMath.float(1.5, 2.6);
      phases[i] = PhaserSafeMath.float(0, Math.PI * 2);
      speeds[i] = isBright
        ? PhaserSafeMath.float(2.2, 5.4)
        : isMedium
          ? PhaserSafeMath.float(1.8, 4.6)
          : PhaserSafeMath.float(1.3, 3.5);
      minAlphas[i] = isBright
        ? PhaserSafeMath.float(0.65, 0.78)
        : isMedium
          ? PhaserSafeMath.float(0.45, 0.62)
          : PhaserSafeMath.float(0.35, 0.52);
      maxAlphas[i] = isBright
        ? PhaserSafeMath.float(0.95, 1)
        : isMedium
          ? PhaserSafeMath.float(0.86, 1)
          : PhaserSafeMath.float(0.72, 0.86);
      glows[i] = isBright
        ? PhaserSafeMath.float(1.25, 1.55)
        : isMedium
          ? PhaserSafeMath.float(0.85, 1.15)
          : PhaserSafeMath.float(0.45, 0.7);
      drifts[driftIndex] = PhaserSafeMath.float(0.2, isBright ? 1 : 0.65);
      drifts[driftIndex + 1] = PhaserSafeMath.float(0.05, 0.35);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
    geometry.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1));
    geometry.setAttribute('aMinAlpha', new THREE.BufferAttribute(minAlphas, 1));
    geometry.setAttribute('aMaxAlpha', new THREE.BufferAttribute(maxAlphas, 1));
    geometry.setAttribute('aGlow', new THREE.BufferAttribute(glows, 1));
    geometry.setAttribute('aDrift', new THREE.BufferAttribute(drifts, 2));

    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: pixelRatio }
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    this.points = new THREE.Points(geometry, material);
    this.scene.add(this.points);
  }

  private render = (): void => {
    if (!this.isRunning || !this.renderer || !this.scene || !this.camera || !this.points) return;

    this.points.material.uniforms.uTime.value = this.clock.getElapsedTime();
    this.renderer.render(this.scene, this.camera);
    this.animationFrameId = requestAnimationFrame(this.render);
  };
}

const PhaserSafeMath = {
  clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  },
  float(min: number, max: number): number {
    return min + Math.random() * (max - min);
  },
  integer(min: number, max: number): number {
    return Math.floor(this.float(min, max + 1));
  }
};
