import * as THREE from 'three';
import { ThreeDisposer } from '../core/ThreeDisposer';
import { ApuLabMaterials } from './ApuLabMaterials';

const DISPLAY_WIDTH = 256;
const DISPLAY_HEIGHT = 128;

export class Multimeter {
  readonly object = new THREE.Group();
  private readonly displayCanvas = document.createElement('canvas');
  private readonly displayTexture: THREE.CanvasTexture;
  private readonly displayMaterial: THREE.MeshBasicMaterial;
  private readonly disposer = new ThreeDisposer();
  private readonly bodyMaterial = new THREE.MeshStandardMaterial({
    color: 0x14161a,
    roughness: 0.68,
    metalness: 0.08
  });
  private readonly dialMaterial = new THREE.MeshStandardMaterial({
    color: 0x06070a,
    roughness: 0.62,
    metalness: 0.1
  });
  private readonly lcdBezelMaterial = new THREE.MeshStandardMaterial({
    color: 0x1d2023,
    roughness: 0.48,
    metalness: 0.18
  });
  private readonly whiteMarkMaterial = new THREE.MeshStandardMaterial({
    color: 0xe8ecef,
    roughness: 0.56,
    metalness: 0.04
  });
  private displayText = '0.00 V';

  constructor(private readonly materials: ApuLabMaterials) {
    this.object.name = 'ApuLabMultimeter';
    this.displayCanvas.width = DISPLAY_WIDTH;
    this.displayCanvas.height = DISPLAY_HEIGHT;
    this.displayTexture = new THREE.CanvasTexture(this.displayCanvas);
    this.displayTexture.colorSpace = THREE.SRGBColorSpace;
    this.displayMaterial = this.materials.createDisplayMaterial(this.displayTexture);

    this.buildBody();
    this.setDisplay(this.displayText);
  }

  setDisplay(text: string): void {
    this.displayText = text;
    const ctx = this.displayCanvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, DISPLAY_WIDTH, DISPLAY_HEIGHT);
    ctx.fillStyle = '#B7C7A3';
    ctx.fillRect(0, 0, DISPLAY_WIDTH, DISPLAY_HEIGHT);
    ctx.fillStyle = '#8FA17F';
    ctx.globalAlpha = 0.16;
    for (let y = 13; y < DISPLAY_HEIGHT; y += 16) {
      ctx.fillRect(18, y, DISPLAY_WIDTH - 36, 2);
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#101511';
    ctx.font = '800 46px Poppins, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, DISPLAY_WIDTH / 2, DISPLAY_HEIGHT / 2 - 1);
    ctx.font = '700 14px Poppins, sans-serif';
    ctx.fillStyle = '#2D382F';
    ctx.fillText('DC VOLTS', DISPLAY_WIDTH / 2, DISPLAY_HEIGHT - 16);
    this.displayTexture.needsUpdate = true;
  }

  dispose(): void {
    this.disposer.disposeObject(this.object);
    this.disposer.disposeTexture(this.displayTexture);
    this.disposer.disposeMaterial(this.displayMaterial);
    this.disposer.disposeMaterial(this.bodyMaterial);
    this.disposer.disposeMaterial(this.dialMaterial);
    this.disposer.disposeMaterial(this.lcdBezelMaterial);
    this.disposer.disposeMaterial(this.whiteMarkMaterial);
  }

  private buildBody(): void {
    const outerCase = new THREE.Mesh(new THREE.BoxGeometry(1.16, 1.92, 0.32), this.materials.safetyYellowRubber);
    outerCase.name = 'MultimeterOuterRubberCase';
    outerCase.position.set(0, 0, 0);
    this.object.add(outerCase);

    const innerBody = new THREE.Mesh(new THREE.BoxGeometry(0.94, 1.58, 0.36), this.bodyMaterial);
    innerBody.name = 'MultimeterInnerDarkBody';
    innerBody.position.set(0, -0.02, 0.035);
    this.object.add(innerBody);

    const topGuard = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.11, 0.39), this.materials.safetyYellowRubber);
    topGuard.name = 'MultimeterTopRubberGuard';
    topGuard.position.set(0, 0.86, 0.055);
    this.object.add(topGuard);

    const bottomGuard = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.13, 0.39), this.materials.safetyYellowRubber);
    bottomGuard.name = 'MultimeterBottomRubberGuard';
    bottomGuard.position.set(0, -0.87, 0.055);
    this.object.add(bottomGuard);

    const displayBezel = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.39, 0.09), this.lcdBezelMaterial);
    displayBezel.name = 'MultimeterDisplayBezel';
    displayBezel.position.set(0, 0.53, 0.25);
    this.object.add(displayBezel);

    const display = new THREE.Mesh(new THREE.PlaneGeometry(0.64, 0.26), this.displayMaterial);
    display.name = 'MultimeterDisplaySurface';
    display.position.set(0, 0.53, 0.302);
    this.object.add(display);

    const dial = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.31, 0.12, 40), this.dialMaterial);
    dial.name = 'MultimeterSelectorDial';
    dial.rotation.x = Math.PI / 2;
    dial.position.set(0, -0.14, 0.275);
    this.object.add(dial);

    const dialCap = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.19, 0.13, 32), this.materials.blackRubber);
    dialCap.name = 'MultimeterSelectorDialCap';
    dialCap.rotation.x = Math.PI / 2;
    dialCap.position.set(0, -0.14, 0.345);
    this.object.add(dialCap);

    const indicator = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.28, 0.04), this.whiteMarkMaterial);
    indicator.name = 'MultimeterSelectorIndicator';
    indicator.position.set(-0.095, 0.03, 0.425);
    indicator.rotation.z = -0.58;
    this.object.add(indicator);

    this.object.add(
      this.createTextPlate('OFF', -0.02, 0.27, 0.318, 22, '#D8DCE0'),
      this.createTextPlate('V⎓', -0.34, 0.12, 0.318, 36, '#F7F7F2'),
      this.createTextPlate('V~', 0.33, 0.08, 0.318, 34, '#D8DCE0'),
      this.createTextPlate('Ω', 0, -0.5, 0.318, 34, '#D8DCE0'),
      this.createTextPlate('COM', -0.26, -0.59, 0.322, 22, '#D8DCE0'),
      this.createTextPlate('VΩ', 0.26, -0.59, 0.322, 22, '#F6D0D0')
    );

    const rearStand = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.78, 0.07), this.materials.blackRubber);
    rearStand.name = 'MultimeterRearKickstand';
    rearStand.position.set(0, -0.1, -0.23);
    rearStand.rotation.x = THREE.MathUtils.degToRad(-18);
    this.object.add(rearStand);

    const redJack = this.createJack(0xe53945, 'MultimeterRedInputJack');
    redJack.position.set(0.26, -0.76, 0.315);
    this.object.add(redJack);

    const comJack = this.createJack(0x050711, 'MultimeterComInputJack');
    comJack.position.set(-0.26, -0.76, 0.315);
    this.object.add(comJack);
  }

  private createJack(color: number, name: string): THREE.Group {
    const group = new THREE.Group();
    group.name = name;
    const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.045, 24), this.materials.createHighlightMaterial(color));
    ring.rotation.x = Math.PI / 2;
    group.add(ring);
    const socket = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.055, 24), this.materials.blackRubber);
    socket.rotation.x = Math.PI / 2;
    socket.position.z = 0.016;
    group.add(socket);
    return group;
  }

  private createTextPlate(text: string, x: number, y: number, z: number, size: number, color: string): THREE.Mesh {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = color;
      ctx.font = `800 ${size}px Poppins, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, canvas.width / 2, canvas.height / 2 + 1);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, toneMapped: false });
    const plate = new THREE.Mesh(new THREE.PlaneGeometry(0.23, 0.11), material);
    plate.name = `MultimeterLabel${text.replace(/\W/g, '')}`;
    plate.position.set(x, y, z);
    return plate;
  }
}
