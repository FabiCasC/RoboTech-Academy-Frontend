import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  EMPTY,
  Observable,
  Subject,
  catchError,
  debounceTime,
  map,
  of,
  switchMap,
  tap
} from 'rxjs';
import { environment } from '../../environments/environment';
import type {
  CircuitValidateResponseDto,
  ValidationResult
} from '../core/models/circuit-validation.models';

export interface CircuitGraphPayload {
  components: unknown[];
  connections: unknown[];
}

export interface CircuitAutosavePayload {
  projectId: string | null;
  circuitGraph: CircuitGraphPayload;
  codeString: string;
}

@Injectable({ providedIn: 'root' })
export class CircuitService {
  private readonly http = inject(HttpClient);
  private readonly destroyRef = inject(DestroyRef);

  readonly isSimulating = signal(false);
  readonly validationErrors = signal<string[]>([]);
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  private readonly autosave$ = new Subject<CircuitAutosavePayload>();

  constructor() {
    this.autosave$
      .pipe(
        debounceTime(2000),
        switchMap((payload) => {
          if (!payload.projectId) {
            return EMPTY;
          }
          return this.http
            .post<void>(`${environment.apiUrl}/circuit/autosave`, {
              projectId: payload.projectId,
              circuitGraph: payload.circuitGraph,
              codeString: payload.codeString
            })
            .pipe(
              catchError((err: { error?: { message?: string }; message?: string }) => {
                const msg =
                  err?.error?.message ??
                  err?.message ??
                  'Error al guardar el circuito en el servidor.';
                this.errorMessage.set(msg);
                return EMPTY;
              })
            );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
  }

  /**
   * Programa persistencia remota (debounce 2s) al dejar de mutar canvas/IDE.
   */
  scheduleAutosave(payload: CircuitAutosavePayload): void {
    this.autosave$.next(payload);
  }

  /**
   * POST `/circuit/validate` — actualiza signals de simulación y errores.
   */
  validateCircuit(circuitGraph: unknown, codeString: string): Observable<ValidationResult> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    return this.http
      .post<CircuitValidateResponseDto>(`${environment.apiUrl}/circuit/validate`, {
        circuitGraph,
        codeString
      })
      .pipe(
        map((dto) => this.mapValidationResponse(dto)),
        tap((result) => {
          this.isLoading.set(false);
          const msgs = [...result.hardwareErrors, ...result.softwareErrors];
          if (result.simulationReady) {
            this.isSimulating.set(true);
            this.validationErrors.set([]);
          } else {
            this.isSimulating.set(false);
            this.validationErrors.set(
              msgs.length ? msgs : ['El circuito o el código no superaron la validación del servidor.']
            );
          }
        }),
        catchError((err: { error?: CircuitValidateResponseDto | { message?: string }; message?: string }) => {
          this.isLoading.set(false);
          const backend = err?.error as CircuitValidateResponseDto | undefined;
          if (backend && (backend.hardwareErrors || backend.softwareErrors || backend.errors)) {
            const result = this.mapValidationResponse(backend);
            this.isSimulating.set(false);
            this.validationErrors.set([...result.hardwareErrors, ...result.softwareErrors]);
            this.errorMessage.set(null);
            return of(result);
          }
          const msg =
            (err?.error as { message?: string } | undefined)?.message ??
            err?.message ??
            'No se pudo contactar al servidor de validación.';
          this.errorMessage.set(msg);
          this.isSimulating.set(false);
          this.validationErrors.set([msg]);
          return of({
            valid: false,
            simulationReady: false,
            hardwareErrors: [],
            softwareErrors: [msg],
            raw: undefined
          });
        })
      );
  }

  stopSimulation(): void {
    this.isSimulating.set(false);
  }

  private mapValidationResponse(dto: CircuitValidateResponseDto): ValidationResult {
    const hardwareErrors = [...(dto.hardwareErrors ?? []), ...(dto.errors ?? [])];
    const softwareErrors = [...(dto.softwareErrors ?? []), ...(dto.messages ?? [])];
    const approved = dto.valid === true || dto.approved === true;
    const noBlockingErrors = hardwareErrors.length === 0 && softwareErrors.length === 0;
    const simulationReady =
      approved && noBlockingErrors && dto.simulationReady !== false;

    return {
      valid: approved && noBlockingErrors,
      simulationReady,
      hardwareErrors,
      softwareErrors,
      raw: dto
    };
  }
}
