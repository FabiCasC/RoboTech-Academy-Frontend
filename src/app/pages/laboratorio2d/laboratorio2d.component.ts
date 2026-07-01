import { Component, OnInit, inject, PLATFORM_ID, signal, computed } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { of, forkJoin } from 'rxjs';
import { catchError } from 'rxjs/operators';
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
import { KitService } from '../../services/kit.service';
import { ProjectsApiService } from '../../core/api/projects-api.service';
import { buildCourseLabTemplate } from '../../core/lab/course-lab-template';
import { kitCardSizeFor, labPortsFromKitId } from '../../core/lab/lab-kit-layout';
import { resolvePortSpec, getComponentPorts } from '../../components/p5-kit-viewer/kit-compatibility';
import {
  mapComponentsToLab2d,
  mapConnectionsToLab2d
} from '../../core/api/submission.mapper';
import { extractHttpErrorMessage } from '../../core/api/http-error.util';
import { P5RobotSimulatorComponent } from '../../components/p5-robot-simulator/p5-robot-simulator.component';
import { DEFAULT_ARDUINO_SKETCH } from '../../core/lab/arduino-highlight.util';
import type { ValidationResult } from '../../core/models/circuit-validation.models';

const SESSION_CODE_KEY = 'robotech_ide_last_code';

export interface Telemetry { pwr: string; lat: string; status: string; }

// Re-export so templates that import this component can reference the types
export type { Lab2dComponent, Lab2dConnection };

const MOTOR_KIT_IDS = new Set(['dc-motor', 'motores-dc', 'motor-dc-gear-6v']);

@Component({
  selector: 'app-laboratorio2d',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    P5KitViewerComponent,
    P5LabSceneComponent,
    P5Lab2dCanvasComponent,
    P5RobotSimulatorComponent
  ],
  templateUrl: './laboratorio2d.component.html',
  styleUrls: ['./laboratorio2d.component.css'],
})
export class Laboratorio2dComponent implements OnInit {

  private readonly route            = inject(ActivatedRoute);
  private readonly workspaceSvc     = inject(LabWorkspaceService);
  private readonly projectsSvc      = inject(LabProjectsService);
  private readonly hardwareValidation = inject(HardwareValidationService);
  private readonly sysOrchestrator  = inject(RenderOrchestratorService);
  readonly circuit = inject(CircuitService);
  private readonly kitApi         = inject(KitService);
  private readonly projectsApi    = inject(ProjectsApiService);
  private readonly platformId       = inject(PLATFORM_ID);

  // ── UI state ──────────────────────────────────────────────────────────────

  workspaceName  = 'SCHEMATIC_01';
  zoom           = 100;
  activeTool: 'pan' | 'select' = 'select';
  viewMode: '2d' | '3d'        = '2d';
  paletteOpen    = true;
  projectId: string | null = null;
  courseSlug: string | null = null;
  selectedKitId  = 'arduino-uno-r3';

  readonly isCourseLab = signal(false);
  readonly savingWorkspace = signal(false);
  readonly submittingLab = signal(false);
  readonly workspaceMessage = signal<string | null>(null);
  readonly workspaceError = signal<string | null>(null);
  readonly submitted = signal(false);

  readonly idePanelOpen = signal(false);
  readonly ideValidating = signal(false);
  readonly ideValidationResult = signal<ValidationResult | null>(null);
  readonly ideError = signal<string | null>(null);

  ideFirmwareCode = DEFAULT_ARDUINO_SKETCH;

  readonly ideHardwareFaults = computed(() =>
    (this.ideValidationResult()?.faults ?? []).filter((f) => f.layer === 'HARDWARE')
  );

  readonly ideFirmwareFaults = computed(() =>
    (this.ideValidationResult()?.faults ?? []).filter((f) => f.layer === 'FIRMWARE')
  );

  readonly ideOtherFaults = computed(() =>
    (this.ideValidationResult()?.faults ?? []).filter((f) => f.layer === 'UNKNOWN')
  );

  readonly ideValidationPassed = computed(() => {
    const r = this.ideValidationResult();
    return !!r && r.valid && r.simulationReady;
  });

  readonly kitItems = signal<KitItem[]>(KIT_CATALOG);
  telemetry: Telemetry = { pwr: '5.0V / 2.1A', lat: '12ms', status: 'NOMINAL' };
  hardwareReport: HardwareValidationResult | null = null;

  // ── Reactive state (Angular Signals) ──────────────────────────────────────

  readonly components  = signal<Lab2dComponent[]>([]);
  readonly connections = signal<Lab2dConnection[]>([]);
  readonly selectedId  = signal<string | null>(null);

  private history: Lab2dComponent[][] = [];

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.kitApi.getCatalog().subscribe({
      next: (items) => {
        if (Array.isArray(items) && items.length > 0) {
          this.kitItems.set(items);
        }
      },
      error: () => {
        /* catálogo local por defecto */
      }
    });

    this.projectId = this.route.snapshot.queryParamMap.get('projectId');
    this.courseSlug = this.route.snapshot.queryParamMap.get('courseSlug');
    const isNew = this.route.snapshot.queryParamMap.get('new') === 'true';
    const simToken = this.route.snapshot.queryParamMap.get('token');
    if (simToken) {
      this.circuit.adoptApprovalToken(simToken);
    }

    if (this.projectId) {
      this.loadProjectLab(this.projectId);
    } else if (isNew) {
      this.initEmptyLab('NUEVO_ESQUEMATICO');
    } else {
      this.initEmptyLab('SCHEMATIC_01');
    }

    const addKitId = this.route.snapshot.queryParamMap.get('add');
    if (addKitId) {
      this.selectKit(addKitId);
      this.addKit(addKitId);
    }
  }

  /** Guardar progreso (laboratorio libre). */
  saveWorkspace(): void {
    if (!this.projectId || this.savingWorkspace()) return;
    this.persistToServer(false);
  }

  /** Entregar laboratorio de curso (`submitted: true` → Firestore vía backend). */
  submitCourseLab(): void {
    if (!this.projectId || !this.isCourseLab() || this.submittingLab()) return;
    this.persistToServer(true);
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
      this.openIdePanel();
    }
  }

  openIdePanel(): void {
    const cached = this.readLastIdeCodeSnapshot();
    this.ideFirmwareCode = cached.trim().length > 0 ? cached : DEFAULT_ARDUINO_SKETCH;
    this.ideValidationResult.set(null);
    this.ideError.set(null);
    this.idePanelOpen.set(true);
  }

  closeIdePanel(): void {
    this.persistIdeCodeSnapshot();
    this.idePanelOpen.set(false);
  }

  onIdeCodeInput(): void {
    this.persistIdeCodeSnapshot();
  }

  validateAndSimulate(): void {
    if (this.ideValidating()) return;

    this.ideValidating.set(true);
    this.ideError.set(null);
    this.ideValidationResult.set(null);
    this.persistIdeCodeSnapshot();

    this.circuit
      .validateCircuit(
        { components: this.components(), connections: this.connections() },
        this.ideFirmwareCode
      )
      .subscribe({
        next: (result) => {
          this.ideValidating.set(false);
          this.ideValidationResult.set(result);
        },
        error: (err) => {
          this.ideValidating.set(false);
          this.ideError.set(extractHttpErrorMessage(err));
        }
      });
  }

  onKitDragStart(event: DragEvent, kitId: string): void {
    event.dataTransfer?.setData('text/plain', kitId);
    event.dataTransfer?.setData('application/x-kit-id', kitId);
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

  stopBackendSimulation(): void {
    this.circuit.stopSimulation();
  }

  firmwareSnapshot(): string {
    return this.ideFirmwareCode || this.readLastIdeCodeSnapshot();
  }

  // ── Private helpers ───────────────────────────────────────────────────────

  private loadProjectLab(projectId: string): void {
    const cached = this.projectsSvc.getById(projectId);
    this.workspaceName = cached?.title ?? `LAB_${projectId}`;
    this.isCourseLab.set(
      !!(this.courseSlug ?? cached?.courseSlug ?? cached?.kind === 'COURSE')
    );
    if (cached?.submitted) this.submitted.set(true);

    const stored = this.workspaceSvc.get(projectId);
    if (stored?.components?.length) {
      this.applyWorkspace(
        stored.components as Lab2dComponent[],
        (stored.connections as Lab2dConnection[] | undefined) ?? []
      );
      this.projectsSvc.fetchOne(projectId).subscribe({
        next: (p) => this.applyProjectMeta(p)
      });
      return;
    }

    forkJoin({
      project: this.projectsSvc.fetchOne(projectId).pipe(catchError(() => of(null))),
      workspace: this.projectsApi.getWorkspace(projectId).pipe(catchError(() => of(null)))
    }).subscribe(({ project, workspace }) => {
      if (project) this.applyProjectMeta(project);

      if (workspace?.components?.length) {
        this.applyWorkspace(
          mapComponentsToLab2d(workspace.components),
          mapConnectionsToLab2d(workspace.connections)
        );
        return;
      }
      if (this.isCourseLab()) {
        this.applyCourseTemplate(true);
      } else {
        this.initEmptyLab(this.workspaceName);
      }
    });
  }

  private applyProjectMeta(p: {
    title: string;
    courseSlug?: string;
    kind: string;
    submitted?: boolean;
  }): void {
    this.workspaceName = p.title;
    this.courseSlug = this.courseSlug ?? p.courseSlug ?? null;
    this.isCourseLab.set(p.kind === 'COURSE' || !!this.courseSlug);
    if (p.submitted) this.submitted.set(true);
  }

  private applyWorkspace(components: Lab2dComponent[], connections: Lab2dConnection[]): void {
    this.components.set(components);
    this.connections.set(connections);
    this.rebuildAutoConnections();
    this.persistLocal();
  }

  private applyCourseTemplate(syncServer = false): void {
    const tpl = buildCourseLabTemplate();
    this.components.set(tpl.components);
    this.connections.set(tpl.connections);
    this.rebuildAutoConnections();
    this.persistLocal();
    if (syncServer && this.projectId) {
      this.persistToServer(false, true);
    }
  }

  private initEmptyLab(name: string): void {
    this.workspaceName = name;
    this.components.set([]);
    this.connections.set([]);
    this.rebuildAutoConnections();
    this.persistLocal();
  }

  private persistToServer(submit: boolean, silent = false): void {
    if (!this.projectId) return;

    if (submit) {
      this.submittingLab.set(true);
    } else {
      this.savingWorkspace.set(true);
    }
    if (!silent) {
      this.workspaceError.set(null);
      this.workspaceMessage.set(null);
    }

    this.persistLocal();

    this.projectsSvc
      .saveWorkspace(this.projectId, {
        components: this.components(),
        connections: this.connections(),
        firmwareCode: this.ideFirmwareCode || this.readLastIdeCodeSnapshot(),
        submitted: submit ? true : undefined
      })
      .subscribe({
        next: () => {
          this.savingWorkspace.set(false);
          this.submittingLab.set(false);
          if (submit) {
            this.submitted.set(true);
            this.workspaceMessage.set('Laboratorio entregado correctamente.');
          } else if (!silent) {
            this.workspaceMessage.set('Progreso guardado en el servidor.');
          }
        },
        error: (err) => {
          this.savingWorkspace.set(false);
          this.submittingLab.set(false);
          if (!silent) {
            this.workspaceError.set(extractHttpErrorMessage(err));
          }
        }
      });
  }

  private saveHistory(): void {
    this.history.push(this.components().map(c => ({ ...c, ports: c.ports.map(p => ({ ...p })) })));
    if (this.history.length > 20) this.history.shift();
  }

  private readLastIdeCodeSnapshot(): string {
    if (!isPlatformBrowser(this.platformId)) return '';
    return window.sessionStorage.getItem(SESSION_CODE_KEY) ?? '';
  }

  private persistIdeCodeSnapshot(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    window.sessionStorage.setItem(SESSION_CODE_KEY, this.ideFirmwareCode);
  }

  private scheduleCloudAutosave(): void {
    this.circuit.scheduleAutosave({
      projectId: this.projectId,
      circuitGraph: {
        components: this.components(),
        connections: this.connections()
      },
      codeString: this.ideFirmwareCode || this.readLastIdeCodeSnapshot()
    });
  }

  private addKit(kitId: string, dropX?: number, dropY?: number): void {
    const item = this.kitItems().find(i => i.id === kitId);
    if (!item) return;
    this.saveHistory();
    const comp = this.makeComponent(item, dropX ?? 80, dropY ?? 80);
    this.components.update(cs => [...cs, comp]);
    this.rebuildAutoConnections();
    this.persist();
  }

  private makeComponent(item: KitItem, x: number, y: number): Lab2dComponent {
    const size = kitCardSizeFor(item.id);
    return {
      id: `${item.id}-${Date.now().toString(36)}`,
      kitId: item.id,
      label: item.title,
      x,
      y,
      w: size.w,
      h: size.h,
      ports: labPortsFromKitId(item.id)
    };
  }

  private tryAutoConnection(
    from: Lab2dComponent,
    fromPort: string,
    to: Lab2dComponent,
    toPort: string
  ): Lab2dConnection | null {
    if (!resolvePortSpec(from.kitId, fromPort) || !resolvePortSpec(to.kitId, toPort)) {
      return null;
    }
    if (!from.ports.some((p) => p.id === fromPort) || !to.ports.some((p) => p.id === toPort)) {
      return null;
    }
    return {
      id: `auto-${from.id}-${to.id}-${fromPort}-${toPort}`,
      fromComp: from.id,
      fromPort,
      toComp: to.id,
      toPort
    };
  }

  /**
   * Derives auto-wired connections from component presence and preserves
   * any manually drawn connections (id starts with 'manual-').
   */
  private rebuildAutoConnections(): void {
    const comps = this.components();
    const ctrl = comps.find((c) => c.kitId === 'arduino-uno-r3');
    const drivers = comps.filter((c) => c.kitId === 'l298n');
    const sensors = comps.filter((c) => c.kitId === 'tcrt5000');
    const usb = comps.find((c) => c.kitId === 'usb-b');
    const battery = comps.find((c) => c.kitId === 'battery-holder-4aa');
    const chassis = comps.find((c) => c.kitId === 'acrylic-chassis');
    const motors = comps.filter((c) => MOTOR_KIT_IDS.has(c.kitId));
    const wheels = comps.filter((c) => c.kitId === 'wheel-65mm');

    const manual = this.connections().filter((c) => c.id.startsWith('manual-'));
    const auto: Lab2dConnection[] = [];
    const edges: { from: string; to: string }[] = [];
    const usedMech = new Set<string>();

    const pushEdge = (edge: Lab2dConnection | null): void => {
      if (!edge) return;
      auto.push(edge);
      edges.push({ from: edge.fromComp, to: edge.toComp });
    };

    const claimChassisMount = (): string | null => {
      if (!chassis) return null;
      for (const port of getComponentPorts('acrylic-chassis').filter((p) => p.type === 'MECHANICAL')) {
        const key = `${chassis.id}:${port.id}`;
        if (!usedMech.has(key)) {
          usedMech.add(key);
          return port.id;
        }
      }
      return null;
    };

    if (ctrl) {
      const driver = drivers[0];
      if (driver) {
        pushEdge(this.tryAutoConnection(ctrl, 'D2', driver, 'IN1'));
        pushEdge(this.tryAutoConnection(ctrl, 'D3', driver, 'IN2'));
      }

      const sensorPins = ['D8', 'D9'] as const;
      sensors.slice(0, 2).forEach((sensor, i) => {
        pushEdge(this.tryAutoConnection(ctrl, sensorPins[i], sensor, 'OUT'));
      });
    }

    if (usb && ctrl) {
      pushEdge(this.tryAutoConnection(usb, 'VBUS', ctrl, '5V'));
    }

    const driver = drivers[0];
    if (battery && driver) {
      pushEdge(this.tryAutoConnection(battery, '+', driver, '12V'));
      pushEdge(this.tryAutoConnection(battery, '−', driver, 'GND'));
    }

    if (chassis) {
      for (const motor of motors) {
        const mount = claimChassisMount();
        if (mount) {
          pushEdge(this.tryAutoConnection(motor, 'M+', chassis, mount));
        }
      }
    }

    for (const wheel of wheels) {
      if (!motors.length) continue;
      let nearest = motors[0];
      let minDist = Infinity;
      for (const motor of motors) {
        const d = Math.hypot(motor.x - wheel.x, motor.y - wheel.y);
        if (d < minDist) {
          minDist = d;
          nearest = motor;
        }
      }
      pushEdge(this.tryAutoConnection(wheel, 'HUB', nearest, 'M+'));
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

  private persistLocal(): void {
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

  private persist(): void {
    this.persistLocal();
  }
}
