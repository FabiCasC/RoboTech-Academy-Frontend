import { Component, inject } from '@angular/core';
import type { SysEngineEvent } from '../../services/sys/render-orchestrator.service';
import { CommonModule, DatePipe } from '@angular/common';
import { RenderOrchestratorService } from '../../services/sys/render-orchestrator.service';
import { HardwareValidationService } from '../../services/sys/hardware-validation.service';
import { SoftwareValidationService } from '../../services/sys/software-validation.service';
import { ROLE_PROFILES } from '../../core/models/system-roles.models';

@Component({
  selector: 'app-sistema-monitoreo',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './sistema-monitoreo.component.html',
  styleUrl: './sistema-monitoreo.component.css'
})
export class SistemaMonitoreoComponent {
  private readonly orchestrator = inject(RenderOrchestratorService);
  private readonly hardware = inject(HardwareValidationService);
  private readonly software = inject(SoftwareValidationService);

  readonly profile = ROLE_PROFILES['SYS-ROLE'];
  readonly events = this.orchestrator.events;

  readonly engines = [
    {
      id: 'hardware-graph',
      title: 'Validación hardware',
      desc: 'Análisis de grafos del circuito virtual'
    },
    {
      id: 'software-syntax',
      title: 'Validación software',
      desc: 'Analizador sintáctico del IDE'
    },
    {
      id: 'p5-render',
      title: 'Render p5.js',
      desc: 'Orquestación WEBGL / vista 2D'
    },
    {
      id: 'persistence',
      title: 'Persistencia',
      desc: 'Workspace y proyectos del laboratorio'
    }
  ];

  getLastEvent(engineId: string): SysEngineEvent | undefined {
    return this.events().find((ev) => ev.engine === engineId);
  }

  runHardwareDemo(): void {
    const result = this.hardware.validate(
      [
        { id: 'a1', kitId: 'arduino-uno-r3', label: 'Arduino' },
        { id: 'm1', kitId: 'l298n', label: 'L298N' }
      ],
      [{ from: 'a1', to: 'm1' }]
    );
    this.orchestrator.orchestrateHardwareValidation(result.valid, result.score);
  }

  runSoftwareDemo(): void {
    const sample = `void setup() {}
void loop() { delay(100); }`;
    const result = this.software.validate(sample);
    this.orchestrator.orchestrateSoftwareValidation(result.valid, result.score);
  }

  clearLog(): void {
    this.orchestrator.clearLog();
  }

  statusIcon(status: string): string {
    if (status === 'ok') return 'check_circle';
    if (status === 'warn') return 'warning';
    return 'error';
  }
}
