import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  inject,
  PLATFORM_ID,
  signal,
  computed
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, of } from 'rxjs';
import { ProjectsApiService } from '../../core/api/projects-api.service';
import { LabProjectsService } from '../../services/lab-projects.service';
import { CircuitService } from '../../services/circuit.service';
import { LabWorkspaceService } from '../../services/lab-workspace.service';
import {
  mapComponentsToLab2d,
  mapConnectionsToLab2d
} from '../../core/api/submission.mapper';
import {
  DEFAULT_ARDUINO_SKETCH,
  highlightArduinoCode
} from '../../core/lab/arduino-highlight.util';
import { extractHttpErrorMessage } from '../../core/api/http-error.util';
import type { ValidationResult } from '../../core/models/circuit-validation.models';

const SESSION_CODE_KEY = 'robotech_ide_last_code';

@Component({
  selector: 'app-ide-programacion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ide-programacion.component.html',
  styleUrls: ['./ide-programacion.component.css']
})
export class IdeProgramacionComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly projectsApi = inject(ProjectsApiService);
  private readonly labProjects = inject(LabProjectsService);
  private readonly circuit = inject(CircuitService);
  private readonly workspaceSvc = inject(LabWorkspaceService);
  private readonly platformId = inject(PLATFORM_ID);

  @ViewChild('codeInput') codeInputRef?: ElementRef<HTMLTextAreaElement>;
  @ViewChild('codeHighlight') codeHighlightRef?: ElementRef<HTMLPreElement>;

  projectId: string | null = null;
  sourceCode = DEFAULT_ARDUINO_SKETCH;

  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly validating = signal(false);
  readonly statusMessage = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);
  readonly validationResult = signal<ValidationResult | null>(null);

  private workspaceComponents: unknown[] = [];
  private workspaceConnections: unknown[] = [];

  readonly highlightedCode = computed(() => highlightArduinoCode(this.sourceCode));

  readonly lineNumbers = computed(() =>
    Array.from({ length: Math.max(1, this.sourceCode.split('\n').length) }, (_, i) => i + 1)
  );

  readonly hardwareFaults = computed(() =>
    (this.validationResult()?.faults ?? []).filter((f) => f.layer === 'HARDWARE')
  );

  readonly firmwareFaults = computed(() =>
    (this.validationResult()?.faults ?? []).filter((f) => f.layer === 'FIRMWARE')
  );

  readonly otherFaults = computed(() =>
    (this.validationResult()?.faults ?? []).filter((f) => f.layer === 'UNKNOWN')
  );

  readonly validationPassed = computed(() => {
    const r = this.validationResult();
    return !!r && r.valid && r.simulationReady;
  });

  ngOnInit(): void {
    this.projectId = this.route.snapshot.queryParamMap.get('projectId');
    this.persistCodeSnapshot();

    if (!this.projectId) {
      this.errorMessage.set('Falta projectId en la URL (?projectId=…).');
      return;
    }

    this.loadWorkspace(this.projectId);
  }

  onCodeInput(): void {
    this.persistCodeSnapshot();
  }

  onEditorScroll(event: Event): void {
    const ta = event.target as HTMLTextAreaElement;
    const pre = this.codeHighlightRef?.nativeElement;
    if (pre) {
      pre.scrollTop = ta.scrollTop;
      pre.scrollLeft = ta.scrollLeft;
    }
  }

  saveCode(): void {
    if (!this.projectId || this.saving()) return;
    this.saving.set(true);
    this.errorMessage.set(null);
    this.statusMessage.set(null);
    this.persistCodeSnapshot();

    this.labProjects
      .saveWorkspace(this.projectId, {
        components: this.workspaceComponents,
        connections: this.workspaceConnections,
        firmwareCode: this.sourceCode
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.statusMessage.set('Código y workspace guardados en el servidor.');
          this.workspaceSvc.set(this.projectId!, {
            components: mapComponentsToLab2d(this.workspaceComponents),
            connections: mapConnectionsToLab2d(this.workspaceConnections)
          });
        },
        error: (err) => {
          this.saving.set(false);
          this.errorMessage.set(extractHttpErrorMessage(err));
        }
      });
  }

  validateCircuitAndCode(): void {
    if (!this.projectId || this.validating()) return;
    this.validating.set(true);
    this.errorMessage.set(null);
    this.statusMessage.set(null);
    this.validationResult.set(null);
    this.persistCodeSnapshot();

    this.circuit
      .validateCircuit(
        {
          components: this.workspaceComponents,
          connections: this.workspaceConnections
        },
        this.sourceCode
      )
      .subscribe({
        next: (result) => {
          this.validating.set(false);
          this.validationResult.set(result);
          if (result.valid && result.simulationReady) {
            this.statusMessage.set('Validación aprobada. Puedes iniciar la simulación.');
          }
        },
        error: (err) => {
          this.validating.set(false);
          this.errorMessage.set(extractHttpErrorMessage(err));
        }
      });
  }

  startSimulation(): void {
    const result = this.validationResult();
    if (!this.projectId || !result?.approvalToken) return;

    this.circuit.adoptApprovalToken(result.approvalToken);
    void this.router.navigate(['/laboratorio2d'], {
      queryParams: {
        projectId: this.projectId,
        simulate: 'true',
        token: result.approvalToken
      }
    });
  }

  copiarCodigo(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    void navigator.clipboard.writeText(this.sourceCode);
    this.statusMessage.set('Código copiado al portapapeles.');
  }

  toggleFullscreen(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (!document.fullscreenElement) {
      void document.documentElement.requestFullscreen();
    } else {
      void document.exitFullscreen();
    }
  }

  private loadWorkspace(projectId: string): void {
    this.loading.set(true);

    const local = this.workspaceSvc.get(projectId);
    if (local?.components?.length) {
      this.workspaceComponents = local.components;
      this.workspaceConnections = local.connections ?? [];
    }

    this.projectsApi
      .getWorkspace(projectId)
      .pipe(catchError(() => of(null)))
      .subscribe((ws) => {
        this.loading.set(false);

        if (ws) {
          this.workspaceComponents = ws.components ?? this.workspaceComponents;
          this.workspaceConnections = ws.connections ?? this.workspaceConnections;

          const fw = (ws as Record<string, unknown>)['firmwareCode'] ??
            (ws as Record<string, unknown>)['firmware_code'];
          if (typeof fw === 'string' && fw.trim().length > 0) {
            this.sourceCode = fw;
          } else if (isPlatformBrowser(this.platformId)) {
            const cached = window.sessionStorage.getItem(SESSION_CODE_KEY);
            if (cached) this.sourceCode = cached;
          }
        } else if (isPlatformBrowser(this.platformId)) {
          const cached = window.sessionStorage.getItem(SESSION_CODE_KEY);
          if (cached) this.sourceCode = cached;
        }

        this.persistCodeSnapshot();
      });
  }

  private persistCodeSnapshot(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    window.sessionStorage.setItem(SESSION_CODE_KEY, this.sourceCode);
  }
}
