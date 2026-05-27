import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../environments/environment';
import { ROBO_AUTH_STORAGE } from '../services/auth-storage.keys';

/**
 * Interceptor funcional Angular 19: inyecta `Authorization: Bearer <JWT>`
 * en peticiones al backend. Lee el token de localStorage (no inyecta AuthService)
 * para evitar dependencia circular HttpClient ↔ AuthService.
 */
export const authJwtInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);
  if (!isPlatformBrowser(platformId)) {
    return next(req);
  }

  const base = environment.apiUrl.replace(/\/$/, '');
  const url = req.url;
  if (!url.startsWith(base)) {
    return next(req);
  }

  const token = window.localStorage.getItem(ROBO_AUTH_STORAGE.accessToken);
  if (!token) {
    return next(req);
  }

  return next(
    req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    })
  );
};
