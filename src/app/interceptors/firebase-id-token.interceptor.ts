import { isPlatformBrowser } from '@angular/common';
import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { from, switchMap } from 'rxjs';
import { getAuth } from 'firebase/auth';

function getPathname(url: string): string {
  try {
    return new URL(url).pathname;
  } catch {
    const withoutQuery = url.split('?')[0] ?? url;
    return withoutQuery.startsWith('/') ? withoutQuery : `/${withoutQuery}`;
  }
}

function shouldAttachToken(url: string): boolean {
  const pathname = getPathname(url);

  if (pathname.startsWith('/api/kit/')) {
    return false;
  }

  if (pathname === '/api/auth/me') {
    return true;
  }

  if (pathname === '/api/projects' || pathname.startsWith('/api/projects/')) {
    return true;
  }

  return false;
}

async function getFirebaseIdToken(): Promise<string | null> {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return null;
    return await user.getIdToken();
  } catch {
    return null;
  }
}

export const firebaseIdTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);
  if (!isPlatformBrowser(platformId)) {
    return next(req);
  }

  if (!shouldAttachToken(req.url)) {
    return next(req);
  }

  return from(getFirebaseIdToken()).pipe(
    switchMap((token) => {
      if (!token) return next(req);
      return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
    })
  );
};
