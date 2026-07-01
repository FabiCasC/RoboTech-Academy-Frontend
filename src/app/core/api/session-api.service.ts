import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { AuthMeResponse } from './api.models';

/** Sesión remota (JWT ya enviado por interceptor). */
@Injectable({ providedIn: 'root' })
export class SessionApiService {
  private readonly http = inject(HttpClient);

  getMe(): Observable<AuthMeResponse> {
    return this.http.get<AuthMeResponse>(`${environment.apiUrl}/auth/me`);
  }
}
