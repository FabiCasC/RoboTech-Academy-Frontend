import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  PLATFORM_ID,
  ViewChild,
  inject
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import type p5 from 'p5';
import { drawKitModel } from '../p5-kit-viewer/p5-kit-models';

export interface LabSceneComponent {
  id: string;
  kitId: string;
  label: string;
  x: number;
  y: number;
}

@Component({
  selector: 'app-p5-lab-scene',
  standalone: true,
  template: '<div class="scene-host" #host></div>',
  styles: [
    `
      .scene-host {
        width: 100%;
        height: 100%;
      }
      .scene-host canvas {
        display: block;
        width: 100% !important;
        height: 100% !important;
      }
    `
  ]
})
export class P5LabSceneComponent implements AfterViewInit, OnDestroy {
  @Input() components: LabSceneComponent[] = [];
  @Input() selectedId: string | null = null;
  /** Cuando el backend aprueba el circuito (CircuitService) — animación más dinámica. */
  @Input() cinematicMode = false;

  @ViewChild('host', { static: true }) hostRef!: ElementRef<HTMLDivElement>;

  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  private p5Instance?: p5;
  private sceneRotation = 0;

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;
    void this.mountSketch();
  }

  ngOnDestroy(): void {
    this.p5Instance?.remove();
    this.p5Instance = undefined;
  }

  private async mountSketch(): Promise<void> {
    const p5Module = await import('p5');
    const P5 = p5Module.default;
    const host = this.hostRef.nativeElement;

    this.p5Instance = new P5((sk: p5) => {
      sk.setup = () => {
        const w = host.clientWidth || 640;
        const h = host.clientHeight || 480;
        const canvas = sk.createCanvas(w, h, sk.WEBGL);
        canvas.parent(host);
        sk.angleMode(sk.DEGREES);
      };

      sk.draw = () => {
        sk.background(8);
        sk.ambientLight(100, 100, 110);
        sk.directionalLight(255, 245, 240, 0.3, 0.9, -0.4);
        sk.directionalLight(255, 180, 168, -0.5, 0.3, 0.6);

        this.sceneRotation += this.cinematicMode ? 0.42 : 0.12;
        sk.push();
        sk.rotateX(-55);
        sk.rotateZ(this.sceneRotation * 0.15);

        this.drawGrid(sk);
        this.drawComponents(sk);

        sk.pop();
      };

      sk.windowResized = () => {
        const w = host.clientWidth || 640;
        const h = host.clientHeight || 480;
        sk.resizeCanvas(w, h);
      };
    });
  }

  private drawGrid(sk: p5): void {
    sk.push();
    sk.stroke(35, 35, 35);
    sk.strokeWeight(1);
    const size = 400;
    const step = 40;
    for (let i = -size; i <= size; i += step) {
      sk.line(i, 0, -size, i, 0, size);
      sk.line(-size, 0, i, size, 0, i);
    }
    sk.pop();
  }

  private drawComponents(sk: p5): void {
    const items = this.components;
    if (items.length === 0) {
      sk.push();
      sk.noStroke();
      sk.fill(80, 80, 80);
      sk.textAlign(sk.CENTER, sk.CENTER);
      sk.text('Agrega componentes desde la paleta', 0, 0);
      sk.pop();
      return;
    }

    const cx =
      items.reduce((sum, c) => sum + c.x, 0) / items.length;
    const cy =
      items.reduce((sum, c) => sum + c.y, 0) / items.length;

    for (const comp of items) {
      const isSelected = comp.id === this.selectedId;
      const px = (comp.x - cx) * 0.35;
      const pz = (comp.y - cy) * 0.35;

      sk.push();
      sk.translate(px, 0, pz);
      sk.scale(isSelected ? 0.42 : 0.35);

      if (isSelected) {
        sk.push();
        sk.noFill();
        sk.stroke(255, 180, 168);
        sk.strokeWeight(2);
        sk.box(180, 4, 120);
        sk.pop();
      }

      drawKitModel(sk, comp.kitId);
      sk.pop();
    }
  }
}
