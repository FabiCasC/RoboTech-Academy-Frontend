import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ProjectsApiService } from '../../core/api/projects-api.service';
import {
  mapSubmissionDetail,
  type ProjectSubmissionRow,
  type SubmissionDetail
} from '../../core/api/submission.mapper';
import { extractHttpErrorMessage } from '../../core/api/http-error.util';
import { CircuitService } from '../../services/circuit.service';
import { AuthService } from '../../services/auth.service';
import { ROLE_PROFILES } from '../../core/models/system-roles.models';
import {
  P5Lab2dCanvasComponent,
  type Lab2dComponent,
  type Lab2dConnection
} from '../../components/p5-lab2d-canvas/p5-lab2d-canvas.component';

@Component({
  selector: 'app-docente-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, P5Lab2dCanvasComponent],
  templateUrl: './docente-panel.component.html',
  styleUrl: './docente-panel.component.css'
})
export class DocentePanelComponent implements OnInit {
  private readonly projectsApi = inject(ProjectsApiService);
  private readonly circuitApi = inject(CircuitService);
  private readonly auth = inject(AuthService);

  readonly profile = ROLE_PROFILES['DOC-ROLE'];
  readonly session = this.auth.getSession();

  readonly submissions = signal<ProjectSubmissionRow[]>([]);
  readonly loading = signal(false);
  readonly loadError = signal<string | null>(null);

  readonly panelOpen = signal(false);
  readonly detailLoading = signal(false);
  readonly detailError = signal<string | null>(null);
  readonly grading = signal(false);
  readonly gradeSuccess = signal<string | null>(null);

  readonly selectedRow = signal<ProjectSubmissionRow | null>(null);
  readonly detailComponents = signal<Lab2dComponent[]>([]);
  readonly detailConnections = signal<Lab2dConnection[]>([]);
  readonly firmwareCode = signal('');
  readonly hwStatus = signal('—');
  readonly firmwareStatus = signal('—');
  readonly faults = signal<string[]>([]);
  readonly gradeInput = signal<number | null>(null);
  readonly feedbackInput = signal('');

  ngOnInit(): void {
    this.reloadSubmissions();
  }

  reloadSubmissions(): void {
    this.loading.set(true);
    this.loadError.set(null);
    this.projectsApi.listSubmissions().subscribe({
      next: (rows) => {
        this.submissions.set(rows);
        this.loading.set(false);
      },
      error: (err) => {
        this.loadError.set(extractHttpErrorMessage(err));
        this.loading.set(false);
      }
    });
  }

  openSubmission(row: ProjectSubmissionRow, event?: Event): void {
    event?.stopPropagation();
    this.selectedRow.set(row);
    this.panelOpen.set(true);
    this.detailError.set(null);
    this.gradeSuccess.set(null);
    this.detailLoading.set(true);

    const fromRow = mapSubmissionDetail(row.raw);

    this.circuitApi
      .getCircuit(row.projectId)
      .pipe(catchError(() => of(null)))
      .subscribe({
        next: (circuit) => {
          const detail: SubmissionDetail = circuit
            ? mapSubmissionDetail(row.raw, circuit as unknown as Record<string, unknown>)
            : fromRow;

          const components =
            detail.components.length > 0
              ? detail.components
              : fromRow.components;
          const connections =
            detail.connections.length > 0
              ? detail.connections
              : fromRow.connections;

          this.detailComponents.set(components);
          this.detailConnections.set(connections);
          this.firmwareCode.set(
            detail.firmwareCode || fromRow.firmwareCode || '// Sin código firmware'
          );
          this.hwStatus.set(detail.validation.hwStatus);
          this.firmwareStatus.set(detail.validation.firmwareStatus);
          this.faults.set(detail.validation.faults);
          this.gradeInput.set(row.grade ?? detail.grade);
          this.feedbackInput.set(detail.feedback);
          this.detailLoading.set(false);
        },
        error: (err) => {
          this.detailError.set(extractHttpErrorMessage(err));
          this.detailLoading.set(false);
        }
      });
  }

  closePanel(): void {
    this.panelOpen.set(false);
    this.selectedRow.set(null);
    this.detailError.set(null);
    this.gradeSuccess.set(null);
  }

  submitGrade(): void {
    const row = this.selectedRow();
    if (!row) return;

    const grade = this.gradeInput();
    if (grade === null || grade < 0 || grade > 100) {
      this.detailError.set('La nota debe estar entre 0 y 100.');
      return;
    }

    this.grading.set(true);
    this.detailError.set(null);
    this.gradeSuccess.set(null);

    this.projectsApi
      .gradeProject(row.projectId, {
        grade,
        feedback: this.feedbackInput().trim()
      })
      .subscribe({
        next: () => {
          this.grading.set(false);
          this.gradeSuccess.set('Calificación guardada correctamente.');
          this.submissions.update((list) =>
            list.map((s) =>
              s.projectId === row.projectId
                ? { ...s, grade, status: 'VALIDADO' as const }
                : s
            )
          );
        },
        error: (err) => {
          this.grading.set(false);
          this.detailError.set(extractHttpErrorMessage(err));
        }
      });
  }

  formatDate(iso: string): string {
    if (!iso) return '—';
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? iso : d.toLocaleString('es-EC');
  }

  statusLabel(status: ProjectSubmissionRow['status']): string {
    return status;
  }

  gradeDisplay(grade: number | null): string {
    return grade === null ? '—' : String(grade);
  }
}
