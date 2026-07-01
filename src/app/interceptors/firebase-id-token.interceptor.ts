import { isPlatformBrowser } from '@angular/common';
import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';

/**
 * Reservado para rutas que usen Firebase Auth.
 * El backend RoboTech (Spring + JWT) no debe recibir el token de Firebase en lugar del JWT.
 */
export const firebaseIdTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);
  if (!isPlatformBrowser(platformId)) {
    return next(req);
  }
  return next(req);
};
