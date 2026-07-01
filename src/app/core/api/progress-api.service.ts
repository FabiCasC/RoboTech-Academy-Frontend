import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { JsonObject, ProgressMeBody } from './api.models';

@Injectable({ providedIn: 'root' })
export class ProgressApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/progress`;

  getMe(): Observable<JsonObject> {
    return this.http.get<JsonObject>(`${this.base}/me`);
  }

  putMe(body: ProgressMeBody): Observable<JsonObject> {
    return this.http.put<JsonObject>(`${this.base}/me`, body);
  }

  /** TEACHER */
  getByUid(uid: string): Observable<JsonObject> {
    return this.http.get<JsonObject>(`${this.base}/${encodeURIComponent(uid)}`);
  }
}
