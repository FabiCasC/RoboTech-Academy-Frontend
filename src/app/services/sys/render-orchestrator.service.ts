import { Injectable, signal } from '@angular/core';

export type SysEngineId = 'hardware-graph' | 'software-syntax' | 'p5-render' | 'persistence';

export interface SysEngineEvent {
  engine: SysEngineId;
  action: string;
  status: 'ok' | 'warn' | 'error';
  detail: string;
  timestamp: number;
}

/**
 * SYS-ROLE · Orquestador de persistencia y renderizado p5.js.
 */
@Injectable({ providedIn: 'root' })
export class RenderOrchestratorService {
  private readonly maxLog = 40;
  private readonly eventLog = signal<SysEngineEvent[]>([]);

  readonly events = this.eventLog.asReadonly();

  log(engine: SysEngineId, action: string, status: SysEngineEvent['status'], detail: string): void {
    const entry: SysEngineEvent = {
      engine,
      action,
      status,
      detail,
      timestamp: Date.now()
    };
    this.eventLog.update((list) => [entry, ...list].slice(0, this.maxLog));
  }

  orchestrateLabPersist(projectId: string | null, componentCount: number): void {
    this.log(
      'persistence',
      'lab_workspace_save',
      projectId ? 'ok' : 'warn',
      projectId
        ? `Workspace guardado · ${componentCount} componente(s)`
        : 'Sin projectId: persistencia local omitida'
    );
  }

  orchestrateP5View(mode: '2d' | '3d', kitId?: string): void {
    this.log(
      'p5-render',
      'view_switch',
      'ok',
      mode === '3d'
        ? `Escena WEBGL · ${kitId ?? 'ensamblaje completo'}`
        : 'Vista esquemática 2D'
    );
  }

  orchestrateHardwareValidation(valid: boolean, score: number): void {
    this.log(
      'hardware-graph',
      'circuit_validate',
      valid ? 'ok' : 'error',
      `Score ${score}% · grafo analizado`
    );
  }

  orchestrateSoftwareValidation(valid: boolean, score: number): void {
    this.log(
      'software-syntax',
      'code_validate',
      valid ? 'ok' : 'error',
      `Score ${score}% · análisis sintáctico`
    );
  }

  clearLog(): void {
    this.eventLog.set([]);
  }
}
