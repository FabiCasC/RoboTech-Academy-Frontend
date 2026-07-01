import type p5 from 'p5';

type Sketch = InstanceType<typeof p5>;

export interface KitModelSize {
  w: number;
  h: number;
}

export interface DrawKitModelOptions {
  servoAngle?: number;
}

function drawArduino(sk: Sketch): void {
  const W = 160;
  const H = 220;
  const hw = W / 2;
  const hh = H / 2;

  sk.noStroke();
  sk.fill(34, 139, 34);
  sk.rect(-hw, -hh, W, H, 3);

  sk.fill(255);
  sk.textSize(10);
  sk.textAlign(sk.CENTER, sk.CENTER);
  sk.text('ARDUINO UNO R3', 0, -hh + 14);

  sk.fill(192, 192, 192);
  sk.rect(-hw + 8, -hh + 8, 30, 20, 2);

  sk.fill(0);
  sk.rect(-25, -25, 50, 50, 2);

  sk.fill(255);
  sk.textSize(8);
  sk.text('ATmega328P', 0, 2);

  sk.stroke(0);
  sk.strokeWeight(2);
  const pinTop = -hh + 36;
  const pinBottom = hh - 28;
  const pinStep = (pinBottom - pinTop) / 13;
  for (let i = 0; i < 14; i++) {
    const y = pinTop + i * pinStep;
    sk.line(hw - 2, y, hw - 12, y);
  }

  const aLeft = -42;
  for (let i = 0; i < 6; i++) {
    const x = aLeft + i * 14;
    sk.line(x, hh - 2, x, hh - 12);
  }
  sk.noStroke();
}

function drawUsbB(sk: Sketch): void {
  const W = 60;
  const H = 28;
  const hw = W / 2;
  const hh = H / 2;

  sk.fill(255);
  sk.textSize(7);
  sk.textAlign(sk.CENTER, sk.BOTTOM);
  sk.noStroke();
  sk.text('USB-B', 0, -hh - 4);

  sk.stroke(20, 20, 20);
  sk.strokeWeight(2);
  sk.line(-hw - 20, 0, -hw, 0);

  sk.noStroke();
  sk.fill(20, 20, 20);
  sk.rect(-hw, -hh, W, H, 2);

  sk.fill(192, 192, 192);
  sk.beginShape();
  sk.vertex(hw - 2, -hh + 5);
  sk.vertex(hw + 18, -hh + 2);
  sk.vertex(hw + 18, hh - 2);
  sk.vertex(hw - 2, hh - 5);
  sk.endShape(sk.CLOSE);
}

function drawMotorDcGear6v(sk: Sketch): void {
  const bodyW = 70;
  const bodyH = 50;
  const motorR = 22;
  const motorCx = 13 + motorR;

  sk.fill(255);
  sk.textSize(7);
  sk.textAlign(sk.CENTER, sk.BOTTOM);
  sk.noStroke();
  sk.text('DC + REDUCTORA', 0, -motorR - 6);

  sk.fill(80, 80, 80);
  sk.rect(-57, -bodyH / 2, bodyW, bodyH, 2);

  sk.fill(120, 120, 120);
  sk.circle(motorCx, 0, motorR * 2);

  sk.fill(192, 192, 192);
  sk.rect(motorCx + motorR - 2, -3, 14, 6, 1);

  sk.fill(20, 20, 20);
  sk.rect(-65, -10, 8, 6, 1);
  sk.rect(-65, 4, 8, 6, 1);
}

function drawWheel65(sk: Sketch): void {
  const R = 32;

  sk.noStroke();
  sk.fill(20, 20, 20);
  sk.circle(0, 0, R * 2);

  sk.fill(140, 140, 140);
  sk.circle(0, 0, 40);

  sk.fill(192, 192, 192);
  sk.circle(0, 0, 16);

  sk.stroke(120, 120, 120);
  sk.strokeWeight(1.5);
  for (let i = 0; i < 4; i++) {
    sk.push();
    sk.rotate(i * 45);
    sk.line(0, 0, 18, 0);
    sk.pop();
  }

  sk.noStroke();
  sk.fill(255);
  sk.textSize(7);
  sk.textAlign(sk.CENTER, sk.TOP);
  sk.text('65MM', 0, R + 4);
}

function drawAcrylicChassis(sk: Sketch): void {
  const W = 160;
  const H = 220;
  const hw = W / 2;
  const hh = H / 2;

  sk.fill(255);
  sk.textSize(8);
  sk.textAlign(sk.CENTER, sk.BOTTOM);
  sk.noStroke();
  sk.text('CHASIS ACRÍLICO', 0, -hh - 4);

  sk.fill(180, 210, 240, 60);
  sk.stroke(150, 200, 255);
  sk.strokeWeight(1.5);
  sk.rect(-hw, -hh, W, H, 4);

  const ctx = sk.drawingContext as CanvasRenderingContext2D;
  ctx.setLineDash([4, 4]);
  sk.noFill();
  sk.stroke(200, 220, 255, 140);
  sk.rect(-50, -80, 100, 160, 2);
  ctx.setLineDash([]);

  const holes: [number, number][] = [
    [-hw + 12, -hh + 12],
    [hw - 12, -hh + 12],
    [-hw + 12, hh - 12],
    [hw - 12, hh - 12],
    [0, -hh + 12],
    [0, hh - 12]
  ];
  for (const [hx, hy] of holes) {
    sk.noFill();
    sk.stroke(255, 255, 255, 180);
    sk.strokeWeight(1);
    sk.circle(hx, hy, 12);
  }
  sk.noStroke();
}

function drawCasterWheel(sk: Sketch): void {
  sk.fill(255);
  sk.textSize(7);
  sk.textAlign(sk.CENTER, sk.BOTTOM);
  sk.noStroke();
  sk.text('CASTER', 0, -38);

  sk.fill(180, 180, 180);
  sk.rect(-5, -24, 10, 24, 1);

  sk.fill(255);
  sk.circle(0, -24, 8);

  sk.fill(120, 120, 120);
  sk.circle(0, 8, 32);
}

function drawBatteryHolder4aa(sk: Sketch): void {
  const W = 110;
  const H = 44;
  const hw = W / 2;
  const hh = H / 2;

  sk.fill(255);
  sk.textSize(8);
  sk.textAlign(sk.CENTER, sk.BOTTOM);
  sk.noStroke();
  sk.text('4×AA  6V', 0, -hh - 6);

  sk.fill(50, 50, 50);
  sk.rect(-hw, -hh, W, H, 3);

  const slotW = 18;
  const gap = (W - 4 * slotW) / 5;
  sk.fill(80, 80, 80);
  for (let i = 0; i < 4; i++) {
    const x = -hw + gap + i * (slotW + gap);
    sk.rect(x, -hh + 6, slotW, 32, 6);
  }

  sk.fill(220, 40, 40);
  sk.rect(-hw - 8, -6, 8, 12, 1);
  sk.fill(30, 30, 30);
  sk.rect(hw, -6, 8, 12, 1);
}

function drawL298n(sk: Sketch): void {
  const W = 140;
  const H = 100;
  const hw = W / 2;
  const hh = H / 2;

  sk.noStroke();
  sk.fill(30, 30, 120);
  sk.rect(-hw, -hh, W, H, 3);

  sk.fill(255);
  sk.textSize(9);
  sk.textAlign(sk.CENTER, sk.CENTER);
  sk.text('MOTOR DRIVER', 0, -hh + 12);

  sk.fill(0);
  sk.rect(-30, -20, 60, 40, 2);
  sk.fill(255);
  sk.textSize(10);
  sk.text('L298N', 0, 0);

  sk.fill(140, 140, 140);
  const outW = 18;
  const outH = 10;
  const outGap = (W - 4 * outW) / 5;
  for (let i = 0; i < 4; i++) {
    const x = -hw + outGap + i * (outW + outGap);
    sk.rect(x, hh - outH - 4, outW, outH, 1);
  }
}

function drawTcrt5000(sk: Sketch): void {
  const W = 100;
  const H = 50;
  const hw = W / 2;
  const hh = H / 2;

  sk.noStroke();
  sk.fill(0);
  sk.rect(-hw, -hh, W, H, 2);

  sk.fill(255);
  sk.textSize(7);
  sk.textAlign(sk.CENTER, sk.CENTER);
  sk.text('TCRT5000', 0, -hh + 9);

  sk.fill(255, 0, 0);
  sk.circle(-22, 4, 16);

  sk.fill(120, 120, 120);
  sk.circle(22, 4, 16);
  sk.fill(80, 80, 80);
  sk.circle(22, 4, 9);
}

function drawNucleoRx1(sk: Sketch): void {
  const W = 180;
  const H = 100;
  const hw = W / 2;
  const hh = H / 2;

  sk.fill(255);
  sk.textSize(9);
  sk.textAlign(sk.CENTER, sk.BOTTOM);
  sk.noStroke();
  sk.text('NUCLEO-RX1', 0, -hh - 4);

  sk.fill(30, 90, 180);
  sk.rect(-hw, -hh, W, H, 3);

  sk.fill(0);
  sk.rect(-35, -20, 70, 40, 2);
  sk.fill(255);
  sk.textSize(8);
  sk.textAlign(sk.CENTER, sk.CENTER);
  sk.text('STM32', 0, 0);

  sk.stroke(30, 30, 30);
  sk.strokeWeight(2);
  for (let i = 0; i < 8; i++) {
    const x = -56 + i * 16;
    sk.line(x, -hh + 2, x, -hh + 10);
    sk.line(x, hh - 10, x, hh - 2);
  }
  sk.noStroke();

  sk.fill(192, 192, 192);
  sk.rect(hw - 18, -8, 14, 16, 2);
}

function drawLidarV2(sk: Sketch): void {
  const R = 34;

  sk.noStroke();
  sk.fill(15, 15, 15);
  sk.circle(0, 0, R * 2);

  sk.fill(80, 80, 80);
  sk.circle(0, 0, 44);

  sk.fill(255, 50, 50);
  sk.circle(0, 0, 8);

  const base = sk.frameCount * 4;
  sk.stroke(255, 0, 0);
  sk.strokeWeight(2);
  for (let i = 0; i < 4; i++) {
    const ang = base + i * 90;
    sk.push();
    sk.rotate(ang);
    sk.line(0, 0, R - 8, 0);
    sk.pop();
  }
  sk.noStroke();

  sk.fill(255);
  sk.textSize(7);
  sk.textAlign(sk.CENTER, sk.TOP);
  sk.text('LIDAR V2', 0, R + 4);
}

function drawServoHt90(sk: Sketch, angle = 30): void {
  const W = 44;
  const H = 38;
  const hw = W / 2;
  const hh = H / 2;

  sk.noStroke();
  sk.fill(30, 80, 200);
  sk.rect(-hw, -hh + 8, W, H, 2);

  sk.fill(140, 140, 140);
  sk.circle(0, -hh + 8, 20);

  sk.push();
  sk.translate(0, -hh + 8);
  sk.rotate(angle);
  sk.fill(255);
  sk.rect(-14, -3, 28, 6, 1);
  sk.pop();

  sk.strokeWeight(3);
  sk.stroke(255, 140, 0);
  sk.line(-8, hh - 2, -8, hh + 10);
  sk.stroke(255, 0, 0);
  sk.line(0, hh - 2, 0, hh + 10);
  sk.stroke(139, 69, 19);
  sk.line(8, hh - 2, 8, hh + 10);
  sk.noStroke();

  sk.fill(255);
  sk.textSize(8);
  sk.textAlign(sk.CENTER, sk.CENTER);
  sk.text('SG-90', 0, 4);
}

function drawRfLink(sk: Sketch): void {
  const W = 54;
  const H = 34;
  const hw = W / 2;
  const hh = H / 2;

  sk.fill(255);
  sk.textSize(7);
  sk.textAlign(sk.CENTER, sk.BOTTOM);
  sk.noStroke();
  sk.text('RF 433MHz', 0, -hh - 4);

  sk.fill(20, 100, 30);
  sk.rect(-hw, -hh, W, H, 2);

  sk.fill(0);
  sk.circle(0, 0, 14);

  sk.fill(218, 165, 32);
  for (let i = 0; i < 4; i++) {
    sk.rect(-hw - 4, -hh + 6 + i * 7, 4, 5, 1);
  }

  sk.stroke(255);
  sk.strokeWeight(2);
  sk.line(hw - 4, -hh + 4, hw + 14, -hh - 14);
  sk.noStroke();
  sk.fill(255);
  sk.circle(hw + 14, -hh - 14, 6);
}

function drawFallback(sk: Sketch, kitId: string): void {
  const W = 100;
  const H = 60;
  const hw = W / 2;
  const hh = H / 2;

  sk.noStroke();
  sk.fill(70, 70, 70);
  sk.rect(-hw, -hh, W, H, 3);

  sk.fill(200, 200, 200);
  sk.textSize(8);
  sk.textAlign(sk.CENTER, sk.CENTER);
  sk.text(kitId.slice(0, 18).toUpperCase(), 0, 0);
}

export function kitModelSize(kitId: string): KitModelSize {
  switch (kitId) {
    case 'arduino-uno-r3':
      return { w: 160, h: 220 };
    case 'usb-b':
      return { w: 80, h: 40 };
    case 'motor-dc-gear-6v':
    case 'dc-motor':
    case 'motores-dc':
      return { w: 110, h: 70 };
    case 'wheel-65mm':
      return { w: 70, h: 70 };
    case 'l298n':
      return { w: 140, h: 100 };
    case 'tcrt5000':
      return { w: 100, h: 50 };
    case 'acrylic-chassis':
      return { w: 160, h: 220 };
    case 'caster-wheel':
      return { w: 40, h: 70 };
    case 'battery-holder-4aa':
      return { w: 120, h: 56 };
    case 'battery':
    case 'bateria':
      return { w: 90, h: 55 };
    case 'nucleo-rx1':
      return { w: 180, h: 100 };
    case 'lidar-v2':
      return { w: 70, h: 70 };
    case 'servo-ht90':
      return { w: 60, h: 60 };
    case 'rf-link':
      return { w: 70, h: 50 };
    default:
      return { w: 100, h: 60 };
  }
}

/**
 * Dibuja el componente centrado en (0, 0) sin fondo.
 * El contenedor (tarjeta o viewer) aplica posición y escala.
 */
export function drawKitModel(sk: Sketch, kitId: string, options?: DrawKitModelOptions): void {
  sk.push();
  sk.angleMode(sk.DEGREES);

  switch (kitId) {
    case 'arduino-uno-r3':
      drawArduino(sk);
      break;
    case 'usb-b':
      drawUsbB(sk);
      break;
    case 'wheel-65mm':
      drawWheel65(sk);
      break;
    case 'acrylic-chassis':
      drawAcrylicChassis(sk);
      break;
    case 'caster-wheel':
      drawCasterWheel(sk);
      break;
    case 'l298n':
      drawL298n(sk);
      break;
    case 'tcrt5000':
      drawTcrt5000(sk);
      break;
    case 'dc-motor':
    case 'motores-dc':
    case 'motor-dc-gear-6v':
      drawMotorDcGear6v(sk);
      break;
    case 'battery-holder-4aa':
      drawBatteryHolder4aa(sk);
      break;
    case 'nucleo-rx1':
      drawNucleoRx1(sk);
      break;
    case 'lidar-v2':
      drawLidarV2(sk);
      break;
    case 'servo-ht90':
      drawServoHt90(sk, options?.servoAngle ?? 30);
      break;
    case 'rf-link':
      drawRfLink(sk);
      break;
    case 'battery':
    case 'bateria':
      drawBatteryHolder4aa(sk);
      break;
    default:
      drawFallback(sk, kitId);
  }

  sk.pop();
}
