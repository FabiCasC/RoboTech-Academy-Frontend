import { HttpErrorResponse } from '@angular/common/http';

export function extractHttpErrorMessage(err: unknown): string {
  if (!(err instanceof HttpErrorResponse)) {
    if (err instanceof Error) return err.message;
    return 'Error de red';
  }
  const body = err.error;
  if (typeof body === 'string') {
    const t = body.trim();
    if (!t) return err.message || `HTTP ${err.status}`;
    try {
      const o = JSON.parse(t) as Record<string, unknown>;
      return pickMessage(o) || err.message || `HTTP ${err.status}`;
    } catch {
      return t;
    }
  }
  if (body && typeof body === 'object') {
    return pickMessage(body as Record<string, unknown>) || err.message || `HTTP ${err.status}`;
  }
  return err.message || `HTTP ${err.status}`;
}

function pickMessage(o: Record<string, unknown>): string {
  for (const k of ['message', 'error_description', 'detail', 'title', 'error']) {
    const v = o[k];
    if (typeof v === 'string' && v.length) return v;
  }
  return '';
}
