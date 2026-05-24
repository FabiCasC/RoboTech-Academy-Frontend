import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

type StoredCourseProgress = {
  completed: string[];
  state: Record<string, unknown>;
};

type StoredProgress = Record<string, StoredCourseProgress>;

@Injectable({ providedIn: 'root' })
export class CourseProgressService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly storageKey = 'robotech_progress';

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
    const progress = this.getAll();
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

    this.setAll(progress);
  }

  getPracticeState<T>(courseSlug: string, practiceId: string, fallback: T): T {
    const course = this.getCourse(courseSlug);
    const state = course.state?.[practiceId];
    return (state as T) ?? fallback;
  }

  setPracticeState(courseSlug: string, practiceId: string, value: unknown): void {
    const progress = this.getAll();
    const course = progress[courseSlug] ?? { completed: [], state: {} };

    progress[courseSlug] = {
      completed: course.completed ?? [],
      state: {
        ...(course.state ?? {}),
        [practiceId]: value
      }
    };

    this.setAll(progress);
  }

  resetCourse(courseSlug: string): void {
    const progress = this.getAll();
    delete progress[courseSlug];
    this.setAll(progress);
  }

  private getCourse(courseSlug: string): StoredCourseProgress {
    const progress = this.getAll();
    return progress[courseSlug] ?? { completed: [], state: {} };
  }

  private getAll(): StoredProgress {
    if (!this.isBrowser()) {
      return {};
    }

    const raw = window.localStorage.getItem(this.storageKey);
    if (!raw) {
      return {};
    }

    try {
      return JSON.parse(raw) as StoredProgress;
    } catch {
      window.localStorage.removeItem(this.storageKey);
      return {};
    }
  }

  private setAll(progress: StoredProgress): void {
    if (!this.isBrowser()) {
      return;
    }

    window.localStorage.setItem(this.storageKey, JSON.stringify(progress));
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }
}
