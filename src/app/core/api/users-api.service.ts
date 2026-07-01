import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { JsonObject } from './api.models';

@Injectable({ providedIn: 'root' })
export class UsersApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/users`;

  getMe(): Observable<JsonObject> {
    return this.http.get<JsonObject>(`${this.base}/me`);
  }

  getMeStats(): Observable<JsonObject> {
    return this.http.get<JsonObject>(`${this.base}/me/stats`);
  }

  getMeAchievements(): Observable<JsonObject> {
    return this.http.get<JsonObject>(`${this.base}/me/achievements`);
  }

  getMeActivity(): Observable<JsonObject> {
    return this.http.get<JsonObject>(`${this.base}/me/activity`);
  }

  /** ADMIN */
  listUsers(): Observable<JsonObject[]> {
    return this.http.get<JsonObject[]>(this.base);
  }

  /** ADMIN */
  getByUid(uid: string): Observable<JsonObject> {
    return this.http.get<JsonObject>(`${this.base}/${encodeURIComponent(uid)}`);
  }
}
