import { HttpClient, HttpErrorResponse } from '@angular/common/http';
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
import type { CircuitPersistBody } from '../core/api/api.models';
import {
  mapLabComponentsToDto,
  mapLabConnectionsToDto
} from '../core/lab/component-node.mapper';
import type {
  CircuitValidateResponseDto,
  ValidationFault,
  ValidationFaultDto,
  ValidationLayer,
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
  readonly approvalToken = signal<string | null>(null);
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
          const body = this.buildPersistBody(
            payload.circuitGraph.components,
            payload.circuitGraph.connections,
            payload.codeString
          );
          return this.http
            .put<void>(
              `${environment.apiUrl}/circuit/${encodeURIComponent(payload.projectId)}`,
              body
            )
            .pipe(
              catchError((err: HttpErrorResponse | { error?: { message?: string }; message?: string }) => {
                const msg =
                  (err instanceof HttpErrorResponse
                    ? (err.error as { message?: string } | string | null)?.toString()
                    : undefined) ??
                  (err as { error?: { message?: string } })?.error?.message ??
                  (err as { message?: string })?.message ??
                  'Error al guardar el circuito en el servidor.';
                this.errorMessage.set(typeof msg === 'string' ? msg : 'Error al guardar el circuito.');
                return EMPTY;
              })
            );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
  }

  /** Debounce → `PUT /api/circuit/{projectId}` */
  scheduleAutosave(payload: CircuitAutosavePayload): void {
    this.autosave$.next(payload);
  }

  getCircuit(projectId: string): Observable<CircuitPersistBody> {
    return this.http.get<CircuitPersistBody>(
      `${environment.apiUrl}/circuit/${encodeURIComponent(projectId)}`
    );
  }

  putCircuit(projectId: string, body: CircuitPersistBody): Observable<unknown> {
    return this.http.put(
      `${environment.apiUrl}/circuit/${encodeURIComponent(projectId)}`,
      body
    );
  }

  /**
   * POST `/api/circuit/validate` — cuerpo alineado con Spring.
   */
  validateCircuit(
    circuitGraph: CircuitGraphPayload,
    firmwareCode: string,
    projectType = 'LINE_FOLLOWER'
  ): Observable<ValidationResult> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    const body = {
      components: mapLabComponentsToDto(circuitGraph.components),
      connections: mapLabConnectionsToDto(circuitGraph.connections),
      firmwareCode,
      projectType
    };

    return this.http
      .post<CircuitValidateResponseDto>(`${environment.apiUrl}/circuit/validate`, body)
      .pipe(
        map((dto) => this.mapValidationResponse(dto)),
        tap((result) => {
          this.isLoading.set(false);
          const msgs = [...result.hardwareErrors, ...result.softwareErrors];
          if (result.simulationReady) {
            this.isSimulating.set(true);
            this.approvalToken.set(result.approvalToken);
            this.validationErrors.set([]);
          } else {
            this.isSimulating.set(false);
            this.approvalToken.set(null);
            this.validationErrors.set(
              msgs.length
                ? msgs
                : ['El circuito o el código no superaron la validación del servidor.']
            );
          }
        }),
        catchError((err: HttpErrorResponse | { error?: CircuitValidateResponseDto | { message?: string }; message?: string }) => {
          this.isLoading.set(false);
          const backend =
            err instanceof HttpErrorResponse
              ? (err.error as CircuitValidateResponseDto | undefined)
              : ((err as { error?: CircuitValidateResponseDto }).error as
                  | CircuitValidateResponseDto
                  | undefined);
          if (backend && (backend.hardwareErrors || backend.softwareErrors || backend.errors)) {
            const result = this.mapValidationResponse(backend);
            this.isLoading.set(false);
            this.isSimulating.set(result.simulationReady);
            this.approvalToken.set(result.approvalToken);
            this.validationErrors.set([...result.hardwareErrors, ...result.softwareErrors]);
            this.errorMessage.set(null);
            return of(result);
          }
          const msg =
            (err instanceof HttpErrorResponse ? err.message : undefined) ??
            ((err as { error?: { message?: string } })?.error?.message ??
              (err as { message?: string })?.message ??
              'No se pudo contactar al servidor de validación.');
          this.errorMessage.set(msg);
          this.isSimulating.set(false);
          this.validationErrors.set([msg]);
          return of({
            valid: false,
            simulationReady: false,
            approvalToken: null,
            hardwareErrors: [],
            softwareErrors: [msg],
            faults: [{ layer: 'UNKNOWN' as const, message: msg }],
            raw: undefined
          });
        })
      );
  }

  stopSimulation(): void {
    this.isSimulating.set(false);
    this.approvalToken.set(null);
  }

  /** Token recibido desde el IDE u otra pantalla (query param). */
  adoptApprovalToken(token: string | null): void {
    if (token) {
      this.approvalToken.set(token);
      this.isSimulating.set(true);
    }
  }

  buildPersistBody(
    components: unknown[],
    connections: unknown[],
    firmwareCode: string
  ): CircuitPersistBody {
    return {
      components: mapLabComponentsToDto(components),
      connections: mapLabConnectionsToDto(connections),
      firmwareCode
    };
  }

  private mapValidationResponse(dto: CircuitValidateResponseDto): ValidationResult {
    const faults = this.parseFaults(dto);
    const hardwareErrors = [
      ...(dto.hardwareErrors ?? []),
      ...(dto.errors ?? []),
      ...faults.filter((f) => f.layer === 'HARDWARE').map((f) => f.message)
    ];
    const softwareErrors = [
      ...(dto.softwareErrors ?? []),
      ...(dto.messages ?? []),
      ...faults.filter((f) => f.layer === 'FIRMWARE').map((f) => f.message)
    ];
    const approved =
      dto.valid === true || dto.approved === true || dto.passed === true;
    const uniqueHw = [...new Set(hardwareErrors)];
    const uniqueFw = [...new Set(softwareErrors)];
    const noBlockingErrors = uniqueHw.length === 0 && uniqueFw.length === 0;
    const simulationReady =
      approved && noBlockingErrors && dto.simulationReady !== false;
    const approvalToken =
      typeof dto.approvalToken === 'string' && dto.approvalToken.length > 0
        ? dto.approvalToken
        : typeof dto.approval_token === 'string' && dto.approval_token.length > 0
          ? dto.approval_token
          : null;

    return {
      valid: approved && noBlockingErrors,
      simulationReady,
      approvalToken: simulationReady ? approvalToken : null,
      hardwareErrors: uniqueHw,
      softwareErrors: uniqueFw,
      faults: faults.length
        ? faults
        : [
            ...uniqueHw.map((message) => ({ layer: 'HARDWARE' as const, message })),
            ...uniqueFw.map((message) => ({ layer: 'FIRMWARE' as const, message }))
          ],
      raw: dto
    };
  }

  private parseFaults(dto: CircuitValidateResponseDto): ValidationFault[] {
    const raw = dto.faults ?? dto.validationFaults ?? [];
    if (!Array.isArray(raw) || !raw.length) return [];

    return raw.map((f: ValidationFaultDto) => ({
      layer: this.normalizeLayer(f.layer),
      message:
        f.friendlyMessage ??
        f.friendly_message ??
        f.message ??
        f.code ??
        'Error de validación'
    }));
  }

  private normalizeLayer(layer: unknown): ValidationLayer {
    const l = String(layer ?? '').toUpperCase();
    if (l.includes('HARD') || l === 'HW' || l === 'HARDWARE') return 'HARDWARE';
    if (l.includes('FIRM') || l === 'FW' || l === 'FIRMWARE' || l === 'SOFTWARE') {
      return 'FIRMWARE';
    }
    return 'UNKNOWN';
  }
}
