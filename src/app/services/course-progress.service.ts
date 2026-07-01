import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, of, tap, map, catchError } from 'rxjs';
import { ProgressApiService } from '../core/api/progress-api.service';
import type { JsonObject } from '../core/api/api.models';

type StoredCourseProgress = {
  completed: string[];
  state: Record<string, unknown>;
};

type StoredProgress = Record<string, StoredCourseProgress>;

@Injectable({ providedIn: 'root' })
export class CourseProgressService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly api = inject(ProgressApiService);

  private cache: StoredProgress = {};
  private loaded = false;
  private persistTimer: ReturnType<typeof setTimeout> | null = null;

  ensureLoaded(): Observable<void> {
    if (!this.isBrowser()) {
      return of(void 0);
    }
    if (this.loaded) {
      return of(void 0);
    }
    return this.api.getMe().pipe(
      tap((data) => {
        this.cache = this.parseApiProgress(data);
        this.loaded = true;
      }),
      map(() => void 0),
      catchError(() => {
        this.cache = {};
        this.loaded = true;
        return of(void 0);
      })
    );
  }

  getProgressPercent(courseSlug: string, totalPractices: number): number {
    if (totalPractices <= 0) {
      return 0;
    }
    const course = this.getCourse(courseSlug);
    const completed = course.completed.length;
    return Math.max(0, Math.min(100, Math.round((completed / totalPractices) * 100)));
  }

  isPracticeCompleted(courseSlug: string, practiceId: string): boolean {
    return this.getCourse(courseSlug).completed.includes(practiceId);
  }

  setPracticeCompleted(courseSlug: string, practiceId: string, completed: boolean): void {
    const progress = { ...this.cache };
    const course = progress[courseSlug] ?? { completed: [], state: {} };
    const nextCompleted = new Set(course.completed);

    if (completed) {
      nextCompleted.add(practiceId);
    } else {
      nextCompleted.delete(practiceId);
    }

    progress[courseSlug] = {
      completed: Array.from(nextCompleted),
      state: course.state ?? {}
    };

    this.cache = progress;
    this.schedulePersist();
  }

  getPracticeState<T>(courseSlug: string, practiceId: string, fallback: T): T {
    const course = this.getCourse(courseSlug);
    const state = course.state?.[practiceId];
    return (state as T) ?? fallback;
  }

  setPracticeState(courseSlug: string, practiceId: string, value: unknown): void {
    const progress = { ...this.cache };
    const course = progress[courseSlug] ?? { completed: [], state: {} };

    progress[courseSlug] = {
      completed: course.completed ?? [],
      state: {
        ...(course.state ?? {}),
        [practiceId]: value
      }
    };

    this.cache = progress;
    this.schedulePersist();
  }

  resetCourse(courseSlug: string): void {
    const progress = { ...this.cache };
    delete progress[courseSlug];
    this.cache = progress;
    this.schedulePersist();
  }

  private getCourse(courseSlug: string): StoredCourseProgress {
    return this.cache[courseSlug] ?? { completed: [], state: {} };
  }

  private parseApiProgress(data: JsonObject): StoredProgress {
    const cp = data['courseProgress'];
    if (cp && typeof cp === 'object' && !Array.isArray(cp)) {
      return cp as StoredProgress;
    }
    return {};
  }

  private schedulePersist(): void {
    if (!this.isBrowser()) return;
    if (this.persistTimer) {
      clearTimeout(this.persistTimer);
    }
    this.persistTimer = setTimeout(() => this.flush(), 400);
  }

  private flush(): void {
    this.persistTimer = null;
    this.api.putMe({ courseProgress: this.cache as JsonObject }).subscribe({
      error: () => {
        /* el usuario puede reintentar al completar otra práctica */
      }
    });
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }
}
