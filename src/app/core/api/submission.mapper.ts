import type {
  Lab2dComponent,
  Lab2dConnection,
  LabPort
} from '../../components/p5-lab2d-canvas/p5-lab2d-canvas.component';
import type { JsonObject } from './api.models';

export type SubmissionStatus = 'VALIDADO' | 'PENDIENTE';

export interface ProjectSubmissionRow {
  projectId: string;
  studentName: string;
  courseName: string;
  lastModified: string;
  status: SubmissionStatus;
  grade: number | null;
  raw: JsonObject;
}

export interface SubmissionValidationReport {
  hwStatus: string;
  firmwareStatus: string;
  faults: string[];
}

export interface SubmissionDetail {
  components: Lab2dComponent[];
  connections: Lab2dConnection[];
  firmwareCode: string;
  validation: SubmissionValidationReport;
  grade: number | null;
  feedback: string;
}

export interface GradeProjectBody {
  grade: number;
  feedback: string;
}

export function mapSubmissionRow(d: JsonObject): ProjectSubmissionRow {
  const projectId = String(
    d['projectId'] ?? d['project_id'] ?? d['id'] ?? ''
  );
  const studentName = String(
    d['studentName'] ??
      d['student_name'] ??
      d['authorName'] ??
      d['displayName'] ??
      d['studentEmail'] ??
      d['student_email'] ??
      d['email'] ??
      '—'
  );
  const courseName = String(
    d['courseName'] ??
      d['course_name'] ??
      d['courseTitle'] ??
      d['course_title'] ??
      d['courseSlug'] ??
      d['course_slug'] ??
      '—'
  );
  const lastModified = String(
    d['lastModified'] ??
      d['last_modified'] ??
      d['lastSavedAt'] ??
      d['last_saved_at'] ??
      d['updatedAt'] ??
      d['updated_at'] ??
      d['submittedAt'] ??
      d['submitted_at'] ??
      ''
  );
  const gradeRaw = d['grade'] ?? d['score'] ?? d['calification'] ?? d['calificación'];
  const grade =
    gradeRaw !== undefined && gradeRaw !== null && gradeRaw !== ''
      ? Number(gradeRaw)
      : null;

  return {
    projectId,
    studentName,
    courseName,
    lastModified,
    status: mapSubmissionStatus(d),
    grade: Number.isFinite(grade) ? grade : null,
    raw: d
  };
}

export function mapSubmissionStatus(d: JsonObject): SubmissionStatus {
  const status = String(d['status'] ?? d['validationStatus'] ?? '').toUpperCase();
  if (
    status === 'VALIDADO' ||
    status === 'VALIDATED' ||
    status === 'APPROVED' ||
    status === 'OK'
  ) {
    return 'VALIDADO';
  }
  if (d['validated'] === true || d['valid'] === true || d['approved'] === true) {
    return 'VALIDADO';
  }
  const hw = String(d['hwStatus'] ?? d['hardwareStatus'] ?? '').toUpperCase();
  const fw = String(d['firmwareStatus'] ?? d['softwareStatus'] ?? '').toUpperCase();
  if (hw === 'OK' && fw === 'OK') return 'VALIDADO';
  return 'PENDIENTE';
}

export function mapValidationReport(d: JsonObject): SubmissionValidationReport {
  const faultsRaw =
    d['faults'] ??
    d['errors'] ??
    d['validationErrors'] ??
    d['validation_errors'] ??
    [];
  const faults = Array.isArray(faultsRaw)
    ? faultsRaw.map((f) =>
        typeof f === 'string' ? f : JSON.stringify(f)
      )
    : [];

  return {
    hwStatus: String(
      d['hwStatus'] ?? d['hardwareStatus'] ?? d['hardware_status'] ?? '—'
    ),
    firmwareStatus: String(
      d['firmwareStatus'] ??
        d['softwareStatus'] ??
        d['firmware_status'] ??
        '—'
    ),
    faults
  };
}

export function mapSubmissionDetail(
  d: JsonObject,
  circuit?: JsonObject | null
): SubmissionDetail {
  const merged: JsonObject = {
    ...d,
    ...(circuit ?? {})
  };

  const components =
    merged['components'] ??
    (merged['workspace'] as JsonObject | undefined)?.['components'] ??
    (merged['circuit'] as JsonObject | undefined)?.['components'];
  const connections =
    merged['connections'] ??
    (merged['workspace'] as JsonObject | undefined)?.['connections'] ??
    (merged['circuit'] as JsonObject | undefined)?.['connections'];

  const firmwareCode = String(
    merged['firmwareCode'] ??
      merged['firmware_code'] ??
      merged['code'] ??
      ''
  );

  const feedback = String(
    merged['feedback'] ?? merged['teacherFeedback'] ?? merged['comment'] ?? ''
  );
  const gradeRaw = merged['grade'] ?? merged['score'];
  const grade =
    gradeRaw !== undefined && gradeRaw !== null && gradeRaw !== ''
      ? Number(gradeRaw)
      : null;

  return {
    components: mapComponentsToLab2d(components),
    connections: mapConnectionsToLab2d(connections),
    firmwareCode,
    validation: mapValidationReport(merged),
    grade: Number.isFinite(grade) ? grade : null,
    feedback
  };
}

export function mapComponentsToLab2d(components: unknown): Lab2dComponent[] {
  if (!Array.isArray(components) || components.length === 0) return [];

  const first = components[0] as Record<string, unknown>;
  if (first['kitId']) {
    return (components as Lab2dComponent[]).map((c) => ({
      ...c,
      ports: Array.isArray(c.ports) ? c.ports.map((p) => ({ ...p })) : []
    }));
  }

  return (components as Array<Record<string, unknown>>).map((c) => {
    const props = (c['properties'] ?? {}) as Record<string, unknown>;
    const pos = (c['position'] ?? {}) as Record<string, unknown>;
    const kitId = String(props['kitId'] ?? c['type'] ?? 'unknown')
      .toLowerCase()
      .replace(/_/g, '-');
    const ports = Array.isArray(props['ports'])
      ? (props['ports'] as LabPort[]).map((p) => ({ ...p }))
      : defaultPortsForKit(kitId);

    return {
      id: String(c['id'] ?? ''),
      kitId,
      label: String(props['label'] ?? c['type'] ?? 'Componente'),
      x: Number(pos['x'] ?? c['x'] ?? 0),
      y: Number(pos['y'] ?? c['y'] ?? 0),
      w: Number(props['w'] ?? c['w'] ?? (kitId === 'arduino-uno-r3' ? 200 : 160)),
      h: Number(props['h'] ?? c['h'] ?? (kitId === 'arduino-uno-r3' ? 256 : 88)),
      ports
    };
  });
}

export function mapConnectionsToLab2d(connections: unknown): Lab2dConnection[] {
  if (!Array.isArray(connections)) return [];

  const first = connections[0] as Record<string, unknown> | undefined;
  if (first && first['fromComp']) {
    return (connections as Lab2dConnection[]).map((c) => ({ ...c }));
  }

  return (connections as Array<Record<string, unknown>>).map((c, i) => ({
    id: String(c['id'] ?? `conn-${i}`),
    fromComp: String(c['fromComponentId'] ?? c['fromComp'] ?? ''),
    fromPort: String(c['fromPin'] ?? c['fromPort'] ?? ''),
    toComp: String(c['toComponentId'] ?? c['toComp'] ?? ''),
    toPort: String(c['toPin'] ?? c['toPort'] ?? '')
  }));
}

function defaultPortsForKit(kitId: string): LabPort[] {
  if (kitId === 'arduino-uno-r3') {
    return [
      { id: 'P0', side: 'right', offset: 0.2, active: true },
      { id: 'P1', side: 'right', offset: 0.5, active: true },
      { id: 'P2', side: 'right', offset: 0.8, active: true }
    ];
  }
  return [{ id: 'P0', side: 'left', offset: 0.5, active: true }];
}
