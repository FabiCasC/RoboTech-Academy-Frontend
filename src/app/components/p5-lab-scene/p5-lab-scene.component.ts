import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  NgZone,
  OnDestroy,
  PLATFORM_ID,
  ViewChild,
  inject,
  signal
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import type p5 from 'p5';
import {
  drawCable3D,
  drawKitModel3D,
  kit3DBaseHeight,
  type Vec3
} from '../p5-kit-viewer/p5-kit-models-3d';
import { resolvePortSpec } from '../p5-kit-viewer/kit-compatibility';
import type {
  Lab2dComponent,
  Lab2dConnection
} from '../p5-lab2d-canvas/p5-lab2d-canvas.component';

export interface LabelOverlay {
  id: string;
  label: string;
  screenX: number;
  screenY: number;
  selected: boolean;
}

const LAYOUT_SCALE = 0.35;
const BASE_SCALE = 0.35;
const SELECT_SCALE = 0.42;

/** p5 WEBGL expone screenX/screenY en runtime; los tipos @types/p5 no los declaran. */
type P5WebglSketch = p5 & {
  screenX(x: number, y: number, z: number): number;
  screenY(x: number, y: number, z: number): number;
};

@Component({
  selector: 'app-p5-lab-scene',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="scene-wrap">
      <div class="scene-host" #host></div>
      @if (emptyHint()) {
        <p class="scene-empty">Agrega componentes desde la paleta</p>
      }
      @for (o of labelOverlays(); track o.id) {
        <div
          class="comp-label"
          [class.selected]="o.selected"
          [style.left.px]="o.screenX"
          [style.top.px]="o.screenY"
        >{{ o.label }}</div>
      }
    </div>
  `,
  styles: [
    `
      .scene-wrap {
        position: relative;
        width: 100%;
        height: 100%;
        overflow: hidden;
      }
      .scene-host {
        width: 100%;
        height: 100%;
      }
      .scene-host canvas {
        display: block;
        width: 100% !important;
        height: 100% !important;
      }
      .scene-empty {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        margin: 0;
        color: #888;
        font-family: 'Space Grotesk', monospace;
        font-size: 12px;
        letter-spacing: 0.6px;
        pointer-events: none;
      }
      .comp-label {
        position: absolute;
        transform: translate(-50%, -100%);
        margin-top: -8px;
        padding: 3px 8px;
        border-radius: 3px;
        background: rgba(8, 8, 8, 0.82);
        border: 1px solid #333;
        color: #ebbbb4;
        font-family: 'Space Grotesk', monospace;
        font-size: 10px;
        letter-spacing: 0.4px;
        white-space: nowrap;
        pointer-events: none;
        z-index: 5;
      }
      .comp-label.selected {
        border-color: #ff0000;
        color: #ffb4a8;
        box-shadow: 0 0 12px rgba(255, 0, 0, 0.25);
      }
    `
  ]
})
export class P5LabSceneComponent implements AfterViewInit, OnDestroy {
  @Input() components: Lab2dComponent[] = [];
  @Input() connections: Lab2dConnection[] = [];
  @Input() selectedId: string | null = null;
  @Input() cinematicMode = false;

  @ViewChild('host', { static: true }) hostRef!: ElementRef<HTMLDivElement>;

  readonly labelOverlays = signal<LabelOverlay[]>([]);
  readonly emptyHint = signal(false);

  private readonly platformId = inject(PLATFORM_ID);
  private readonly zone = inject(NgZone);
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

        const items = this.components;
        if (items.length > 0) {
          const cx = items.reduce((sum, c) => sum + c.x, 0) / items.length;
          const cy = items.reduce((sum, c) => sum + c.y, 0) / items.length;

          this.drawGrid(sk);
          this.drawConnections(sk, items, cx, cy);
          const overlays = this.drawComponents(sk, items, cx, cy);
          this.zone.run(() => {
            this.labelOverlays.set(overlays);
            this.emptyHint.set(false);
          });
        } else {
          this.zone.run(() => {
            this.labelOverlays.set([]);
            this.emptyHint.set(true);
          });
        }

        sk.pop();
      };

      sk.windowResized = () => {
        const w = host.clientWidth || 640;
        const h = host.clientHeight || 480;
        sk.resizeCanvas(w, h);
      };
    });
  }

  private compScale(comp: Lab2dComponent): number {
    return comp.id === this.selectedId ? SELECT_SCALE : BASE_SCALE;
  }

  private worldPos(comp: Lab2dComponent, cx: number, cy: number): Vec3 {
    return {
      x: (comp.x - cx) * LAYOUT_SCALE,
      y: 0,
      z: (comp.y - cy) * LAYOUT_SCALE
    };
  }

  private portWorldPos(
    comp: Lab2dComponent,
    portId: string,
    cx: number,
    cy: number
  ): Vec3 | null {
    const spec = resolvePortSpec(comp.kitId, portId);
    if (!spec) return null;

    const s = this.compScale(comp);
    const base = this.worldPos(comp, cx, cy);
    const lift = kit3DBaseHeight(comp.kitId) * s;

    return {
      x: base.x + spec.x * s,
      y: lift + 4,
      z: base.z + spec.y * s
    };
  }

  private drawConnections(
    sk: p5,
    items: Lab2dComponent[],
    cx: number,
    cy: number
  ): void {
    for (const conn of this.connections) {
      const fromComp = items.find((c) => c.id === conn.fromComp);
      const toComp = items.find((c) => c.id === conn.toComp);
      if (!fromComp || !toComp) continue;

      const from = this.portWorldPos(fromComp, conn.fromPort, cx, cy);
      const to = this.portWorldPos(toComp, conn.toPort, cx, cy);
      if (!from || !to) continue;

      drawCable3D(sk, from, to);
    }
  }

  private drawComponents(
    sk: p5,
    items: Lab2dComponent[],
    cx: number,
    cy: number
  ): LabelOverlay[] {
    const overlays: LabelOverlay[] = [];

    for (const comp of items) {
      const isSelected = comp.id === this.selectedId;
      const s = this.compScale(comp);
      const pos = this.worldPos(comp, cx, cy);
      const labelY = kit3DBaseHeight(comp.kitId) * s + 12;

      sk.push();
      sk.translate(pos.x, 0, pos.z);
      sk.scale(s);

      if (isSelected) {
        sk.push();
        sk.noFill();
        sk.stroke(255, 180, 168);
        sk.strokeWeight(2);
        sk.box(180, kit3DBaseHeight(comp.kitId) + 8, 180);
        sk.pop();
      }

      drawKitModel3D(sk, comp.kitId);
      sk.pop();

      const gl = sk as P5WebglSketch;
      overlays.push({
        id: comp.id,
        label: comp.label,
        screenX: gl.screenX(pos.x, labelY, pos.z),
        screenY: gl.screenY(pos.x, labelY, pos.z),
        selected: isSelected
      });
    }

    return overlays;
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
}
