import { Component, ElementRef, ViewChild, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { KIT_CATALOG } from '../componentes/data/kit-catalog.data';
import type { KitItem } from '../componentes/models/kit.models';
import { ThreeKitViewerComponent } from '../../components/three-kit-viewer/three-kit-viewer.component';
import { LabWorkspaceService } from '../../services/lab-workspace.service';
import { LabProjectsService } from '../../services/lab-projects.service';

export interface SchematicPort { active: boolean; }

export interface SchematicComponent {
  id: string;
  kitId: string;
  label: string;
  x: number; y: number;
  w: number; h: number;
  ports: SchematicPort[];
}

export interface Connection { from: string; to: string; path: string; }
export interface Telemetry { pwr: string; lat: string; status: string; }

@Component({
  selector: 'app-laboratorio2d',
  standalone: true,
  imports: [CommonModule, ThreeKitViewerComponent],
  templateUrl: './laboratorio2d.component.html',
  styleUrls: ['./laboratorio2d.component.css'],
})
export class Laboratorio2dComponent implements OnInit {
  @ViewChild('workspace') workspaceRef!: ElementRef<HTMLDivElement>;

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly workspace = inject(LabWorkspaceService);
  private readonly projects = inject(LabProjectsService);

  workspaceName = 'SCHEMATIC_01';
  zoom = 100;
  activeTool: 'pan' | 'select' = 'select';
  selectedId: string | null = null;
  selectedKitId: string | null = 'arduino-uno-r3';
  projectId: string | null = null;

  telemetry: Telemetry = { pwr: '5.0V / 2.1A', lat: '12ms', status: 'NOMINAL' };

  readonly kitItems: KitItem[] = KIT_CATALOG;

  components: SchematicComponent[] = [
    {
      id: 'arduino-uno-r3-1',
      kitId: 'arduino-uno-r3',
      label: 'ARDUINO UNO R3',
      x: 170,
      y: 80,
      w: 200,
      h: 256,
      ports: [{ active: true }, { active: true }, { active: true }]
    },
    {
      id: 'l298n-1',
      kitId: 'l298n',
      label: 'L298N',
      x: 470,
      y: 28,
      w: 160,
      h: 88,
      ports: [{ active: true }]
    },
    {
      id: 'tcrt5000-left-1',
      kitId: 'tcrt5000',
      label: 'TCRT5000 (IZQ)',
      x: 450,
      y: 160,
      w: 160,
      h: 88,
      ports: [{ active: true }]
    },
    {
      id: 'tcrt5000-right-1',
      kitId: 'tcrt5000',
      label: 'TCRT5000 (DER)',
      x: 450,
      y: 270,
      w: 160,
      h: 88,
      ports: [{ active: true }]
    }
  ];

  connections: Connection[] = [];

  private dragging: SchematicComponent | null = null;
  private dragOffsetX = 0;
  private dragOffsetY = 0;
  private history: SchematicComponent[][] = [];

  // Para distinguir drag de click
  private dragMoved = false;

  ngOnInit(): void {
    this.projectId = this.route.snapshot.queryParamMap.get('projectId');
    const isNew = this.route.snapshot.queryParamMap.get('new') === 'true';

    if (this.projectId) {
      const project = this.projects.getById(this.projectId);
      this.workspaceName = project?.title ?? `LAB_${this.projectId}`;

      const stored = this.workspace.get(this.projectId);
      if (stored) {
        this.components = (stored.components as SchematicComponent[]) ?? [];
        this.connections = (stored.connections as Connection[]) ?? [];
      } else {
        this.components = this.createTemplateForProject(project);
        this.connections = [];
      }
      this.buildConnections();
      this.persist();
    } else if (isNew) {
      this.components = [];
      this.connections = [];
      this.workspaceName = 'NUEVO_ESQUEMATICO';
    } else {
      this.buildConnections();
    }

    const addKitId = this.route.snapshot.queryParamMap.get('add');
    if (addKitId) {
      this.selectKit(addKitId);
      this.addSelectedKit();
    }
  }

  setTool(tool: 'pan' | 'select'): void { this.activeTool = tool; }

  // Doble click en CTRL_UNIT → navega al IDE
  openIDE(compId: string): void {
    const comp = this.components.find((c) => c.id === compId);
    if (comp?.kitId === 'arduino-uno-r3') {
      void this.router.navigate(['/ide-programacion']);
    }
  }

  startDrag(event: MouseEvent, comp: SchematicComponent): void {
    if (this.activeTool !== 'select') return;
    this.selectedId = comp.id;
    this.dragging = comp;
    this.dragMoved = false;
    const wsRect = this.workspaceRef.nativeElement.getBoundingClientRect();
    this.dragOffsetX = event.clientX - (wsRect.left + comp.x);
    this.dragOffsetY = event.clientY - (wsRect.top + comp.y);
    this.saveHistory();
    event.preventDefault();
  }

  onMouseMove(event: MouseEvent): void {
    if (!this.dragging) return;
    this.dragMoved = true;
    const wsRect = this.workspaceRef.nativeElement.getBoundingClientRect();
    this.dragging.x = Math.max(0, event.clientX - wsRect.left - this.dragOffsetX);
    this.dragging.y = Math.max(0, event.clientY - wsRect.top - this.dragOffsetY);
    this.buildConnections();
    this.persist();
  }

  onMouseUp(): void {
    this.dragging = null;
    this.persist();
  }

  undo(): void {
    if (this.history.length === 0) return;
    this.components = this.history.pop()!;
    this.buildConnections();
    this.persist();
  }

  deleteSelected(): void {
    if (!this.selectedId) return;
    this.saveHistory();
    this.components = this.components.filter(c => c.id !== this.selectedId);
    this.selectedId = null;
    this.buildConnections();
    this.persist();
  }

  selectKit(kitId: string): void {
    this.selectedKitId = kitId;
  }

  addSelectedKit(): void {
    const kitId = this.selectedKitId;
    if (!kitId) return;
    const item = this.kitItems.find((i) => i.id === kitId);
    if (!item) return;

    this.saveHistory();
    this.components = [...this.components, this.createComponentFromKit(item)];
    this.buildConnections();
    this.persist();
  }

  private createComponentFromKit(item: KitItem): SchematicComponent {
    const baseId = `${item.id}-${Date.now().toString(36)}-${Math.floor(Math.random() * 1000)}`;
    const isController = item.id === 'arduino-uno-r3';

    const w = isController ? 200 : 160;
    const h = isController ? 256 : 88;

    const ports =
      item.category === 'MECANICA' || item.category === 'CABLEADO'
        ? []
        : item.category === 'MICROCONTROLADOR'
          ? [{ active: true }, { active: true }, { active: true }]
          : [{ active: true }];

    return {
      id: baseId,
      kitId: item.id,
      label: item.title,
      x: 60,
      y: 80,
      w,
      h,
      ports
    };
  }

  private saveHistory(): void {
    this.history.push(this.components.map(c => ({ ...c, ports: [...c.ports] })));
  }

  private buildConnections(): void {
    const ctrl = this.components.find((c) => c.kitId === 'arduino-uno-r3');
    const motor = this.components.find((c) => c.kitId === 'l298n');
    const irSensors = this.components.filter((c) => c.kitId === 'tcrt5000');
    this.connections = [];

    if (ctrl && motor) {
      const x1 = ctrl.x + ctrl.w, y1 = ctrl.y + 23;
      const x2 = motor.x,         y2 = motor.y + motor.h / 2;
      const mx = (x1 + x2) / 2;
      this.connections.push({ from: ctrl.id, to: motor.id,
        path: `M${x1} ${y1} C${mx} ${y1} ${mx} ${y2} ${x2} ${y2}` });
    }

    if (ctrl) {
      irSensors.slice(0, 2).forEach((ir, index) => {
        const y1 = ctrl.y + 55 + index * 32;
        const x1 = ctrl.x + ctrl.w;
        const x2 = ir.x;
        const y2 = ir.y + ir.h / 2;
        const mx = (x1 + x2) / 2;
        this.connections.push({
          from: ctrl.id,
          to: ir.id,
          path: `M${x1} ${y1} C${mx} ${y1} ${mx} ${y2} ${x2} ${y2}`
        });
      });
    }
  }

  private createTemplateForProject(project: { courseSlug?: string } | undefined): SchematicComponent[] {
    if (project?.courseSlug === 'robot-seguidor-de-linea') {
      return [
        {
          id: 'arduino-uno-r3-1',
          kitId: 'arduino-uno-r3',
          label: 'ARDUINO UNO R3',
          x: 170,
          y: 80,
          w: 200,
          h: 256,
          ports: [{ active: true }, { active: true }, { active: true }]
        },
        {
          id: 'l298n-1',
          kitId: 'l298n',
          label: 'L298N',
          x: 470,
          y: 28,
          w: 160,
          h: 88,
          ports: [{ active: true }]
        },
        {
          id: 'tcrt5000-left-1',
          kitId: 'tcrt5000',
          label: 'TCRT5000 (IZQ)',
          x: 450,
          y: 160,
          w: 160,
          h: 88,
          ports: [{ active: true }]
        },
        {
          id: 'tcrt5000-right-1',
          kitId: 'tcrt5000',
          label: 'TCRT5000 (DER)',
          x: 450,
          y: 270,
          w: 160,
          h: 88,
          ports: [{ active: true }]
        }
      ];
    }

    return [];
  }

  private persist(): void {
    if (!this.projectId) return;
    this.workspace.set(this.projectId, { components: this.components, connections: this.connections });
    this.projects.touch(this.projectId);
  }
}
