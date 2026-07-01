import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, map, switchMap, tap, throwError, of } from 'rxjs';
import {
  ROLE_PROFILES,
  type SessionUser,
  type SystemRole
} from '../core/models/system-roles.models';
import { environment } from '../../environments/environment';
import { ROBO_AUTH_STORAGE } from './auth-storage.keys';
import { UsersApiService } from '../core/api/users-api.service';
import type { JsonObject } from '../core/api/api.models';

/** Respuesta flexible Spring Security / JWT */
interface AuthTokenResponse {
  accessToken?: string;
  token?: string;
  jwt?: string;
  bearerToken?: string;
  access_token?: string;
  uid?: string;
  role?: string;
  roles?: string[];
  displayName?: string;
  fullName?: string;
  email?: string;
  user?: {
    uid?: string;
    email?: string;
    displayName?: string;
    role?: string;
  };
}

/** Cuerpo exacto del POST `/api/auth/register` (solo email + password). */
export interface RegisterRequest {
  email: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly http = inject(HttpClient);
  private readonly usersApi = inject(UsersApiService);

  private readonly storageKey = ROBO_AUTH_STORAGE.session;
  private readonly accessTokenKey = ROBO_AUTH_STORAGE.accessToken;

  /**
   * Login contra el backend (POST). Persiste JWT + sesión y sincroniza `/api/users/me`.
   */
  login(email: string, password: string): Observable<void> {
    const url = `${environment.apiUrl}/auth/login`;
    const normalized = email.trim().toLowerCase();
    const body = {
      username: normalized,
      email: normalized,
      password
    };
    return this.http.post<AuthTokenResponse>(url, body).pipe(
      tap((res) => this.persistAuthSuccess(normalized, res)),
      switchMap(() => this.syncSessionFromServer()),
      map(() => void 0),
      catchError((err) => throwError(() => this.mapAuthHttpError(err)))
    );
  }

  /**
   * Registro: `POST /api/auth/register` con `{ email, password }`.
   * Si la respuesta incluye JWT, persiste sesión y sincroniza perfil remoto.
   */
  register(body: RegisterRequest): Observable<void> {
    const url = `${environment.apiUrl}/auth/register`;
    const email = body.email.trim().toLowerCase();
    const payload = { email, password: body.password };
    return this.http.post<AuthTokenResponse>(url, payload).pipe(
      tap((res) => {
        const token = this.extractToken(res);
        if (token) {
          this.persistAuthSuccess(email, res);
        }
      }),
      switchMap(() => (this.getAccessToken() ? this.syncSessionFromServer() : of(void 0))),
      map(() => void 0),
      catchError((err) => throwError(() => this.mapAuthHttpError(err)))
    );
  }

  /** Enriquece la sesión local con `GET /api/users/me`. */
  syncSessionFromServer(): Observable<void> {
    return this.usersApi.getMe().pipe(
      tap((me) => {
        const current = this.getSession();
        if (!current) return;
        this.setSession(this.mergeMeIntoSession(current, me as JsonObject));
      }),
      map(() => void 0),
      catchError(() => of(void 0))
    );
  }

  logout(): void {
    if (!this.isBrowser()) return;
    window.localStorage.removeItem(this.storageKey);
    window.localStorage.removeItem(this.accessTokenKey);
  }

  isAuthenticated(): boolean {
    return this.getSession() !== null;
  }

  getSession(): SessionUser | null {
    if (!this.isBrowser()) return null;
    const raw = window.localStorage.getItem(this.storageKey);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw) as SessionUser;
      if (!parsed.role || !ROLE_PROFILES[parsed.role]) {
        this.logout();
        return null;
      }
      return parsed;
    } catch {
      this.logout();
      return null;
    }
  }

  getAccessToken(): string | null {
    if (!this.isBrowser()) return null;
    return window.localStorage.getItem(this.accessTokenKey);
  }

  setAccessToken(token: string): void {
    if (!this.isBrowser()) return;
    window.localStorage.setItem(this.accessTokenKey, token);
  }

  getRole(): SystemRole | null {
    return this.getSession()?.role ?? null;
  }

  hasRole(...roles: SystemRole[]): boolean {
    const role = this.getRole();
    return role !== null && roles.includes(role);
  }

  getHomeRoute(): string {
    const role = this.getRole();
    if (!role) return '/login';
    return ROLE_PROFILES[role].homeRoute;
  }

  private persistAuthSuccess(email: string, res: AuthTokenResponse): void {
    const token = this.extractToken(res);
    if (!token) {
      throw new Error('El servidor no devolvió un token JWT.');
    }
    this.setAccessToken(token);
    const role = this.resolveRole(res);
    this.setSession({
      uid: res.uid ?? res.user?.uid,
      email,
      displayName:
        res.displayName ??
        res.fullName ??
        res.user?.displayName ??
        email,
      role
    });
  }

  private mergeMeIntoSession(session: SessionUser, me: JsonObject): SessionUser {
    const role = this.resolveRoleFromMe(me) ?? session.role;
    return {
      uid: String(me['uid'] ?? me['id'] ?? session.uid ?? ''),
      email: String(me['email'] ?? session.email),
      displayName: String(me['displayName'] ?? me['fullName'] ?? session.displayName),
      role
    };
  }

  private resolveRoleFromMe(me: JsonObject): SystemRole | null {
    const raw = me['role'] ?? (Array.isArray(me['roles']) ? me['roles'][0] : undefined);
    const candidate = raw as SystemRole | undefined;
    if (candidate && ROLE_PROFILES[candidate]) {
      return candidate;
    }
    return null;
  }

  private extractToken(res: AuthTokenResponse): string | null {
    return (
      res.accessToken ??
      res.token ??
      res.jwt ??
      res.bearerToken ??
      res.access_token ??
      null
    );
  }

  private resolveRole(res: AuthTokenResponse): SystemRole {
    const raw = res.role ?? res.roles?.[0] ?? res.user?.role ?? undefined;
    const candidate = raw as SystemRole | undefined;
    if (candidate && ROLE_PROFILES[candidate]) {
      return candidate;
    }
    return 'EST-ROLE';
  }

  private mapAuthHttpError(err: unknown): Error {
    if (err instanceof HttpErrorResponse) {
      const text = this.extractAuthErrorText(err);
      if (err.status === 0) {
        return new Error(
          'Sin respuesta del servidor (¿backend caído, URL mal o CORS?). ' +
            `Comprueba que existe ${environment.apiUrl} y CORS para el origen de esta app.`
        );
      }
      if (
        (err.status === 401 || err.status === 403) &&
        /authentication required|full authentication is required/i.test(text)
      ) {
        return new Error(
          'Spring Security está bloqueando el login/registro sin JWT. ' +
            'En el backend, permite acceso anónimo a esas rutas.'
        );
      }
      return new Error(text || err.message || `Error HTTP ${err.status}`);
    }
    if (err instanceof Error) return err;
    return new Error('Error de autenticación');
  }

  private extractAuthErrorText(err: HttpErrorResponse): string {
    const body = err.error;
    if (typeof body === 'string') {
      const t = body.trim();
      if (!t) return '';
      try {
        const o = JSON.parse(t) as Record<string, unknown>;
        return this.pickFirstString(o, [
          'message',
          'error_description',
          'detail',
          'title',
          'error'
        ]);
      } catch {
        return t;
      }
    }
    if (body && typeof body === 'object') {
      return this.pickFirstString(body as Record<string, unknown>, [
        'message',
        'error_description',
        'detail',
        'title',
        'error'
      ]);
    }
    return '';
  }

  private pickFirstString(o: Record<string, unknown>, keys: string[]): string {
    for (const k of keys) {
      const v = o[k];
      if (typeof v === 'string' && v.length > 0) return v;
    }
    return '';
  }

  private setSession(session: SessionUser): void {
    if (!this.isBrowser()) return;
    window.localStorage.setItem(this.storageKey, JSON.stringify(session));
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }
}
