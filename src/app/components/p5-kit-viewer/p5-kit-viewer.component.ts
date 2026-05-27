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
import { drawKitModel } from './p5-kit-models';

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

  private async mountSketch(): Promise<void> {
    const p5Module = await import('p5');
    const P5 = p5Module.default;
    const host = this.hostRef.nativeElement;
    const kitId = () => this.kitId;
    const bg = () => this.background;

    this.p5Instance = new P5((sk: p5) => {
      sk.setup = () => {
        const w = host.clientWidth || 320;
        const h = host.clientHeight || 190;
        const canvas = sk.createCanvas(w, h, sk.WEBGL);
        canvas.parent(host);
        sk.angleMode(sk.DEGREES);
      };

      sk.draw = () => {
        sk.background(bg());
        sk.ambientLight(120, 120, 130);
        sk.directionalLight(255, 245, 240, 0.4, 0.8, -0.6);
        sk.directionalLight(255, 180, 168, -0.6, 0.2, 0.5);

        sk.push();
        sk.scale(0.9);
        if (this.autoRotate) {
          this.rotation += 0.25;
        }
        sk.rotateY(this.rotation);
        sk.rotateX(-18);
        drawKitModel(sk, kitId());
        sk.pop();
      };

      sk.windowResized = () => {
        const w = host.clientWidth || 320;
        const h = host.clientHeight || 190;
        sk.resizeCanvas(w, h);
      };
    });
  }
}
