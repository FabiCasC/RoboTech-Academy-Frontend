import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  PLATFORM_ID,
  ViewChild,
  inject
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import type p5 from 'p5';
import { drawKitModel, kitModelSize } from '../p5-kit-viewer/p5-kit-models';
import { areCompatible, resolvePortSpec } from '../p5-kit-viewer/kit-compatibility';

// ── Public types ─────────────────────────────────────────────────────────────

export interface LabPort {
  id: string;
  side: 'left' | 'right';
  /** 0..1 — fraction of body height (below header) */
  offset: number;
  active: boolean;
}

export interface Lab2dComponent {
  id: string;
  kitId: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  ports: LabPort[];
}

export interface Lab2dConnection {
  id: string;
  fromComp: string;
  fromPort: string;
  toComp: string;
  toPort: string;
}

// ── Internal types ────────────────────────────────────────────────────────────

interface PortHit {
  compId: string;
  portId: string;
  x: number;
  y: number;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const HEADER_H = 40;      // px — card header height
const PORT_R   = 6;       // px — port circle radius
const PORT_HIT = 11;      // px — click hit-test radius
const GRID_PX  = 32;      // px — grid cell size
const FEEDBACK_MS = 2000;

/**
 * Standalone p5.js 2D schematic canvas.
 *
 * Performance contract:
 *  - sk.noLoop() in setup() — p5 never auto-redraws.
 *  - All state mutations call redraw() which sets dirty=true and sk.redraw().
 *  - sk.draw() returns early if !dirty → 0 CPU when idle.
 *  - Drag mutates the internal _comps copy directly (no Angular zone) for
 *    smooth 60fps; emits componentMoved only on mouseReleased.
 *
 * Memory-leak prevention:
 *  - ngOnDestroy calls sketch.remove() which destroys the canvas element and
 *    removes all p5 event listeners registered by the sketch.
 */
@Component({
  selector: 'app-p5-lab2d-canvas',
  standalone: true,
  template: `
    <div
      class="canvas-host"
      [class.readonly]="readonly"
      #host
      (dragover)="!readonly && $event.preventDefault()"
      (drop)="onHostDrop($event)">
    </div>
  `,
  styles: [`
    :host        { display: block; width: 100%; height: 100%; }
    .canvas-host { width: 100%; height: 100%; }
    .canvas-host.readonly { pointer-events: none; cursor: default; }
    .canvas-host :ng-deep canvas { display: block; }
  `]
})
export class P5Lab2dCanvasComponent implements AfterViewInit, OnDestroy {

  // ── Inputs (setters trigger a redraw) ─────────────────────────────────────

  @Input() set components(v: Lab2dComponent[]) {
    // Deep-copy so internal drag mutations don't leak into the parent signal
    this._comps = v.map(c => ({ ...c, ports: c.ports.map(p => ({ ...p })) }));
    this.syncLidarAnimation();
    this.redraw();
  }

  @Input() set connections(v: Lab2dConnection[]) {
    this._conns = [...v];
    this.redraw();
  }

  @Input() set selectedId(v: string | null) {
    this._sel = v;
    this.redraw();
  }

  /** Si true, desactiva arrastre, cableado y drops (solo visualización). */
  @Input() readonly = false;

  // ── Outputs ───────────────────────────────────────────────────────────────

  @Output() componentMoved         = new EventEmitter<{ id: string; x: number; y: number }>();
  @Output() componentSelected      = new EventEmitter<string | null>();
  @Output() connectionMade         = new EventEmitter<{ fromComp: string; fromPort: string; toComp: string; toPort: string }>();
  @Output() componentDoubleClicked = new EventEmitter<string>();
  /** Fired when a kit card is dragged from the palette and dropped onto the canvas. */
  @Output() kitDropped             = new EventEmitter<{ kitId: string; x: number; y: number }>();

  @ViewChild('host', { static: true }) hostRef!: ElementRef<HTMLDivElement>;

  private readonly platformId = inject(PLATFORM_ID);

  // ── p5 state ──────────────────────────────────────────────────────────────

  private sketch?: p5;
  private dirty  = false;

  // Internal mutable copies — mutated by p5 mouse handlers without zone
  private _comps: Lab2dComponent[]  = [];
  private _conns: Lab2dConnection[] = [];
  private _sel:   string | null     = null;

  // Drag state
  private dragId  : string | null = null;
  private dragOx  = 0;
  private dragOy  = 0;
  private dragged = false;

  // Wiring state
  private pending: PortHit | null = null;
  private curX = 0;
  private curY = 0;

  private compatFeedback: {
    message: string;
    x: number;
    y: number;
    until: number;
    flash: Array<{ compId: string; portId: string }>;
  } | null = null;

  private feedbackTimer?: ReturnType<typeof setInterval>;
  private lidarAnimTimer?: ReturnType<typeof setInterval>;

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) void this.mount();
  }

  ngOnDestroy(): void {
    this.clearFeedbackTimer();
    this.clearLidarAnimTimer();
    // Destroys the <canvas> element and removes p5's window event listeners
    this.sketch?.remove();
    this.sketch = undefined;
  }

  // ── HTML5 drop handler ───────────────────────────────────────────────────

  onHostDrop(event: DragEvent): void {
    if (this.readonly) return;
    event.preventDefault();
    const dt = event.dataTransfer;
    let kitId = dt?.getData('text/plain') ?? '';
    if (!kitId) {
      kitId = dt?.getData('application/x-kit-id') ?? '';
    }
    if (!kitId) return;
    const rect = this.hostRef.nativeElement.getBoundingClientRect();
    this.kitDropped.emit({ kitId, x: event.clientX - rect.left, y: event.clientY - rect.top });
  }

  // ── Dirty-flag redraw ─────────────────────────────────────────────────────

  private redraw(): void {
    this.dirty = true;
    this.sketch?.redraw(); // no-op until sketch is mounted
  }

  private syncLidarAnimation(): void {
    const hasLidar = this._comps.some((c) => c.kitId === 'lidar-v2');
    if (hasLidar && !this.lidarAnimTimer) {
      this.lidarAnimTimer = setInterval(() => this.redraw(), 50);
    } else if (!hasLidar) {
      this.clearLidarAnimTimer();
    }
  }

  private clearLidarAnimTimer(): void {
    if (this.lidarAnimTimer) {
      clearInterval(this.lidarAnimTimer);
      this.lidarAnimTimer = undefined;
    }
  }

  private clearFeedbackTimer(): void {
    if (this.feedbackTimer) {
      clearInterval(this.feedbackTimer);
      this.feedbackTimer = undefined;
    }
  }

  private showCompatRejection(sk: p5, reason: string | undefined, portHit: PortHit): void {
    if (!this.pending) return;

    this.compatFeedback = {
      message: reason ?? 'Conexión no compatible.',
      x: sk.mouseX,
      y: sk.mouseY,
      until: Date.now() + FEEDBACK_MS,
      flash: [
        { compId: this.pending.compId, portId: this.pending.portId },
        { compId: portHit.compId, portId: portHit.portId }
      ]
    };

    this.clearFeedbackTimer();
    this.feedbackTimer = setInterval(() => {
      if (!this.compatFeedback || Date.now() >= this.compatFeedback.until) {
        this.compatFeedback = null;
        this.clearFeedbackTimer();
      }
      this.redraw();
    }, 50);
    this.redraw();
  }

  // ── p5 sketch bootstrap ───────────────────────────────────────────────────

  private async mount(): Promise<void> {
    const { default: P5 } = await import('p5');
    const host = this.hostRef.nativeElement;

    this.sketch = new P5((sk: p5) => {

      sk.setup = () => {
        const w = host.offsetWidth || 900;
        const h = host.offsetHeight || 550;
        const cvs = sk.createCanvas(w, h);
        cvs.parent(host);
        sk.resizeCanvas(w, h);
        sk.noLoop();          // Never auto-draw — dirty flag controls all redraws
        sk.pixelDensity(Math.min(window.devicePixelRatio ?? 1, 2));
        this.dirty = true;
        sk.redraw();
      };

      sk.draw = () => {
        if (!this.dirty) return;  // Dirty-flag guard → 0 CPU when idle
        this.dirty = false;
        this.renderScene(sk);
      };

      sk.mousePressed = () => {
        if (!this.inside(sk)) return;
        this.onPress(sk);
        this.redraw();
      };

      sk.mouseDragged = () => {
        if (!this.inside(sk)) return;
        this.curX = sk.mouseX;
        this.curY = sk.mouseY;
        this.onDrag(sk);
        this.redraw();
      };

      sk.mouseReleased = () => {
        this.onRelease();
        this.redraw();
      };

      sk.doubleClicked = () => {
        if (!this.inside(sk)) return;
        this.onDouble(sk);
      };

      sk.windowResized = () => {
        sk.resizeCanvas(host.offsetWidth || 900, host.offsetHeight || 550);
        this.redraw();
      };
    });
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  RENDERING
  // ══════════════════════════════════════════════════════════════════════════

  private renderScene(sk: p5): void {
    sk.background(26, 26, 26);
    this.drawGrid(sk);
    for (const c of this._conns) this.drawCable(sk, c);
    if (this.pending) this.drawWirePreview(sk);
    for (const c of this._comps) this.drawCard(sk, c);
    this.drawCompatToast(sk);
  }

  // ── Grid ──────────────────────────────────────────────────────────────────

  private drawGrid(sk: p5): void {
    sk.stroke(38, 38, 38);
    sk.strokeWeight(0.5);
    for (let x = 0; x <= sk.width; x  += GRID_PX) sk.line(x, 0, x, sk.height);
    for (let y = 0; y <= sk.height; y += GRID_PX) sk.line(0, y, sk.width, y);
  }

  // ── Component card ────────────────────────────────────────────────────────

  private drawCard(sk: p5, c: Lab2dComponent): void {
    const sel = c.id === this._sel;
    const ctx = sk.drawingContext as CanvasRenderingContext2D;

    // Neon glow for selected card
    if (sel) {
      ctx.shadowBlur  = 22;
      ctx.shadowColor = 'rgba(255,0,0,0.28)';
    }

    // Card body
    sk.fill(53, 53, 53);
    sk.stroke(sel ? sk.color(255, 180, 168) : sk.color(51, 51, 51));
    sk.strokeWeight(sel ? 1.5 : 1);
    sk.rect(c.x, c.y, c.w, c.h, 3);
    ctx.shadowBlur = 0;

    // Header separator
    sk.stroke(45, 45, 45);
    sk.strokeWeight(1);
    sk.line(c.x + 1, c.y + HEADER_H, c.x + c.w - 1, c.y + HEADER_H);

    // Label
    sk.noStroke();
    sk.fill(235, 187, 180);
    sk.textFont('monospace');
    sk.textSize(10);
    sk.textAlign(sk.LEFT, sk.CENTER);
    const lbl = c.label.length > 22 ? c.label.slice(0, 21) + '…' : c.label;
    sk.text(lbl, c.x + 12, c.y + 20);

    // Kit badge
    sk.fill(88, 88, 88);
    sk.textSize(8);
    sk.text(c.kitId.slice(0, 14).toUpperCase(), c.x + 12, c.y + 33);

    const bodyCy = c.y + HEADER_H + (c.h - HEADER_H) / 2;
    const bodyW = c.w;
    const bodyH = c.h - HEADER_H;
    const { w: mw, h: mh } = kitModelSize(c.kitId);
    const scale = Math.min((bodyW * 0.9) / mw, (bodyH * 0.9) / mh);

    sk.push();
    sk.translate(c.x + c.w / 2, bodyCy);
    sk.scale(scale);
    drawKitModel(sk, c.kitId);
    sk.pop();

    // Ports
    for (const p of c.ports) this.drawPort(sk, c, p);
  }

  private drawPort(sk: p5, c: Lab2dComponent, p: LabPort): void {
    const pos      = this.portXY(c, p);
    const isPend   = this.pending?.compId === c.id && this.pending?.portId === p.id;
    const isFlash  = this.isPortFlashing(c.id, p.id);
    const ctx      = sk.drawingContext as CanvasRenderingContext2D;

    if (isFlash) {
      const pulse = 0.45 + 0.55 * Math.abs(Math.sin(Date.now() / 90));
      ctx.shadowBlur  = 18 * pulse;
      ctx.shadowColor = '#FF0000';
      sk.fill(255, 40, 40, 220);
      sk.stroke(255, 0, 0);
      sk.strokeWeight(2.5);
      sk.circle(pos.x, pos.y, PORT_R * 2 + 4 * pulse);
      ctx.shadowBlur = 0;
      return;
    }

    if (p.active || isPend) {
      ctx.shadowBlur  = isPend ? 14 : 7;
      ctx.shadowColor = '#FF0000';
    }
    sk.fill(p.active ? sk.color(255, 180, 168) : sk.color(200, 198, 197));
    sk.stroke(53, 53, 53);
    sk.strokeWeight(2);
    sk.circle(pos.x, pos.y, PORT_R * 2);
    ctx.shadowBlur = 0;
  }

  private isPortFlashing(compId: string, portId: string): boolean {
    if (!this.compatFeedback || Date.now() >= this.compatFeedback.until) return false;
    return this.compatFeedback.flash.some(
      (f) => f.compId === compId && f.portId === portId
    );
  }

  private drawCompatToast(sk: p5): void {
    if (!this.compatFeedback || Date.now() >= this.compatFeedback.until) return;

    const msg = this.compatFeedback.message;
    const padX = 12;
    const padY = 8;
    sk.textSize(11);
    sk.textFont('monospace');
    const tw = sk.textWidth(msg);
    const boxW = Math.min(tw + padX * 2, sk.width - 24);
    const boxH = 34;
    let bx = this.compatFeedback.x + 14;
    let by = this.compatFeedback.y - boxH - 12;
    bx = Math.max(12, Math.min(bx, sk.width - boxW - 12));
    by = Math.max(12, Math.min(by, sk.height - boxH - 12));

    sk.noStroke();
    sk.fill(40, 0, 0, 230);
    sk.rect(bx, by, boxW, boxH, 4);
    sk.stroke(255, 0, 0);
    sk.strokeWeight(1.5);
    sk.noFill();
    sk.rect(bx, by, boxW, boxH, 4);

    sk.noStroke();
    sk.fill(255, 120, 120);
    sk.textAlign(sk.LEFT, sk.CENTER);
    sk.text(msg, bx + padX, by + boxH / 2, boxW - padX * 2);
  }

  // ── Cables (Bézier curves) ────────────────────────────────────────────────

  private drawCable(sk: p5, conn: Lab2dConnection): void {
    const fc = this._comps.find(c => c.id === conn.fromComp);
    const tc = this._comps.find(c => c.id === conn.toComp);
    if (!fc || !tc) return;
    const fp = fc.ports.find(p => p.id === conn.fromPort);
    const tp = tc.ports.find(p => p.id === conn.toPort);
    if (!fp || !tp) return;

    const a  = this.portXY(fc, fp);
    const b  = this.portXY(tc, tp);
    const mx = (a.x + b.x) / 2;

    sk.noFill();
    sk.stroke(255, 180, 168, 155);
    sk.strokeWeight(1.5);
    sk.bezier(a.x, a.y, mx, a.y, mx, b.y, b.x, b.y);
  }

  /** Dashed red preview while dragging a wire from a port to the cursor. */
  private drawWirePreview(sk: p5): void {
    if (!this.pending) return;
    const ctx = sk.drawingContext as CanvasRenderingContext2D;
    ctx.setLineDash([6, 4]);
    sk.noFill();
    sk.stroke(255, 40, 40, 210);
    sk.strokeWeight(1.5);
    const mx = (this.pending.x + this.curX) / 2;
    sk.bezier(this.pending.x, this.pending.y, mx, this.pending.y, mx, this.curY, this.curX, this.curY);
    ctx.setLineDash([]);
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  MOUSE INTERACTION
  // ══════════════════════════════════════════════════════════════════════════

  private onPress(sk: p5): void {
    if (this.readonly) return;
    const mx = sk.mouseX, my = sk.mouseY;

    // 1. Port hit → wiring mode
    const portHit = this.hitPort(mx, my);
    if (portHit) {
      if (!this.pending) {
        // Start wiring from this port
        this.pending = portHit;
        this.curX = mx; this.curY = my;
      } else if (portHit.compId !== this.pending.compId) {
        const fromComp = this._comps.find((c) => c.id === this.pending!.compId);
        const toComp = this._comps.find((c) => c.id === portHit.compId);
        const fromSpec = fromComp ? resolvePortSpec(fromComp.kitId, this.pending.portId) : undefined;
        const toSpec = toComp ? resolvePortSpec(toComp.kitId, portHit.portId) : undefined;

        if (fromComp && toComp && fromSpec && toSpec) {
          const check = areCompatible(
            { kitId: fromComp.kitId, port: fromSpec },
            { kitId: toComp.kitId, port: toSpec }
          );
          if (!check.ok) {
            this.showCompatRejection(sk, check.reason, portHit);
            this.pending = null;
            return;
          }
        }

        this.connectionMade.emit({
          fromComp: this.pending.compId,
          fromPort: this.pending.portId,
          toComp:   portHit.compId,
          toPort:   portHit.portId
        });
        this.pending = null;
      } else {
        // Same component → cancel
        this.pending = null;
      }
      return;
    }

    // 2. Cancel pending wire on empty click
    if (this.pending) {
      this.pending = null;
      return;
    }

    // 3. Component pick — iterate in reverse to pick top-most first
    for (let i = this._comps.length - 1; i >= 0; i--) {
      const c = this._comps[i];
      if (mx >= c.x && mx <= c.x + c.w && my >= c.y && my <= c.y + c.h) {
        this.dragId = c.id;
        this.dragOx = mx - c.x;
        this.dragOy = my - c.y;
        this.dragged = false;
        this.componentSelected.emit(c.id);
        return;
      }
    }

    // 4. Click on empty canvas → deselect
    this.componentSelected.emit(null);
  }

  private onDrag(sk: p5): void {
    if (this.readonly) return;
    if (!this.dragId) return;
    const c = this._comps.find(c => c.id === this.dragId);
    if (!c) return;
    this.dragged = true;
    // Clamp to canvas bounds
    c.x = Math.max(0, Math.min(sk.mouseX - this.dragOx, sk.width  - c.w));
    c.y = Math.max(0, Math.min(sk.mouseY - this.dragOy, sk.height - c.h));
  }

  private onRelease(): void {
    if (this.readonly) return;
    if (this.dragId && this.dragged) {
      const c = this._comps.find(c => c.id === this.dragId);
      if (c) this.componentMoved.emit({ id: c.id, x: c.x, y: c.y });
    }
    this.dragId  = null;
    this.dragged = false;
  }

  private onDouble(sk: p5): void {
    if (this.readonly) return;
    const mx = sk.mouseX, my = sk.mouseY;
    for (let i = this._comps.length - 1; i >= 0; i--) {
      const c = this._comps[i];
      if (mx >= c.x && mx <= c.x + c.w && my >= c.y && my <= c.y + c.h) {
        this.componentDoubleClicked.emit(c.id);
        return;
      }
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  HELPERS
  // ══════════════════════════════════════════════════════════════════════════

  private inside(sk: p5): boolean {
    return sk.mouseX >= 0 && sk.mouseX <= sk.width &&
           sk.mouseY >= 0 && sk.mouseY <= sk.height;
  }

  private portXY(c: Lab2dComponent, p: LabPort): { x: number; y: number } {
    const bodyH = c.h - HEADER_H;
    return {
      x: p.side === 'right' ? c.x + c.w : c.x,
      y: c.y + HEADER_H + bodyH * p.offset
    };
  }

  private hitPort(mx: number, my: number): PortHit | null {
    for (const c of this._comps) {
      for (const p of c.ports) {
        const pos = this.portXY(c, p);
        if (Math.hypot(mx - pos.x, my - pos.y) <= PORT_HIT) {
          return { compId: c.id, portId: p.id, x: pos.x, y: pos.y };
        }
      }
    }
    return null;
  }
}
