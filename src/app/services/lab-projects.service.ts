import { Injectable, inject, signal } from '@angular/core';
import { Observable, map, tap, catchError, of } from 'rxjs';
import { ProjectsApiService } from '../core/api/projects-api.service';
import { mapProjectDtoToLabProject } from '../core/api/project.mapper';
import type { LabProject } from '../pages/proyectos/models/lab-project.models';

/**
 * Proyectos del laboratorio desde Spring (`/api/projects`), con caché en memoria.
 */
@Injectable({ providedIn: 'root' })
export class LabProjectsService {
  private readonly api = inject(ProjectsApiService);
  private readonly items = signal<LabProject[]>([]);

  list(): LabProject[] {
    return [...this.items()].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  getById(id: string): LabProject | undefined {
    return this.items().find((p) => p.id === id);
  }

  syncFromRemote(): Observable<void> {
    return this.api.list().pipe(
      map((rows) =>
        (Array.isArray(rows) ? rows : []).map((r) =>
          mapProjectDtoToLabProject(r as Record<string, unknown>)
        )
      ),
      tap((list) => this.items.set(list)),
      map(() => void 0),
      catchError(() => {
        this.items.set([]);
        return of(void 0);
      })
    );
  }

  fetchOne(id: string): Observable<LabProject> {
    return this.api.getById(id).pipe(
      map((row) => mapProjectDtoToLabProject(row as Record<string, unknown>)),
      tap((p) => {
        this.items.update((arr) => {
          const i = arr.findIndex((x) => x.id === p.id);
          if (i < 0) return [p, ...arr];
          const copy = [...arr];
          copy[i] = p;
          return copy;
        });
      })
    );
  }

  createFree(title: string, description: string): Observable<LabProject> {
    return this.api
      .create({
        title: title.trim() || 'Laboratorio libre',
        description: description.trim() || undefined,
        courseSlug: null
      })
      .pipe(
        map((row) => mapProjectDtoToLabProject(row as Record<string, unknown>)),
        tap((p) => this.items.update((arr) => [p, ...arr]))
      );
  }

  /** Laboratorio vinculado a un curso (`POST /api/projects` con `courseSlug`). */
  createForCourse(courseSlug: string, courseTitle: string): Observable<LabProject> {
    return this.api
      .create({
        courseSlug,
        title: `Mi laboratorio - ${courseTitle}`
      })
      .pipe(
        map((row) => mapProjectDtoToLabProject(row as Record<string, unknown>)),
        tap((p) => this.items.update((arr) => [p, ...arr]))
      );
  }

  saveWorkspace(
    projectId: string,
    body: {
      components: unknown[];
      connections: unknown[];
      firmwareCode?: string;
      submitted?: boolean;
    }
  ): Observable<void> {
    return this.api
      .putWorkspace(projectId, {
        components: body.components as Record<string, unknown>[],
        connections: body.connections as Record<string, unknown>[],
        firmwareCode: body.firmwareCode,
        submitted: body.submitted
      })
      .pipe(map(() => void 0));
  }

  updateFree(
    id: string,
    patch: { title?: string; description?: string }
  ): Observable<LabProject | undefined> {
    const current = this.getById(id);
    if (!current || current.kind !== 'FREE') {
      return of(current);
    }
    return this.api.patch(id, patch).pipe(
      map((row) => mapProjectDtoToLabProject(row as Record<string, unknown>)),
      tap((p) =>
        this.items.update((arr) => arr.map((x) => (x.id === id ? p : x)))
      )
    );
  }

  touch(id: string): void {
    const p = this.getById(id);
    if (!p) return;
    this.api
      .patch(id, { title: p.title, description: p.description })
      .subscribe({
        next: (row) => {
          const next = mapProjectDtoToLabProject(row as Record<string, unknown>);
          this.items.update((arr) => arr.map((x) => (x.id === id ? next : x)));
        },
        error: () => {
          /* opcional: toast */
        }
      });
  }
}
