import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

type SessionUser = {
  email: string;
  role: 'admin';
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly storageKey = 'robotech_session';
  private readonly temporaryAdmin = {
    email: 'admin@robotech.com',
    password: 'Admin1234!',
    role: 'admin' as const
  };

  login(email: string, password: string): boolean {
    const normalizedEmail = email.trim().toLowerCase();

    if (
      normalizedEmail !== this.temporaryAdmin.email ||
      password !== this.temporaryAdmin.password
    ) {
      return false;
    }

    this.setSession({
      email: this.temporaryAdmin.email,
      role: this.temporaryAdmin.role
    });

    return true;
  }

  logout(): void {
    if (!this.isBrowser()) {
      return;
    }

    window.localStorage.removeItem(this.storageKey);
  }

  isAuthenticated(): boolean {
    return this.getSession() !== null;
  }

  getTemporaryAdminCredentials() {
    return { ...this.temporaryAdmin };
  }

  private setSession(session: SessionUser): void {
    if (!this.isBrowser()) {
      return;
    }

    window.localStorage.setItem(this.storageKey, JSON.stringify(session));
  }

  private getSession(): SessionUser | null {
    if (!this.isBrowser()) {
      return null;
    }

    const session = window.localStorage.getItem(this.storageKey);

    if (!session) {
      return null;
    }

    try {
      return JSON.parse(session) as SessionUser;
    } catch {
      this.logout();
      return null;
    }
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }
}
