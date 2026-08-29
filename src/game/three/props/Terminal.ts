import * as THREE from 'three';
import { ThreeDisposer } from '../core/ThreeDisposer';
import type { SnapPolarity } from '../interaction/InteractionTypes';
import { SnapTarget } from '../interaction/SnapTarget';
import { ApuLabMaterials } from './ApuLabMaterials';

type TerminalParts = {
  base: THREE.Mesh;
  contact: THREE.Mesh;
  glow: THREE.Mesh;
};

export class Terminal {
  readonly object = new THREE.Group();
  readonly positiveSnapTarget: SnapTarget;
  readonly negativeSnapTarget: SnapTarget;

  private readonly disposer = new ThreeDisposer();
  private readonly terminals = new Map<SnapPolarity, TerminalParts>();
  private pulseSeconds = 0;

  constructor(readonly id: string, materials: ApuLabMaterials, position: THREE.Vector3) {
    this.object.name = id;
    this.object.position.copy(position);

    const fixture = new THREE.Mesh(new THREE.BoxGeometry(1.28, 0.2, 0.48), materials.graphite);
    fixture.name = 'KawsayElectricalModuleBody';
    fixture.position.set(0, -0.1, 0);
    this.object.add(fixture);

    const fixtureTop = new THREE.Mesh(new THREE.BoxGeometry(1.12, 0.026, 0.34), materials.darkMetal);
    fixtureTop.name = 'KawsayElectricalModuleTopPanel';
    fixtureTop.position.set(0, 0.014, 0);
    this.object.add(fixtureTop);

    const frame = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.018, 0.04), materials.metallicSilver);
    frame.name = 'KawsayElectricalModuleFrontFrame';
    frame.position.set(0, 0.03, 0.22);
    this.object.add(frame);

    const accent = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.014, 0.024), materials.violet);
    accent.name = 'KawsayElectricalModuleVioletAccent';
    accent.position.set(0, 0.042, -0.21);
    this.object.add(accent);

    const label = this.createLabel();
    label.position.set(0, 0.044, -0.16);
    label.rotation.x = -Math.PI / 2;
    this.object.add(label);

    this.positiveSnapTarget = this.createTerminal({
      id: 'kawsay-positive',
      polarity: 'positive',
      materials,
      x: -0.32,
      ringMaterial: materials.redProbe,
      symbol: '+'
    });
    this.negativeSnapTarget = this.createTerminal({
      id: 'kawsay-negative',
      polarity: 'negative',
      materials,
      x: 0.32,
      ringMaterial: materials.blackRubber,
      symbol: '-'
    });

    [-0.52, 0.52].forEach((x) => {
      [-0.14, 0.18].forEach((z) => {
        const screw = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.012, 16), materials.metallicSilver);
        screw.name = 'KawsayElectricalModuleScrew';
        screw.position.set(x, 0.05, z);
        this.object.add(screw);
      });
    });
  }

  update(delta: number): void {
    this.pulseSeconds += delta;
    this.terminals.forEach(({ glow }) => {
      if (!glow.visible) return;
      const pulse = 1 + Math.sin(this.pulseSeconds * 8) * 0.08;
      glow.scale.setScalar(pulse);
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

  dispose(): void {
    this.disposer.disposeObject(this.object);
  }

  private createTerminal(options: {
    id: string;
    polarity: SnapPolarity;
    materials: ApuLabMaterials;
    x: number;
    ringMaterial: THREE.Material;
    symbol: '+' | '-';
  }): SnapTarget {
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.118, 0.118, 0.028, 32), options.ringMaterial);
    base.name = options.polarity === 'positive' ? 'PositiveTerminalRing' : 'NegativeTerminalRing';
    base.position.set(options.x, 0.045, 0.08);
    this.object.add(base);

    const contact = new THREE.Mesh(new THREE.CylinderGeometry(0.064, 0.064, 0.022, 28), options.materials.metallicSilver);
    contact.name = options.polarity === 'positive' ? 'PositiveTerminalContact' : 'NegativeTerminalContact';
    contact.position.set(options.x, 0.077, 0.08);
    this.object.add(contact);

    const symbol = this.createSymbol(options.symbol, options.materials);
    symbol.position.set(options.x, 0.112, 0.08);
    this.object.add(symbol);

    const glow = new THREE.Mesh(
      new THREE.RingGeometry(0.112, 0.168, 36),
      options.materials.createHighlightMaterial(0x58f2ff)
    );
    glow.name = options.polarity === 'positive' ? 'PositiveTerminalHighlight' : 'NegativeTerminalHighlight';
    glow.rotation.x = -Math.PI / 2;
    glow.position.set(options.x, 0.088, 0.08);
    glow.visible = false;
    this.object.add(glow);

    this.terminals.set(options.polarity, { base, contact, glow });

    return new SnapTarget(options.id, options.polarity, contact, 0.24, (active, snapped) => {
      glow.visible = active || snapped;
    });
  }

  private createSymbol(text: '+' | '-', materials: ApuLabMaterials): THREE.Group {
    const group = new THREE.Group();
    group.name = text === '+' ? 'PositiveTerminalPlus' : 'NegativeTerminalMinus';
    const horizontal = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.016, 0.022), materials.metallicSilver);
    group.add(horizontal);
    if (text === '+') {
      const vertical = new THREE.Mesh(new THREE.BoxGeometry(0.016, 0.13, 0.022), materials.metallicSilver);
      group.add(vertical);
    }
    return group;
  }

  private createLabel(): THREE.Mesh {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#111521';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = '#49C9D7';
      ctx.lineWidth = 3;
      ctx.strokeRect(5, 5, canvas.width - 10, canvas.height - 10);
      ctx.fillStyle = '#F8F9FA';
      ctx.font = '700 18px Poppins, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('KAWSAY-1 POWER', canvas.width / 2, 22);
      ctx.fillText('TEST MODULE', canvas.width / 2, 44);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    const material = new THREE.MeshBasicMaterial({ map: texture, toneMapped: false });
    return new THREE.Mesh(new THREE.PlaneGeometry(0.76, 0.18), material);
  }
}
