import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { COURSE_CATALOG } from '../data/course-catalog';
import type { LabProject } from '../pages/proyectos/models/lab-project.models';

type StoredLabProjects = {
  version: 1;
  projects: LabProject[];
};

@Injectable({ providedIn: 'root' })
export class LabProjectsService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly storageKey = 'robotech_lab_projects_v1';

  list(): LabProject[] {
    const stored = this.getAll();
    const merged = this.mergeSeeds(stored.projects);
    return merged.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  getById(id: string): LabProject | undefined {
    return this.list().find((p) => p.id === id);
  }

  createFree(title: string, description: string): LabProject {
    const now = new Date().toISOString();
    const project: LabProject = {
      id: `free-${this.randomId()}`,
      kind: 'FREE',
      title: title.trim() || 'LAB LIBRE',
      description: description.trim() || 'Proyecto libre para experimentar con el laboratorio.',
      createdAt: now,
      updatedAt: now
    };

    const stored = this.getAll();
    stored.projects = [project, ...stored.projects];
    this.setAll(stored);
    return project;
  }

  updateFree(id: string, patch: { title?: string; description?: string }): LabProject | undefined {
    const stored = this.getAll();
    const index = stored.projects.findIndex((p) => p.id === id);
    if (index < 0) {
      return undefined;
    }

    const current = stored.projects[index];
    if (current.kind !== 'FREE') {
      return current;
    }

    const next: LabProject = {
      ...current,
      title: patch.title?.trim() ? patch.title.trim() : current.title,
      description: patch.description?.trim() ? patch.description.trim() : current.description,
      updatedAt: new Date().toISOString()
    };

    stored.projects[index] = next;
    this.setAll(stored);
    return next;
  }

  touch(id: string): void {
    const stored = this.getAll();
    const index = stored.projects.findIndex((p) => p.id === id);
    if (index < 0) return;
    stored.projects[index] = { ...stored.projects[index], updatedAt: new Date().toISOString() };
    this.setAll(stored);
  }

  private mergeSeeds(existing: LabProject[]): LabProject[] {
    const seedProjects: LabProject[] = COURSE_CATALOG.map((course) => {
      const now = new Date().toISOString();
      return {
        id: `course-${course.slug}`,
        kind: 'COURSE',
        title: course.project.title,
        description: course.project.objective,
        courseSlug: course.slug,
        createdAt: now,
        updatedAt: now
      };
    });

    const byId = new Map<string, LabProject>();
    seedProjects.forEach((p) => byId.set(p.id, p));
    existing.forEach((p) => byId.set(p.id, p));

    const merged = Array.from(byId.values());
    const stored = this.getAll();
    const changed =
      merged.length !== stored.projects.length ||
      merged.some((p) => !stored.projects.find((sp) => sp.id === p.id));

    if (changed) {
      this.setAll({ version: 1, projects: merged });
    }

    return merged;
  }

  private getAll(): StoredLabProjects {
    if (!isPlatformBrowser(this.platformId)) {
      return { version: 1, projects: [] };
    }

    const raw = window.localStorage.getItem(this.storageKey);
    if (!raw) {
      return { version: 1, projects: [] };
    }

    try {
      const parsed = JSON.parse(raw) as StoredLabProjects;
      if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.projects)) {
        window.localStorage.removeItem(this.storageKey);
        return { version: 1, projects: [] };
      }
      return parsed;
    } catch {
      window.localStorage.removeItem(this.storageKey);
      return { version: 1, projects: [] };
    }
  }

  private setAll(data: StoredLabProjects): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    window.localStorage.setItem(this.storageKey, JSON.stringify(data));
  }

  private randomId(): string {
    return Math.random().toString(36).slice(2, 10);
  }
}

