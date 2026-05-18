import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface SchematicPort { active: boolean; }

export interface SchematicComponent {
  id: string;
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
  imports: [CommonModule],
  templateUrl: './laboratorio2d.component.html',
  styleUrls: ['./laboratorio2d.component.css'],
})
export class Laboratorio2dComponent implements OnInit {
  @ViewChild('workspace') workspaceRef!: ElementRef<HTMLDivElement>;

  workspaceName = 'SCHEMATIC_01';
  zoom = 100;
  activeTab: 'play' | 'debug' | 'save' = 'debug';
  activeTool: 'pan' | 'select' = 'select';
  selectedId: string | null = null;

  telemetry: Telemetry = { pwr: '5.0V / 2.1A', lat: '12ms', status: 'NOMINAL' };

  components: SchematicComponent[] = [
    {
      id: 'ctrl_unit', label: 'CTRL_UNIT',
      x: 170, y: 80, w: 165, h: 256,
      ports: [{ active: true }, { active: false }, { active: false }],
    },
    {
      id: 'motor_drv_a', label: 'MOTOR_DRV_A',
      x: 460, y: 20, w: 140, h: 72,
      ports: [{ active: false }],
    },
    {
      id: 'ir_sens_01', label: 'IR_SENS_01',
      x: 440, y: 160, w: 135, h: 96,
      ports: [{ active: true }],
    },
  ];

  connections: Connection[] = [];

  private dragging: SchematicComponent | null = null;
  private dragOffsetX = 0;
  private dragOffsetY = 0;
  private history: SchematicComponent[][] = [];

  ngOnInit(): void { this.buildConnections(); }

  setTool(tool: 'pan' | 'select'): void { this.activeTool = tool; }

  startDrag(event: MouseEvent, comp: SchematicComponent): void {
    if (this.activeTool !== 'select') return;
    this.selectedId = comp.id;
    this.dragging = comp;
    const wsRect = this.workspaceRef.nativeElement.getBoundingClientRect();
    this.dragOffsetX = event.clientX - (wsRect.left + comp.x);
    this.dragOffsetY = event.clientY - (wsRect.top + comp.y);
    this.saveHistory();
    event.preventDefault();
  }

  onMouseMove(event: MouseEvent): void {
    if (!this.dragging) return;
    const wsRect = this.workspaceRef.nativeElement.getBoundingClientRect();
    this.dragging.x = Math.max(0, event.clientX - wsRect.left - this.dragOffsetX);
    this.dragging.y = Math.max(0, event.clientY - wsRect.top - this.dragOffsetY);
    this.buildConnections();
  }

  onMouseUp(): void { this.dragging = null; }

  undo(): void {
    if (this.history.length === 0) return;
    this.components = this.history.pop()!;
    this.buildConnections();
  }

  deleteSelected(): void {
    if (!this.selectedId) return;
    this.saveHistory();
    this.components = this.components.filter(c => c.id !== this.selectedId);
    this.selectedId = null;
    this.buildConnections();
  }

  private saveHistory(): void {
    this.history.push(this.components.map(c => ({ ...c, ports: [...c.ports] })));
  }

  private buildConnections(): void {
    const ctrl  = this.components.find(c => c.id === 'ctrl_unit');
    const motor = this.components.find(c => c.id === 'motor_drv_a');
    const ir    = this.components.find(c => c.id === 'ir_sens_01');
    this.connections = [];

    if (ctrl && motor) {
      // Puerto derecho de ctrl → puerto izquierdo de motor
      const x1 = ctrl.x + ctrl.w, y1 = ctrl.y + 23;
      const x2 = motor.x,         y2 = motor.y + motor.h / 2;
      const mx = (x1 + x2) / 2;
      this.connections.push({ from: 'ctrl_unit', to: 'motor_drv_a',
        path: `M${x1} ${y1} C${mx} ${y1} ${mx} ${y2} ${x2} ${y2}` });
    }

    if (ctrl && ir) {
      // Puerto derecho de ctrl → puerto izquierdo de ir
      const x1 = ctrl.x + ctrl.w, y1 = ctrl.y + 55;
      const x2 = ir.x,            y2 = ir.y + ir.h / 2;
      const mx = (x1 + x2) / 2;
      this.connections.push({ from: 'ctrl_unit', to: 'ir_sens_01',
        path: `M${x1} ${y1} C${mx} ${y1} ${mx} ${y2} ${x2} ${y2}` });
    }
  }
}