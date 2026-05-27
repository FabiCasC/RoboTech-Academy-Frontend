import type p5 from 'p5';

type Sketch = InstanceType<typeof p5>;

function box(sk: Sketch, w: number, h: number, d: number): void {
  sk.box(w, h, d);
}

function board(sk: Sketch, w: number, h: number, d: number, color: [number, number, number]): void {
  sk.push();
  sk.fill(...color);
  sk.noStroke();
  box(sk, w, d, h);
  sk.pop();
}

export function drawKitModel(sk: Sketch, kitId: string): void {
  sk.noStroke();

  if (kitId === 'arduino-uno-r3') {
    board(sk, 140, 85, 9, [20, 107, 58]);
    sk.push();
    sk.fill(179, 179, 179);
    sk.translate(52, 8, 10);
    box(sk, 28, 14, 25);
    sk.pop();
    sk.push();
    sk.fill(26, 26, 26);
    sk.translate(-5, 6, 36);
    box(sk, 110, 8, 9);
    sk.translate(0, 0, -72);
    box(sk, 110, 8, 9);
    sk.pop();
    sk.push();
    sk.fill(32, 32, 32);
    sk.translate(5, 6, 0);
    box(sk, 28, 6, 22);
    sk.pop();
    return;
  }

  if (kitId === 'l298n') {
    board(sk, 130, 100, 9, [143, 27, 27]);
    sk.push();
    sk.fill(43, 43, 43);
    sk.translate(-10, 15, 0);
    box(sk, 35, 21, 45);
    sk.pop();
    sk.push();
    sk.fill(31, 79, 42);
    sk.translate(48, 9, 0);
    box(sk, 25, 11, 70);
    sk.pop();
    return;
  }

  if (kitId === 'tcrt5000') {
    board(sk, 65, 28, 6, [16, 16, 16]);
    sk.push();
    sk.fill(34, 34, 34);
    sk.translate(-12, 6, 0);
    sk.rotateX(sk.HALF_PI);
    sk.cylinder(6, 8, 12);
    sk.pop();
    sk.push();
    sk.fill(43, 43, 43);
    sk.translate(12, 6, 0);
    sk.rotateX(sk.HALF_PI);
    sk.cylinder(6, 8, 12);
    sk.pop();
    return;
  }

  if (kitId === 'motor-dc-gear-6v') {
    sk.push();
    sk.fill(167, 167, 167);
    sk.translate(-10, 12, 0);
    sk.rotateZ(sk.HALF_PI);
    sk.cylinder(18, 50, 20);
    sk.pop();
    sk.push();
    sk.fill(214, 194, 74);
    sk.translate(22, 12, 0);
    box(sk, 28, 22, 28);
    sk.pop();
    sk.push();
    sk.fill(207, 207, 207);
    sk.translate(42, 12, 0);
    sk.rotateZ(sk.HALF_PI);
    sk.cylinder(3, 20, 10);
    sk.pop();
    return;
  }

  if (kitId === 'wheel-65mm') {
    sk.push();
    sk.fill(26, 26, 26);
    sk.rotateX(sk.HALF_PI);
    sk.torus(28, 7, 12, 24);
    sk.pop();
    sk.push();
    sk.fill(208, 208, 208);
    sk.rotateX(sk.HALF_PI);
    sk.cylinder(12, 11, 16);
    sk.pop();
    return;
  }

  if (kitId === 'acrylic-chassis') {
    sk.push();
    sk.fill(32, 32, 32);
    sk.translate(0, 2, 0);
    box(sk, 150, 4, 105);
    sk.pop();
    sk.push();
    sk.fill(169, 169, 169);
    const offsets: [number, number][] = [
      [55, 40],
      [-55, 40],
      [55, -40],
      [-55, -40]
    ];
    for (const [x, z] of offsets) {
      sk.push();
      sk.translate(x, 8, z);
      sk.cylinder(3, 11, 8);
      sk.pop();
    }
    return;
  }

  if (kitId === 'caster-wheel') {
    sk.push();
    sk.fill(20, 20, 20);
    sk.translate(0, 9, 0);
    sk.sphere(11);
    sk.pop();
    sk.push();
    sk.fill(176, 176, 176);
    sk.translate(0, 16, 0);
    sk.cylinder(9, 2, 12);
    sk.pop();
    return;
  }

  if (kitId === 'battery-holder-4aa') {
    sk.push();
    sk.fill(37, 37, 37);
    sk.translate(0, 11, 0);
    box(sk, 105, 28, 50);
    sk.pop();
    sk.push();
    sk.fill(177, 22, 22);
    sk.translate(52, 20, 12);
    box(sk, 6, 6, 12);
    sk.pop();
    sk.push();
    sk.fill(16, 16, 16);
    sk.translate(52, 20, -12);
    box(sk, 6, 6, 12);
    sk.pop();
    return;
  }

  if (kitId === 'usb-b') {
    sk.push();
    sk.fill(26, 26, 26);
    sk.rotateX(sk.HALF_PI);
    sk.cylinder(5, 100, 12);
    sk.pop();
    sk.push();
    sk.fill(179, 179, 179);
    sk.translate(48, 6, 0);
    box(sk, 22, 14, 18);
    sk.pop();
    return;
  }

  if (kitId === 'nucleo-rx1') {
    board(sk, 120, 70, 8, [0, 90, 160]);
    sk.push();
    sk.fill(40, 40, 40);
    sk.translate(0, 5, 0);
    box(sk, 40, 6, 30);
    sk.pop();
    return;
  }

  if (kitId === 'lidar-v2') {
    sk.push();
    sk.fill(50, 50, 50);
    sk.cylinder(22, 12, 24);
    sk.pop();
    sk.push();
    sk.fill(255, 60, 60);
    sk.translate(0, 14, 0);
    sk.cylinder(8, 4, 12);
    sk.pop();
    return;
  }

  if (kitId === 'servo-ht90') {
    sk.push();
    sk.fill(240, 200, 40);
    sk.box(42, 22, 20);
    sk.pop();
    sk.push();
    sk.fill(30, 30, 30);
    sk.translate(26, -4, 0);
    sk.box(14, 8, 14);
    sk.pop();
    return;
  }

  if (kitId === 'rf-link') {
    board(sk, 80, 50, 6, [30, 30, 90]);
    sk.push();
    sk.fill(180, 180, 180);
    sk.translate(0, 8, 0);
    sk.cylinder(2, 30, 6);
    sk.pop();
    return;
  }

  board(sk, 100, 60, 9, [42, 42, 42]);
}
