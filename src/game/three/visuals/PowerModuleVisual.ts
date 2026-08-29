import * as THREE from 'three';
import { ThreeDisposer } from '../core/ThreeDisposer';
import type { SnapPolarity } from '../interaction/InteractionTypes';
import { SnapTarget } from '../interaction/SnapTarget';
import { ApuLabMaterials } from '../props/ApuLabMaterials';

type TerminalParts = {
  contact: THREE.Mesh;
  hole: THREE.Mesh;
  glow: THREE.Mesh;
};

export class PowerModuleVisual {
  readonly object = new THREE.Group();
  readonly positiveAnchor = new THREE.Object3D();
  readonly negativeAnchor = new THREE.Object3D();
  readonly positiveSnapTarget: SnapTarget;
  readonly negativeSnapTarget: SnapTarget;

  private readonly disposer = new ThreeDisposer();
  private readonly terminals = new Map<SnapPolarity, TerminalParts>();
  private readonly bodyMaterial = new THREE.MeshStandardMaterial({
    color: 0x2a3039,
    roughness: 0.62,
    metalness: 0.16
  });
  private readonly coverMaterial = new THREE.MeshStandardMaterial({
    color: 0x252b34,
    roughness: 0.56,
    metalness: 0.2
  });
  private readonly frameMaterial = new THREE.MeshStandardMaterial({
    color: 0x3a414c,
    roughness: 0.42,
    metalness: 0.5
  });
  private readonly terminalHoleMaterial = new THREE.MeshStandardMaterial({
    color: 0x090b0f,
    roughness: 0.6,
    metalness: 0.12
  });
  private readonly labelMaterial: THREE.MeshBasicMaterial;
  private readonly labelTexture: THREE.CanvasTexture;
  private pulseSeconds = 0;

  constructor(readonly id: string, private readonly materials: ApuLabMaterials, position: THREE.Vector3) {
    this.object.name = id;
    this.object.position.copy(position);
    this.labelTexture = this.createLabelTexture();
    this.labelMaterial = new THREE.MeshBasicMaterial({
      map: this.labelTexture,
      toneMapped: false
    });

    this.buildBody();
    this.positiveSnapTarget = this.createTerminal({
      id: 'kawsay-positive',
      polarity: 'positive',
      x: -0.29,
      ringMaterial: materials.redProbe
    });
    this.negativeSnapTarget = this.createTerminal({
      id: 'kawsay-negative',
      polarity: 'negative',
      x: 0.29,
      ringMaterial: materials.blackRubber
    });
    this.buildDetails();
  }

  update(delta: number): void {
    this.pulseSeconds += delta;
    this.terminals.forEach(({ glow }) => {
      if (!glow.visible) return;
      glow.scale.setScalar(1 + Math.sin(this.pulseSeconds * 8) * 0.08);
    });
  }

  setTerminalSnapped(polarity: SnapPolarity, snapped: boolean): void {
    const terminal = this.terminals.get(polarity);
    if (!terminal) return;
    terminal.glow.visible = snapped;
  }

  pulseValidMeasurement(): void {
    this.terminals.forEach(({ glow }) => {
      glow.visible = true;
    });
  }

  getPositiveTerminalWorldPosition(): THREE.Vector3 {
    return this.positiveAnchor.getWorldPosition(new THREE.Vector3());
  }

  getNegativeTerminalWorldPosition(): THREE.Vector3 {
    return this.negativeAnchor.getWorldPosition(new THREE.Vector3());
  }

  dispose(): void {
    this.disposer.disposeObject(this.object);
    this.disposer.disposeMaterial(this.bodyMaterial);
    this.disposer.disposeMaterial(this.coverMaterial);
    this.disposer.disposeMaterial(this.frameMaterial);
    this.disposer.disposeMaterial(this.terminalHoleMaterial);
    this.disposer.disposeMaterial(this.labelMaterial);
    this.disposer.disposeTexture(this.labelTexture);
  }

  private buildBody(): void {
    const mainBody = new THREE.Mesh(new THREE.BoxGeometry(1, 0.5, 0.48), this.bodyMaterial);
    mainBody.name = 'KawsayPowerModuleMainBody';
    mainBody.position.set(0, 0, 0);
    this.object.add(mainBody);

    const topCover = new THREE.Mesh(new THREE.BoxGeometry(1.08, 0.08, 0.54), this.coverMaterial);
    topCover.name = 'KawsayPowerModuleTopCover';
    topCover.position.set(0, 0.29, 0);
    this.object.add(topCover);

    const frontPanel = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.3, 0.024), this.frameMaterial);
    frontPanel.name = 'KawsayPowerModuleFrontPanel';
    frontPanel.position.set(0, 0.01, 0.254);
    this.object.add(frontPanel);

    const labelPlate = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.18), this.labelMaterial);
    labelPlate.name = 'KawsayPowerModuleLabelPlate';
    labelPlate.position.set(-0.2, -0.085, 0.268);
    this.object.add(labelPlate);

    const framePieces = [
      { name: 'LeftGuard', position: [-0.56, 0.025, 0], size: [0.06, 0.54, 0.56] },
      { name: 'RightGuard', position: [0.56, 0.025, 0], size: [0.06, 0.54, 0.56] },
      { name: 'FrontLowerGuard', position: [0, -0.255, 0.28], size: [1.1, 0.05, 0.06] },
      { name: 'RearLowerGuard', position: [0, -0.255, -0.28], size: [1.1, 0.05, 0.06] }
    ] as const;

    framePieces.forEach((piece) => {
      const [width, height, depth] = piece.size;
      const [x, y, z] = piece.position;
      const guard = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), this.frameMaterial);
      guard.name = `KawsayPowerModule${piece.name}`;
      guard.position.set(x, y, z);
      this.object.add(guard);
    });

    const accent = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.014, 0.022), this.materials.violet);
    accent.name = 'KawsayPowerModuleApuLabAccent';
    accent.position.set(0.18, 0.342, -0.22);
    this.object.add(accent);
  }

  private createTerminal(options: {
    id: string;
    polarity: SnapPolarity;
    x: number;
    ringMaterial: THREE.Material;
  }): SnapTarget {
    const anchor = options.polarity === 'positive' ? this.positiveAnchor : this.negativeAnchor;
    anchor.name = options.polarity === 'positive' ? 'PositiveTerminalAnchor' : 'NegativeTerminalAnchor';
    anchor.position.set(options.x, 0.095, 0.304);
    this.object.add(anchor);

    const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.044, 0.044, 0.018, 32), options.ringMaterial);
    ring.name = options.polarity === 'positive' ? 'PositiveTerminalRing' : 'NegativeTerminalRing';
    ring.position.copy(anchor.position);
    ring.rotation.x = Math.PI / 2;
    this.object.add(ring);

    const contact = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.026, 0.022, 28), this.materials.metallicSilver);
    contact.name = options.polarity === 'positive' ? 'PositiveTerminalContact' : 'NegativeTerminalContact';
    contact.position.set(options.x, 0.095, 0.316);
    contact.rotation.x = Math.PI / 2;
    this.object.add(contact);

    const hole = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.024, 20), this.terminalHoleMaterial);
    hole.name = options.polarity === 'positive' ? 'PositiveTerminalHole' : 'NegativeTerminalHole';
    hole.position.set(options.x, 0.095, 0.329);
    hole.rotation.x = Math.PI / 2;
    this.object.add(hole);

    const symbol = this.createSymbol(options.polarity === 'positive' ? '+' : '-');
    symbol.position.set(options.x, 0.18, 0.322);
    this.object.add(symbol);

    const glow = new THREE.Mesh(
      new THREE.RingGeometry(0.05, 0.066, 36),
      this.materials.createHighlightMaterial(0x58f2ff)
    );
    glow.name = options.polarity === 'positive' ? 'PositiveTerminalHighlight' : 'NegativeTerminalHighlight';
    glow.position.set(options.x, 0.095, 0.333);
    glow.visible = false;
    this.object.add(glow);

    this.terminals.set(options.polarity, { contact, hole, glow });

    return new SnapTarget(options.id, options.polarity, hole, 0.23, (active, snapped) => {
      glow.visible = active || snapped;
    });
  }

  private buildDetails(): void {
    const led = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.01, 20), this.materials.cyanEmissive);
    led.name = 'KawsayPowerModuleStatusLed';
    led.position.set(0.24, 0.01, 0.268);
    led.rotation.x = Math.PI / 2;
    this.object.add(led);

    const statusLabel = this.createTextPlate('STATUS', 0.18, 0.044);
    statusLabel.position.set(0.24, 0.055, 0.268);
    this.object.add(statusLabel);

    [
      [-0.43, 0.335, -0.18],
      [0.43, 0.335, -0.18],
      [-0.43, 0.335, 0.2],
      [0.43, 0.335, 0.2],
      [-0.43, -0.16, 0.268],
      [0.43, -0.16, 0.268]
    ].forEach(([x, y, z]) => {
      const screw = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.012, 16), this.materials.metallicSilver);
      screw.name = 'KawsayPowerModuleScrew';
      screw.position.set(x, y, z);
      if (z > 0.24) screw.rotation.x = Math.PI / 2;
      this.object.add(screw);
    });
  }

  private createSymbol(text: '+' | '-'): THREE.Group {
    const group = new THREE.Group();
    group.name = text === '+' ? 'PositiveTerminalPlusSymbol' : 'NegativeTerminalMinusSymbol';
    const horizontal = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.01, 0.016), this.materials.metallicSilver);
    group.add(horizontal);
    if (text === '+') {
      const vertical = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.07, 0.016), this.materials.metallicSilver);
      group.add(vertical);
    }
    return group;
  }

  private createTextPlate(text: string, width: number, height: number): THREE.Mesh {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 48;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#C8D1DA';
      ctx.font = '700 18px Poppins, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, canvas.width / 2, canvas.height / 2);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, toneMapped: false });
    return new THREE.Mesh(new THREE.PlaneGeometry(width, height), material);
  }

  private createLabelTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#161B22';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = '#596270';
      ctx.lineWidth = 5;
      ctx.strokeRect(7, 7, canvas.width - 14, canvas.height - 14);
      ctx.fillStyle = '#F8F9FA';
      ctx.font = '800 30px Poppins, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('KAWSAY-1', canvas.width / 2, 45);
      ctx.font = '800 24px Poppins, sans-serif';
      ctx.fillText('POWER MODULE', canvas.width / 2, 84);
      ctx.font = '600 13px Poppins, sans-serif';
      ctx.fillStyle = '#B8C2CC';
      ctx.fillText('DC SYSTEM', canvas.width / 2, 110);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }
}
