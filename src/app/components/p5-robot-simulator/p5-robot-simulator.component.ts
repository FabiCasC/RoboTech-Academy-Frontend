import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  PLATFORM_ID,
  SimpleChanges,
  ViewChild,
  inject,
  signal
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import type p5 from 'p5';
import type { Lab2dConnection } from '../p5-lab2d-canvas/p5-lab2d-canvas.component';

type Sketch = InstanceType<typeof p5>;

const CANVAS_W = 800;
const CANVAS_H = 600;
const TRACK_CX = 400;
const TRACK_CY = 300;
const TRACK_RX = 260;
const TRACK_RY = 180;
const LINE_W = 20;
const BLACK_THRESHOLD = 100;

interface RobotState {
  x: number;
  y: number;
  angle: number;
  vel: number;
  omega: number;
}

@Component({
  selector: 'app-p5-robot-simulator',
  standalone: true,
  templateUrl: './p5-robot-simulator.component.html',
  styleUrl: './p5-robot-simulator.component.css'
})
export class P5RobotSimulatorComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() approvalToken: string | null = null;
  @Input() firmwareCode = '';
  @Input() connections: Lab2dConnection[] = [];

  @ViewChild('host', { static: true }) hostRef!: ElementRef<HTMLDivElement>;

  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  private sketch?: p5;
  private trackGfx?: p5.Graphics;
  private robot: RobotState = { x: 0, y: 0, angle: 0, vel: 0, omega: 0 };
  private startRobot: RobotState = { x: 0, y: 0, angle: 0, vel: 0, omega: 0 };
  private lapAngle = 0;
  private prevCenterAngle = 0;
  private running = false;

  readonly lapCount = signal(0);
  readonly velocity = signal(0);
  readonly heading = signal(0);
  readonly leftSensorState = signal<'NEGRO' | 'BLANCO'>('BLANCO');
  readonly rightSensorState = signal<'NEGRO' | 'BLANCO'>('BLANCO');

  ngAfterViewInit(): void {
    if (!this.isBrowser || !this.approvalToken) return;
    void this.mountSketch();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.isBrowser) return;
    if (changes['approvalToken']) {
      if (this.approvalToken) {
        if (!this.sketch) void this.mountSketch();
      } else {
        this.destroySketch();
      }
    }
  }

  ngOnDestroy(): void {
    this.destroySketch();
  }

  start(): void {
    this.running = true;
    this.sketch?.loop();
  }

  pause(): void {
    this.running = false;
    this.sketch?.noLoop();
  }

  reset(): void {
    this.robot = { ...this.startRobot, vel: 0, omega: 0 };
    this.lapAngle = 0;
    this.prevCenterAngle = Math.atan2(
      this.startRobot.y - TRACK_CY,
      this.startRobot.x - TRACK_CX
    );
    this.lapCount.set(0);
    this.velocity.set(0);
    this.heading.set(this.startRobot.angle);
    this.leftSensorState.set('BLANCO');
    this.rightSensorState.set('BLANCO');
    this.sketch?.redraw();
  }

  private destroySketch(): void {
    this.sketch?.remove();
    this.sketch = undefined;
    this.trackGfx = undefined;
  }

  private async mountSketch(): Promise<void> {
    this.destroySketch();
    const { default: P5 } = await import('p5');
    const host = this.hostRef.nativeElement;
    const self = this;

    this.sketch = new P5((sk: Sketch) => {
      sk.setup = () => {
        const canvas = sk.createCanvas(CANVAS_W, CANVAS_H);
        canvas.parent(host);
        sk.angleMode(sk.DEGREES);
        sk.noLoop();

        self.trackGfx = sk.createGraphics(CANVAS_W, CANVAS_H);
        self.drawTrack(self.trackGfx);
        self.initRobotPose();
        self.reset();
      };

      sk.draw = () => {
        if (!self.trackGfx) return;
        sk.image(self.trackGfx, 0, 0);
        self.stepRobot(sk);
        self.drawRobot(sk);
      };
    });
  }

  private initRobotPose(): void {
    this.startRobot = {
      x: TRACK_CX + TRACK_RX,
      y: TRACK_CY,
      angle: -90,
      vel: 0,
      omega: 0
    };
  }

  private drawTrack(gfx: p5.Graphics): void {
    gfx.background(255);
    gfx.noFill();
    gfx.stroke(0);
    gfx.strokeWeight(LINE_W);
    gfx.strokeCap(gfx.ROUND);
    gfx.strokeJoin(gfx.ROUND);

    gfx.beginShape();
    gfx.vertex(TRACK_CX + TRACK_RX, TRACK_CY);
    gfx.bezierVertex(
      TRACK_CX + TRACK_RX,
      TRACK_CY - TRACK_RY * 1.15,
      TRACK_CX - TRACK_RX,
      TRACK_CY - TRACK_RY * 1.15,
      TRACK_CX - TRACK_RX,
      TRACK_CY
    );
    gfx.bezierVertex(
      TRACK_CX - TRACK_RX,
      TRACK_CY + TRACK_RY * 1.15,
      TRACK_CX + TRACK_RX,
      TRACK_CY + TRACK_RY * 1.15,
      TRACK_CX + TRACK_RX,
      TRACK_CY
    );
    gfx.endShape(gfx.CLOSE);
  }

  private isBlackAt(gfx: p5.Graphics, x: number, y: number): boolean {
    const ix = Math.round(x);
    const iy = Math.round(y);
    if (ix < 0 || iy < 0 || ix >= CANVAS_W || iy >= CANVAS_H) return false;
    gfx.loadPixels();
    const idx = (iy * CANVAS_W + ix) * 4;
    const r = gfx.pixels[idx];
    return r < BLACK_THRESHOLD;
  }

  private sensorWorldPos(side: 'left' | 'right'): { x: number; y: number } {
    const rad = (this.robot.angle * Math.PI) / 180;
    const fx = Math.cos(rad);
    const fy = Math.sin(rad);
    const px = -Math.sin(rad);
    const py = Math.cos(rad);
    const forward = 22;
    const lateral = side === 'left' ? -10 : 10;
    return {
      x: this.robot.x + forward * fx + lateral * px,
      y: this.robot.y + forward * fy + lateral * py
    };
  }

  private stepRobot(_sk: Sketch): void {
    if (!this.trackGfx || !this.running) return;

    const left = this.sensorWorldPos('left');
    const right = this.sensorWorldPos('right');
    const leftBlack = this.isBlackAt(this.trackGfx, left.x, left.y);
    const rightBlack = this.isBlackAt(this.trackGfx, right.x, right.y);

    this.leftSensorState.set(leftBlack ? 'NEGRO' : 'BLANCO');
    this.rightSensorState.set(rightBlack ? 'NEGRO' : 'BLANCO');

    let vel = 0;
    let omega = 0;

    if (leftBlack && rightBlack) {
      vel = 3;
      omega = 0;
    } else if (leftBlack && !rightBlack) {
      vel = 1.5;
      omega = -2.5;
    } else if (!leftBlack && rightBlack) {
      vel = 1.5;
      omega = 2.5;
    } else {
      vel = 0;
      omega = 0;
    }

    this.robot.vel = vel;
    this.robot.omega = omega;

    const rad = (this.robot.angle * Math.PI) / 180;
    this.robot.x += vel * Math.cos(rad);
    this.robot.y += vel * Math.sin(rad);
    this.robot.angle += omega;

    this.velocity.set(vel);
    this.heading.set(Math.round(this.robot.angle));

    this.updateLapCount();

    void this.firmwareCode;
    void this.connections;
    void this.approvalToken;
  }

  private updateLapCount(): void {
    const centerAngle = Math.atan2(this.robot.y - TRACK_CY, this.robot.x - TRACK_CX);
    let delta = centerAngle - this.prevCenterAngle;
    if (delta > Math.PI) delta -= Math.PI * 2;
    if (delta < -Math.PI) delta += Math.PI * 2;
    this.lapAngle += delta;
    this.prevCenterAngle = centerAngle;

    const laps = Math.floor(this.lapAngle / (Math.PI * 2));
    if (laps > this.lapCount()) {
      this.lapCount.set(laps);
    }
  }

  private drawRobot(sk: Sketch): void {
    const left = this.sensorWorldPos('left');
    const right = this.sensorWorldPos('right');

    sk.push();
    sk.translate(this.robot.x, this.robot.y);
    sk.rotate(this.robot.angle);

    sk.noStroke();
    sk.fill(120, 120, 120);
    sk.rectMode(sk.CENTER);
    sk.rect(0, 0, 60, 40, 3);

    sk.fill(255, 0, 0);
    sk.circle(18, -10, 10);
    sk.circle(18, 10, 10);

    sk.pop();

    sk.push();
    sk.noFill();
    sk.stroke(255, 0, 0, 160);
    sk.strokeWeight(1);
    sk.circle(left.x, left.y, 8);
    sk.circle(right.x, right.y, 8);
    sk.pop();
  }
}
