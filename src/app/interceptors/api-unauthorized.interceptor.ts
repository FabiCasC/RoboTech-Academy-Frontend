import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { ROBO_AUTH_STORAGE } from '../services/auth-storage.keys';

function shouldIgnore401(url: string): boolean {
  const base = environment.apiUrl.replace(/\/$/, '');
  if (!url.startsWith(base)) return true;
  const rel = url.slice(base.length);
  if (rel.startsWith('/kit/catalog') || rel.startsWith('/kit/details/')) return true;
  if (rel === '/auth/login' || rel === '/auth/register') return true;
  return false;
}

function clearSession(): void {
  try {
    window.localStorage.removeItem(ROBO_AUTH_STORAGE.session);
    window.localStorage.removeItem(ROBO_AUTH_STORAGE.accessToken);
  } catch {
    /* ignore */
  }
}

/**
 * 401 en API propia: limpia sesión local y envía a login (excepto rutas públicas de kit y auth).
 */
export const apiUnauthorizedInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  return next(req).pipe(
    catchError((err: unknown) => {
      if (err instanceof HttpErrorResponse && err.status === 401) {
        if (!shouldIgnore401(req.url)) {
          clearSession();
          void router.navigate(['/login']);
        }
      }
      return throwError(() => err);
    })
  );
};
