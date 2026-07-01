import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { JsonObject } from './api.models';

@Injectable({ providedIn: 'root' })
export class CoursesApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/courses`;

  list(): Observable<JsonObject[]> {
    return this.http.get<JsonObject[]>(this.base);
  }

  getBySlug(slug: string): Observable<JsonObject> {
    return this.http.get<JsonObject>(`${this.base}/${encodeURIComponent(slug)}`);
  }

  getProgress(courseId: string): Observable<JsonObject> {
    return this.http.get<JsonObject>(
      `${this.base}/${encodeURIComponent(courseId)}/progress`
    );
  }

  getLesson(courseId: string, lessonId: string): Observable<JsonObject> {
    return this.http.get<JsonObject>(
      `${this.base}/${encodeURIComponent(courseId)}/lessons/${encodeURIComponent(lessonId)}`
    );
  }

  completeLesson(courseId: string, lessonId: string): Observable<void> {
    return this.http.post<void>(
      `${this.base}/${encodeURIComponent(courseId)}/lessons/${encodeURIComponent(lessonId)}/complete`,
      {}
    );
  }
}
