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

type ThreeModule = typeof import('three');

@Component({
  selector: 'app-three-kit-viewer',
  standalone: true,
  templateUrl: './three-kit-viewer.component.html',
  styleUrl: './three-kit-viewer.component.css'
})
export class ThreeKitViewerComponent
  implements AfterViewInit, OnChanges, OnDestroy
{
  @Input({ required: true }) kitId!: string;
  @Input() background = '#0c0c0c';

  @ViewChild('host', { static: true }) hostRef!: ElementRef<HTMLDivElement>;

  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  private three?: ThreeModule;
  private renderer?: import('three').WebGLRenderer;
  private scene?: import('three').Scene;
  private camera?: import('three').PerspectiveCamera;
  private root?: import('three').Group;
  private animationId: number | null = null;
  private resizeObserver?: ResizeObserver;

  async ngAfterViewInit(): Promise<void> {
    if (!this.isBrowser) return;
    await this.initThree();
    this.startLoop();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.isBrowser) return;
    if (changes['kitId'] && !changes['kitId'].isFirstChange()) {
      void this.replaceModel();
    }
    if (changes['background'] && this.renderer) {
      this.renderer.setClearColor(this.background, 1);
    }
  }

  rotateLeft(): void {
    if (!this.root) return;
    this.root.rotation.y -= 0.25;
  }

  rotateRight(): void {
    if (!this.root) return;
    this.root.rotation.y += 0.25;
  }

  zoomIn(): void {
    if (!this.camera) return;
    this.camera.position.z = Math.max(1.8, this.camera.position.z - 0.4);
  }

  zoomOut(): void {
    if (!this.camera) return;
    this.camera.position.z = Math.min(8, this.camera.position.z + 0.4);
  }

  ngOnDestroy(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
    }

    this.resizeObserver?.disconnect();
    this.resizeObserver = undefined;

    if (this.scene && this.root) {
      this.scene.remove(this.root);
    }

    if (this.renderer) {
      this.renderer.dispose();
    }
  }

  private async initThree(): Promise<void> {
    this.three = await import('three');
    const THREE = this.three;

    const host = this.hostRef.nativeElement;
    const width = host.clientWidth || 320;
    const height = host.clientHeight || 240;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height, false);
    renderer.setClearColor(this.background, 1);

    host.replaceChildren(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 1.6, 4.2);

    const ambient = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambient);

    const key = new THREE.DirectionalLight(0xffffff, 1.1);
    key.position.set(2, 3, 2);
    scene.add(key);

    const rim = new THREE.DirectionalLight(0xffb4a8, 0.45);
    rim.position.set(-2, 1.5, -2);
    scene.add(rim);

    const grid = new THREE.GridHelper(10, 10, 0x2b2b2b, 0x151515);
    grid.position.y = -0.4;
    scene.add(grid);

    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(host);

    await this.replaceModel();
  }

  private resize(): void {
    if (!this.renderer || !this.camera) return;
    const host = this.hostRef.nativeElement;
    const width = host.clientWidth || 320;
    const height = host.clientHeight || 240;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  }

  private async replaceModel(): Promise<void> {
    if (!this.three || !this.scene) return;
    const THREE = this.three;

    if (this.root) {
      this.scene.remove(this.root);
    }

    const root = new THREE.Group();
    root.add(this.createModel(THREE, this.kitId));
    root.position.y = -0.2;
    root.rotation.y = 0.5;
    this.scene.add(root);
    this.root = root;
  }

  private startLoop(): void {
    if (!this.renderer || !this.scene || !this.camera) return;

    const tick = () => {
      if (this.root) {
        this.root.rotation.y += 0.002;
      }
      this.renderer?.render(this.scene!, this.camera!);
      this.animationId = requestAnimationFrame(tick);
    };
    tick();
  }

  private createModel(THREE: ThreeModule, kitId: string): import('three').Object3D {
    const matte = (color: number) =>
      new THREE.MeshStandardMaterial({ color, roughness: 0.9, metalness: 0.05 });
    const plastic = (color: number) =>
      new THREE.MeshStandardMaterial({ color, roughness: 0.55, metalness: 0.1 });
    const metal = (color: number) =>
      new THREE.MeshStandardMaterial({ color, roughness: 0.25, metalness: 0.85 });

    const group = new THREE.Group();

    const addBoard = (w: number, h: number, d: number, color: number) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, d, h), matte(color));
      mesh.position.y = 0;
      group.add(mesh);
      return mesh;
    };

    if (kitId === 'arduino-uno-r3') {
      addBoard(2.8, 1.7, 0.18, 0x146b3a);
      const usb = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.28, 0.5), metal(0xb3b3b3));
      usb.position.set(1.05, 0.15, 0.2);
      group.add(usb);
      const headerMat = plastic(0x1a1a1a);
      const leftHeader = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.16, 0.18), headerMat);
      leftHeader.position.set(-0.1, 0.12, 0.72);
      group.add(leftHeader);
      const rightHeader = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.16, 0.18), headerMat);
      rightHeader.position.set(-0.1, 0.12, -0.72);
      group.add(rightHeader);
      const chip = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.12, 0.45), plastic(0x202020));
      chip.position.set(0.1, 0.12, 0);
      group.add(chip);
      return group;
    }

    if (kitId === 'l298n') {
      addBoard(2.6, 2.0, 0.18, 0x8f1b1b);
      const heatsink = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.42, 0.9), metal(0x2b2b2b));
      heatsink.position.set(-0.2, 0.3, 0);
      group.add(heatsink);
      const terminal = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.22, 1.4), plastic(0x1f4f2a));
      terminal.position.set(0.95, 0.18, 0);
      group.add(terminal);
      return group;
    }

    if (kitId === 'tcrt5000') {
      addBoard(1.3, 0.55, 0.12, 0x101010);
      const emitter = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.16, 18), plastic(0x222222));
      emitter.rotation.x = Math.PI / 2;
      emitter.position.set(-0.25, 0.12, 0);
      group.add(emitter);
      const receiver = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.16, 18), plastic(0x2b2b2b));
      receiver.rotation.x = Math.PI / 2;
      receiver.position.set(0.25, 0.12, 0);
      group.add(receiver);
      const header = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.14, 0.16), plastic(0x1a1a1a));
      header.position.set(0, 0.12, 0.18);
      group.add(header);
      return group;
    }

    if (kitId === 'motor-dc-gear-6v') {
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 1.0, 26), metal(0xa7a7a7));
      body.rotation.z = Math.PI / 2;
      body.position.set(-0.2, 0.25, 0);
      group.add(body);
      const gearbox = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.45, 0.55), plastic(0xd6c24a));
      gearbox.position.set(0.45, 0.25, 0);
      group.add(gearbox);
      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.4, 18), metal(0xcfcfcf));
      shaft.rotation.z = Math.PI / 2;
      shaft.position.set(0.85, 0.25, 0);
      group.add(shaft);
      return group;
    }

    if (kitId === 'wheel-65mm') {
      const tire = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.14, 18, 40), plastic(0x1a1a1a));
      tire.rotation.x = Math.PI / 2;
      group.add(tire);
      const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.22, 22), matte(0xd0d0d0));
      hub.rotation.x = Math.PI / 2;
      group.add(hub);
      return group;
    }

    if (kitId === 'acrylic-chassis') {
      const plate = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.08, 2.1), plastic(0x202020));
      plate.position.y = 0.04;
      group.add(plate);
      const standoffMat = metal(0xa9a9a9);
      const st1 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.22, 16), standoffMat);
      st1.position.set(1.1, 0.16, 0.8);
      group.add(st1);
      const st2 = st1.clone();
      st2.position.set(-1.1, 0.16, 0.8);
      group.add(st2);
      const st3 = st1.clone();
      st3.position.set(1.1, 0.16, -0.8);
      group.add(st3);
      const st4 = st1.clone();
      st4.position.set(-1.1, 0.16, -0.8);
      group.add(st4);
      return group;
    }

    if (kitId === 'caster-wheel') {
      const wheel = new THREE.Mesh(new THREE.SphereGeometry(0.22, 20, 16), plastic(0x141414));
      wheel.position.set(0, 0.18, 0);
      group.add(wheel);
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.04, 18), metal(0xb0b0b0));
      base.position.set(0, 0.32, 0);
      group.add(base);
      return group;
    }

    if (kitId === 'battery-holder-4aa') {
      const holder = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.55, 1.0), plastic(0x252525));
      holder.position.set(0, 0.22, 0);
      group.add(holder);
      const red = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.25), plastic(0xb11616));
      red.position.set(1.05, 0.4, 0.25);
      group.add(red);
      const black = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.25), plastic(0x101010));
      black.position.set(1.05, 0.4, -0.25);
      group.add(black);
      return group;
    }

    if (kitId === 'usb-b') {
      const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 2.0, 18), plastic(0x1a1a1a));
      cable.rotation.x = Math.PI / 2;
      group.add(cable);
      const head = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.28, 0.35), metal(0xb3b3b3));
      head.position.set(0.95, 0.12, 0);
      group.add(head);
      return group;
    }

    addBoard(2.0, 1.2, 0.18, 0x2a2a2a);
    return group;
  }
}

