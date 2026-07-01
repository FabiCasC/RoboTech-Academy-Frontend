import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { JsonObject } from './api.models';
import {
  mapSubmissionRow,
  type GradeProjectBody,
  type ProjectSubmissionRow
} from './submission.mapper';

export type ProjectCreateBody = {
  title: string;
  description?: string;
  courseSlug?: string | null;
};
export type ProjectPatchBody = { title?: string; description?: string };
export type WorkspaceBody = {
  components: JsonObject[];
  connections: JsonObject[];
  firmwareCode?: string;
  firmware_code?: string;
};
export type WorkspacePutBody = WorkspaceBody & {
  firmwareCode?: string;
  submitted?: boolean;
};

@Injectable({ providedIn: 'root' })
export class ProjectsApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/projects`;

  list(): Observable<JsonObject[]> {
    return this.http.get<JsonObject[]>(this.base);
  }

  create(body: ProjectCreateBody): Observable<JsonObject> {
    return this.http.post<JsonObject>(this.base, body);
  }

  getById(id: string): Observable<JsonObject> {
    return this.http.get<JsonObject>(`${this.base}/${encodeURIComponent(id)}`);
  }

  patch(id: string, body: ProjectPatchBody): Observable<JsonObject> {
    return this.http.patch<JsonObject>(`${this.base}/${encodeURIComponent(id)}`, body);
  }

  getWorkspace(id: string): Observable<WorkspaceBody> {
    return this.http.get<WorkspaceBody>(`${this.base}/${encodeURIComponent(id)}/workspace`);
  }

  putWorkspace(id: string, body: WorkspacePutBody): Observable<WorkspacePutBody> {
    return this.http.put<WorkspacePutBody>(
      `${this.base}/${encodeURIComponent(id)}/workspace`,
      body
    );
  }

  /** Solo ADMIN en backend. */
  seedFromCourses(): Observable<JsonObject> {
    return this.http.post<JsonObject>(`${this.base}/seed-from-courses`, {});
  }

  /** Entregas de alumnos para calificación docente. */
  listSubmissions(): Observable<ProjectSubmissionRow[]> {
    return this.http.get<JsonObject[] | JsonObject>(`${this.base}/submissions`).pipe(
      map((res) => {
        const list = Array.isArray(res)
          ? res
          : Array.isArray((res as JsonObject)['content'])
            ? ((res as JsonObject)['content'] as JsonObject[])
            : Array.isArray((res as JsonObject)['items'])
              ? ((res as JsonObject)['items'] as JsonObject[])
              : [];
        return list.map(mapSubmissionRow).filter((r) => r.projectId.length > 0);
      })
    );
  }

  /** Calificar entrega: `POST /api/projects/{projectId}/grade` */
  gradeProject(projectId: string, body: GradeProjectBody): Observable<JsonObject> {
    return this.http.post<JsonObject>(
      `${this.base}/${encodeURIComponent(projectId)}/grade`,
      body
    );
  }
}
