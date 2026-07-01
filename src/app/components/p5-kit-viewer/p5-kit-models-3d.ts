import type p5 from 'p5';

type Sketch = InstanceType<typeof p5>;

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

const MOTOR_IDS = new Set(['dc-motor', 'motores-dc', 'motor-dc-gear-6v']);

function drawArduino3D(sk: Sketch): void {
  sk.push();
  sk.translate(0, 5, 0);
  sk.fill(34, 139, 34);
  sk.noStroke();
  sk.box(160, 10, 220);

  sk.push();
  sk.translate(0, 7, 0);
  sk.fill(0);
  sk.box(50, 4, 50);
  sk.pop();

  sk.push();
  sk.translate(-60, 6.5, -90);
  sk.fill(192, 192, 192);
  sk.box(30, 3, 20);
  sk.pop();

  sk.fill(30, 30, 30);
  for (let i = 0; i < 14; i++) {
    const z = -74 + (i * 148) / 13;
    sk.push();
    sk.translate(80, 14, z);
    sk.cylinder(1, 8);
    sk.pop();
  }
  for (let i = 0; i < 6; i++) {
    const x = -42 + i * 14;
    sk.push();
    sk.translate(x, 14, 110);
    sk.cylinder(1, 8);
    sk.pop();
  }
  sk.pop();
}

function drawL298n3D(sk: Sketch): void {
  sk.push();
  sk.translate(0, 5, 0);
  sk.fill(30, 30, 120);
  sk.noStroke();
  sk.box(140, 10, 100);

  sk.push();
  sk.translate(0, 12.5, 0);
  sk.fill(0);
  sk.box(60, 15, 40);
  sk.pop();

  sk.fill(140, 140, 140);
  const xs = [-42, -14, 14, 42];
  for (const x of xs) {
    sk.push();
    sk.translate(x, 9, 46);
    sk.box(15, 8, 8);
    sk.pop();
  }
  sk.pop();
}

function drawTcrt50003D(sk: Sketch): void {
  sk.push();
  sk.translate(0, 4, 0);
  sk.fill(10, 10, 10);
  sk.noStroke();
  sk.box(100, 8, 50);

  sk.push();
  sk.translate(-22, 8, 0);
  sk.fill(255, 0, 0);
  sk.sphere(8);
  sk.pop();

  sk.push();
  sk.translate(22, 8, 0);
  sk.fill(120, 120, 120);
  sk.sphere(8);
  sk.pop();
  sk.pop();
}

function drawDcMotor3D(sk: Sketch): void {
  sk.push();
  sk.fill(100, 100, 100);
  sk.noStroke();
  sk.rotateX(90);
  sk.cylinder(45, 30);

  sk.push();
  sk.translate(0, 0, 20);
  sk.fill(192, 192, 192);
  sk.cylinder(4, 20);
  sk.pop();
  sk.pop();
}

function drawBatteryHolder3D(sk: Sketch): void {
  sk.push();
  sk.translate(0, 10, 0);
  sk.fill(45, 45, 45);
  sk.noStroke();
  sk.box(100, 20, 40);
  sk.pop();
}

function drawUsbB3D(sk: Sketch): void {
  sk.push();
  sk.translate(0, 7.5, 0);
  sk.fill(15, 15, 15);
  sk.noStroke();
  sk.box(40, 15, 20);

  sk.push();
  sk.translate(22, 0, 0);
  sk.fill(180, 180, 185);
  sk.box(15, 10, 10);
  sk.pop();
  sk.pop();
}

function drawWheel653D(sk: Sketch): void {
  sk.push();
  sk.fill(20, 20, 20);
  sk.noStroke();
  sk.rotateX(90);
  sk.cylinder(32, 10);

  sk.push();
  sk.translate(0, 0, 0.5);
  sk.fill(140, 140, 140);
  sk.cylinder(12, 11);
  sk.pop();
  sk.pop();
}

function drawCasterWheel3D(sk: Sketch): void {
  sk.push();
  sk.fill(140, 140, 140);
  sk.noStroke();
  sk.sphere(18);

  sk.push();
  sk.translate(0, -18, 0);
  sk.fill(192, 192, 192);
  sk.cylinder(4, 20);
  sk.pop();

  sk.push();
  sk.translate(0, -28, 0);
  sk.fill(255);
  sk.sphere(4);
  sk.pop();
  sk.pop();
}

function drawChassis3D(sk: Sketch): void {
  sk.push();
  sk.translate(0, 2, 0);
  sk.fill(200, 220, 255, 150);
  sk.noStroke();
  sk.box(160, 4, 220);
  sk.pop();
}

function drawNucleo3D(sk: Sketch): void {
  sk.push();
  sk.translate(0, 5, 0);
  sk.fill(30, 90, 180);
  sk.noStroke();
  sk.box(170, 10, 100);
  sk.pop();
}

function drawLidar3D(sk: Sketch): void {
  sk.push();
  sk.fill(15, 15, 15);
  sk.noStroke();
  sk.cylinder(30, 20);

  sk.push();
  sk.rotateY((sk.frameCount * 6) % 360);
  sk.translate(0, 11, 0);
  sk.fill(255, 0, 0);
  sk.cylinder(10, 22);
  sk.pop();
  sk.pop();
}

function drawServo3D(sk: Sketch): void {
  const angle = Math.sin(sk.frameCount * 0.04) * 35;
  sk.push();
  sk.translate(0, 12.5, 0);
  sk.fill(40, 80, 200);
  sk.noStroke();
  sk.box(40, 25, 35);

  sk.push();
  sk.translate(0, -17.5, 0);
  sk.rotateZ(angle);
  sk.fill(240, 240, 240);
  sk.box(30, 5, 8);
  sk.pop();
  sk.pop();
}

function drawRfLink3D(sk: Sketch): void {
  sk.push();
  sk.translate(0, 3, 0);
  sk.fill(20, 80, 20);
  sk.noStroke();
  sk.box(50, 6, 30);

  sk.stroke(210, 210, 210);
  sk.strokeWeight(2);
  sk.line(20, 3, 10, 35, 38, 10);
  sk.noStroke();
  sk.push();
  sk.translate(38, 10, 10);
  sk.fill(220, 220, 220);
  sk.sphere(3);
  sk.pop();
  sk.pop();
}

function drawFallback3D(sk: Sketch): void {
  sk.push();
  sk.translate(0, 15, 0);
  sk.fill(70, 70, 70);
  sk.noStroke();
  sk.box(80, 30, 60);
  sk.pop();
}

/** Altura base del modelo (para posicionar etiquetas y puertos). */
export function kit3DBaseHeight(kitId: string): number {
  switch (kitId) {
    case 'arduino-uno-r3':
      return 18;
    case 'l298n':
      return 22;
    case 'tcrt5000':
      return 16;
    case 'dc-motor':
    case 'motores-dc':
    case 'motor-dc-gear-6v':
      return 50;
    case 'battery-holder-4aa':
      return 20;
    case 'usb-b':
      return 15;
    case 'wheel-65mm':
      return 12;
    case 'caster-wheel':
      return 40;
    case 'acrylic-chassis':
      return 4;
    case 'nucleo-rx1':
      return 10;
    case 'lidar-v2':
      return 32;
    case 'servo-ht90':
      return 35;
    case 'rf-link':
      return 6;
    default:
      return 30;
  }
}

export function drawKitModel3D(sk: Sketch, kitId: string): void {
  sk.push();
  sk.angleMode(sk.DEGREES);
  sk.noStroke();

  switch (kitId) {
    case 'arduino-uno-r3':
      drawArduino3D(sk);
      break;
    case 'l298n':
      drawL298n3D(sk);
      break;
    case 'tcrt5000':
      drawTcrt50003D(sk);
      break;
    case 'dc-motor':
    case 'motores-dc':
    case 'motor-dc-gear-6v':
      drawDcMotor3D(sk);
      break;
    case 'battery-holder-4aa':
    case 'battery':
    case 'bateria':
      drawBatteryHolder3D(sk);
      break;
    case 'usb-b':
      drawUsbB3D(sk);
      break;
    case 'wheel-65mm':
      drawWheel653D(sk);
      break;
    case 'caster-wheel':
      drawCasterWheel3D(sk);
      break;
    case 'acrylic-chassis':
      drawChassis3D(sk);
      break;
    case 'nucleo-rx1':
      drawNucleo3D(sk);
      break;
    case 'lidar-v2':
      drawLidar3D(sk);
      break;
    case 'servo-ht90':
      drawServo3D(sk);
      break;
    case 'rf-link':
      drawRfLink3D(sk);
      break;
    default:
      drawFallback3D(sk);
  }

  sk.pop();
}

function cablePoint(
  from: Vec3,
  to: Vec3,
  ctrl: Vec3,
  t: number
): Vec3 {
  const u = 1 - t;
  return {
    x: u * u * from.x + 2 * u * t * ctrl.x + t * t * to.x,
    y: u * u * from.y + 2 * u * t * ctrl.y + t * t * to.y,
    z: u * u * from.z + 2 * u * t * ctrl.z + t * t * to.z
  };
}

function drawCableSegment(sk: Sketch, a: Vec3, b: Vec3, radius: number): void {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const dz = b.z - a.z;
  const len = Math.hypot(dx, dy, dz);
  if (len < 0.5) return;

  sk.push();
  sk.translate((a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2);
  sk.fill(255, 180, 168);
  sk.noStroke();

  const rotY = (Math.atan2(dx, dz) * 180) / Math.PI;
  const rotX = (-Math.atan2(dy, Math.hypot(dx, dz)) * 180) / Math.PI;
  sk.rotateY(rotY);
  sk.rotateX(rotX);
  sk.cylinder(radius, len);
  sk.pop();
}

/** Cable curvo en el plano XZ entre dos posiciones 3D. */
export function drawCable3D(sk: Sketch, from: Vec3, to: Vec3): void {
  const ctrl: Vec3 = {
    x: (from.x + to.x) / 2,
    y: Math.max(from.y, to.y) + 28,
    z: (from.z + to.z) / 2
  };

  const steps = 14;
  let prev = from;
  for (let i = 1; i <= steps; i++) {
    const p = cablePoint(from, to, ctrl, i / steps);
    drawCableSegment(sk, prev, p, 1.1);
    prev = p;
  }
}

export function isMotorKitId(kitId: string): boolean {
  return MOTOR_IDS.has(kitId);
}
