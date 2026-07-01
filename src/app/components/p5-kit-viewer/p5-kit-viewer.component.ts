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
  inject
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import type p5 from 'p5';
import { drawKitModel, kitModelSize } from './p5-kit-models';

@Component({
  selector: 'app-p5-kit-viewer',
  standalone: true,
  templateUrl: './p5-kit-viewer.component.html',
  styleUrl: './p5-kit-viewer.component.css'
})
export class P5KitViewerComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input({ required: true }) kitId!: string;
  @Input() autoRotate = true;
  @Input() background = 12;

  @ViewChild('host', { static: true }) hostRef!: ElementRef<HTMLDivElement>;

  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  private p5Instance?: p5;
  private rotation = 0;

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;
    void this.mountSketch();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.isBrowser || !this.p5Instance) return;
    if (changes['kitId'] && !changes['kitId'].isFirstChange()) {
      this.rotation = 0;
      this.applyCanvasSize(this.p5Instance, this.kitId);
    }
  }

  ngOnDestroy(): void {
    this.p5Instance?.remove();
    this.p5Instance = undefined;
  }

  rotateLeft(): void {
    this.rotation -= 0.35;
  }

  rotateRight(): void {
    this.rotation += 0.35;
  }

  private canvasSizeFor(kitId: string): { w: number; h: number } {
    const size = kitModelSize(kitId);
    return { w: size.w + 40, h: size.h + 40 };
  }

  private applyCanvasSize(sk: p5, kitId: string): void {
    const { w, h } = this.canvasSizeFor(kitId);
    sk.resizeCanvas(w, h);
    if (kitId === 'lidar-v2') {
      sk.loop();
    } else {
      sk.noLoop();
      sk.redraw();
    }
  }

  private async mountSketch(): Promise<void> {
    const p5Module = await import('p5');
    const P5 = p5Module.default;
    const host = this.hostRef.nativeElement;
    const kitId = () => this.kitId;

    this.p5Instance = new P5((sk: p5) => {
      sk.setup = () => {
        const id = kitId();
        const { w, h } = this.canvasSizeFor(id);
        const canvas = sk.createCanvas(w, h);
        canvas.parent(host);
        sk.angleMode(sk.DEGREES);
        if (id === 'lidar-v2') {
          sk.loop();
        } else {
          sk.noLoop();
        }
      };

      sk.draw = () => {
        sk.clear();
        const id = kitId();
        sk.push();
        sk.translate(sk.width / 2, sk.height / 2);
        drawKitModel(sk, id);
        sk.pop();
      };

      sk.windowResized = () => {
        this.applyCanvasSize(sk, kitId());
      };
    });
  }
}
