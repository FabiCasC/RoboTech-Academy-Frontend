import { Component, OnInit, inject, PLATFORM_ID, signal, computed } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { KIT_CATALOG } from '../componentes/data/kit-catalog.data';
import type { KitItem } from '../componentes/models/kit.models';
import { P5KitViewerComponent } from '../../components/p5-kit-viewer/p5-kit-viewer.component';
import { P5LabSceneComponent } from '../../components/p5-lab-scene/p5-lab-scene.component';
import {
  P5Lab2dCanvasComponent,
  type Lab2dComponent,
  type Lab2dConnection,
  type LabPort
} from '../../components/p5-lab2d-canvas/p5-lab2d-canvas.component';
import { LabWorkspaceService } from '../../services/lab-workspace.service';
import { LabProjectsService } from '../../services/lab-projects.service';
import {
  HardwareValidationService,
  type HardwareValidationResult
} from '../../services/sys/hardware-validation.service';
import { RenderOrchestratorService } from '../../services/sys/render-orchestrator.service';
import { CircuitService } from '../../services/circuit.service';

export interface Telemetry { pwr: string; lat: string; status: string; }

// Re-export so templates that import this component can reference the types
export type { Lab2dComponent, Lab2dConnection };

@Component({
  selector: 'app-laboratorio2d',
  standalone: true,
  imports: [CommonModule, P5KitViewerComponent, P5LabSceneComponent, P5Lab2dCanvasComponent],
  templateUrl: './laboratorio2d.component.html',
  styleUrls: ['./laboratorio2d.component.css'],
})
export class Laboratorio2dComponent implements OnInit {

  private readonly router           = inject(Router);
  private readonly route            = inject(ActivatedRoute);
  private readonly workspaceSvc     = inject(LabWorkspaceService);
  private readonly projectsSvc      = inject(LabProjectsService);
  private readonly hardwareValidation = inject(HardwareValidationService);
  private readonly sysOrchestrator  = inject(RenderOrchestratorService);
  /** Circuito remoto + signals de simulación (consumido por la plantilla). */
  readonly circuit                = inject(CircuitService);
  private readonly platformId       = inject(PLATFORM_ID);

  // ── UI state ──────────────────────────────────────────────────────────────

  workspaceName  = 'SCHEMATIC_01';
  zoom           = 100;
  activeTool: 'pan' | 'select' = 'select';
  viewMode: '2d' | '3d'        = '2d';
  paletteOpen    = true;
  projectId: string | null = null;
  selectedKitId  = 'arduino-uno-r3';

  readonly kitItems: KitItem[] = KIT_CATALOG;
  telemetry: Telemetry = { pwr: '5.0V / 2.1A', lat: '12ms', status: 'NOMINAL' };
  hardwareReport: HardwareValidationResult | null = null;

  // ── Reactive state (Angular Signals) ──────────────────────────────────────

  readonly components  = signal<Lab2dComponent[]>([]);
  readonly connections = signal<Lab2dConnection[]>([]);
  readonly selectedId  = signal<string | null>(null);

  /** Feeds the P5LabScene (3D) which expects a simpler shape */
  readonly componentsFor3D = computed(() =>
    this.components().map(c => ({ id: c.id, kitId: c.kitId, label: c.label, x: c.x, y: c.y }))
  );

  private history: Lab2dComponent[][] = [];

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.projectId = this.route.snapshot.queryParamMap.get('projectId');
    const isNew    = this.route.snapshot.queryParamMap.get('new') === 'true';

    if (this.projectId) {
      const project = this.projectsSvc.getById(this.projectId);
      this.workspaceName = project?.title ?? `LAB_${this.projectId}`;

      const stored = this.workspaceSvc.get(this.projectId);
      if (stored?.components?.length) {
        this.components.set(stored.components  as Lab2dComponent[]);
        this.connections.set((stored.connections as Lab2dConnection[] | undefined) ?? []);
      } else {
        this.components.set(this.templateFor(project));
        this.connections.set([]);
      }
    } else if (isNew) {
      this.components.set([]);
      this.connections.set([]);
      this.workspaceName = 'NUEVO_ESQUEMATICO';
    } else {
      this.components.set(this.defaultScene());
    }

    this.rebuildAutoConnections();
    this.persist();

    const addKitId = this.route.snapshot.queryParamMap.get('add');
    if (addKitId) { this.selectKit(addKitId); this.addKit(addKitId); }
  }

  // ── Canvas event handlers ─────────────────────────────────────────────────

  onComponentMoved(ev: { id: string; x: number; y: number }): void {
    this.components.update(cs =>
      cs.map(c => c.id === ev.id ? { ...c, x: ev.x, y: ev.y } : c)
    );
    this.rebuildAutoConnections();
    this.persist();
  }

  onComponentSelected(id: string | null): void {
    this.selectedId.set(id);
  }

  onConnectionMade(ev: { fromComp: string; fromPort: string; toComp: string; toPort: string }): void {
    const duplicate = this.connections().some(
      c => c.fromComp === ev.fromComp && c.fromPort === ev.fromPort &&
           c.toComp   === ev.toComp   && c.toPort   === ev.toPort
    );
    if (duplicate) return;
    const id = `manual-${Date.now().toString(36)}`;
    this.connections.update(cs => [...cs, { id, ...ev }]);
    this.persist();
  }

  onComponentDoubleClicked(id: string): void {
    const comp = this.components().find(c => c.id === id);
    if (comp?.kitId === 'arduino-uno-r3') {
      void this.router.navigate(['/ide-programacion']);
    }
  }

  onKitDropped(ev: { kitId: string; x: number; y: number }): void {
    this.addKit(ev.kitId, ev.x, ev.y);
  }

  // ── Toolbar & palette actions ─────────────────────────────────────────────

  setTool(tool: 'pan' | 'select'): void { this.activeTool = tool; }

  setViewMode(mode: '2d' | '3d'): void {
    this.viewMode = mode;
    this.sysOrchestrator.orchestrateP5View(mode, mode === '3d' ? 'ensamblaje' : undefined);
  }

  togglePalette(): void { this.paletteOpen = !this.paletteOpen; }

  selectKit(kitId: string): void { this.selectedKitId = kitId; }

  addSelectedKit(): void { this.addKit(this.selectedKitId); }

  deleteSelected(): void {
    const id = this.selectedId();
    if (!id) return;
    this.saveHistory();
    this.components.update(cs => cs.filter(c => c.id !== id));
    this.connections.update(cs => cs.filter(c => c.fromComp !== id && c.toComp !== id));
    this.selectedId.set(null);
    this.rebuildAutoConnections();
    this.persist();
  }

  undo(): void {
    if (!this.history.length) return;
    this.components.set(this.history.pop()!);
    this.rebuildAutoConnections();
    this.persist();
  }

  /** Valida circuito + código contra Spring (`POST /circuit/validate`). */
  validateCircuitWithBackend(): void {
    const graph = { components: this.components(), connections: this.connections() };
    this.circuit.validateCircuit(graph, this.readLastIdeCodeSnapshot()).subscribe();
  }

  stopBackendSimulation(): void {
    this.circuit.stopSimulation();
  }

  // ── Private helpers ───────────────────────────────────────────────────────

  private saveHistory(): void {
    this.history.push(this.components().map(c => ({ ...c, ports: c.ports.map(p => ({ ...p })) })));
    if (this.history.length > 20) this.history.shift();
  }

  private readLastIdeCodeSnapshot(): string {
    if (!isPlatformBrowser(this.platformId)) return '';
    return window.sessionStorage.getItem('robotech_ide_last_code') ?? '';
  }

  private scheduleCloudAutosave(): void {
    this.circuit.scheduleAutosave({
      projectId: this.projectId,
      circuitGraph: {
        components: this.components(),
        connections: this.connections()
      },
      codeString: this.readLastIdeCodeSnapshot()
    });
  }

  private addKit(kitId: string, dropX?: number, dropY?: number): void {
    const item = this.kitItems.find(i => i.id === kitId);
    if (!item) return;
    this.saveHistory();
    const comp = this.makeComponent(item, dropX ?? 80, dropY ?? 80);
    this.components.update(cs => [...cs, comp]);
    this.rebuildAutoConnections();
    this.persist();
  }

  private makeComponent(item: KitItem, x: number, y: number): Lab2dComponent {
    const isCtrl = item.id === 'arduino-uno-r3';
    return {
      id:    `${item.id}-${Date.now().toString(36)}`,
      kitId: item.id,
      label: item.title,
      x, y,
      w: isCtrl ? 200 : 160,
      h: isCtrl ? 256 : 88,
      ports: this.makePorts(item)
    };
  }

  private makePorts(item: KitItem): LabPort[] {
    if (item.category === 'MECANICA' || item.category === 'CABLEADO') return [];
    if (item.id === 'arduino-uno-r3') {
      return [
        { id: 'P0', side: 'right', offset: 0.2, active: true },
        { id: 'P1', side: 'right', offset: 0.5, active: true },
        { id: 'P2', side: 'right', offset: 0.8, active: true }
      ];
    }
    return [{ id: 'P0', side: 'left', offset: 0.5, active: true }];
  }

  /**
   * Derives auto-wired connections from component presence and preserves
   * any manually drawn connections (id starts with 'manual-').
   */
  private rebuildAutoConnections(): void {
    const comps   = this.components();
    const ctrl    = comps.find(c => c.kitId === 'arduino-uno-r3');
    const motors  = comps.filter(c => c.kitId === 'l298n');
    const sensors = comps.filter(c => c.kitId === 'tcrt5000');

    const manual = this.connections().filter(c => c.id.startsWith('manual-'));
    const auto: Lab2dConnection[] = [];
    const edges: { from: string; to: string }[] = [];

    if (ctrl) {
      motors.slice(0, 1).forEach(m => {
        auto.push({ id: `auto-${ctrl.id}-${m.id}`, fromComp: ctrl.id, fromPort: 'P0', toComp: m.id, toPort: 'P0' });
        edges.push({ from: ctrl.id, to: m.id });
      });
      sensors.slice(0, 2).forEach((s, i) => {
        const port = `P${i + 1}`;
        auto.push({ id: `auto-${ctrl.id}-${s.id}`, fromComp: ctrl.id, fromPort: port, toComp: s.id, toPort: 'P0' });
        edges.push({ from: ctrl.id, to: s.id });
      });
    }

    this.connections.set([...auto, ...manual]);
    this.runHardwareValidation(edges);
  }

  private runHardwareValidation(edges: { from: string; to: string }[]): void {
    const nodes = this.components().map(c => ({ id: c.id, kitId: c.kitId, label: c.label }));
    this.hardwareReport = this.hardwareValidation.validate(nodes, edges);
    this.sysOrchestrator.orchestrateHardwareValidation(
      this.hardwareReport.valid,
      this.hardwareReport.score
    );
  }

  private defaultScene(): Lab2dComponent[] {
    return [
      { id: 'arduino-uno-r3-1',    kitId: 'arduino-uno-r3', label: 'ARDUINO UNO R3',  x: 170, y: 80,  w: 200, h: 256, ports: [{ id: 'P0', side: 'right', offset: 0.2, active: true }, { id: 'P1', side: 'right', offset: 0.5, active: true }, { id: 'P2', side: 'right', offset: 0.8, active: true }] },
      { id: 'l298n-1',             kitId: 'l298n',           label: 'L298N',           x: 470, y: 28,  w: 160, h: 88,  ports: [{ id: 'P0', side: 'left',  offset: 0.5, active: true }] },
      { id: 'tcrt5000-left-1',     kitId: 'tcrt5000',        label: 'TCRT5000 (IZQ)',  x: 450, y: 160, w: 160, h: 88,  ports: [{ id: 'P0', side: 'left',  offset: 0.5, active: true }] },
      { id: 'tcrt5000-right-1',    kitId: 'tcrt5000',        label: 'TCRT5000 (DER)',  x: 450, y: 270, w: 160, h: 88,  ports: [{ id: 'P0', side: 'left',  offset: 0.5, active: true }] }
    ];
  }

  private templateFor(project: { courseSlug?: string } | undefined): Lab2dComponent[] {
    return project?.courseSlug === 'robot-seguidor-de-linea' ? this.defaultScene() : [];
  }

  private persist(): void {
    this.sysOrchestrator.orchestrateLabPersist(this.projectId, this.components().length);
    if (this.projectId) {
      this.workspaceSvc.set(this.projectId, {
        components: this.components(),
        connections: this.connections()
      });
      this.projectsSvc.touch(this.projectId);
    }
    this.scheduleCloudAutosave();
  }
}
