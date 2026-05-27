import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { firebaseIdTokenInterceptor } from './interceptors/firebase-id-token.interceptor';
import { authJwtInterceptor } from './interceptors/auth-jwt.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideAnimationsAsync(),
    provideRouter(routes),
    provideHttpClient(
      withFetch(),
      withInterceptors([authJwtInterceptor, firebaseIdTokenInterceptor])
    ),
    provideClientHydration(withEventReplay())
  ]
};
