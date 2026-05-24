import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type StoredLabWorkspace = {
  version: 1;
  projectId: string;
  components: unknown[];
  connections: unknown[];
  updatedAt: string;
};

@Injectable({ providedIn: 'root' })
export class LabWorkspaceService {
  private readonly platformId = inject(PLATFORM_ID);

  get(projectId: string): StoredLabWorkspace | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    const raw = window.localStorage.getItem(this.key(projectId));
    if (!raw) return null;

    try {
      const parsed = JSON.parse(raw) as StoredLabWorkspace;
      if (!parsed || parsed.version !== 1 || parsed.projectId !== projectId) {
        window.localStorage.removeItem(this.key(projectId));
        return null;
      }
      return parsed;
    } catch {
      window.localStorage.removeItem(this.key(projectId));
      return null;
    }
  }

  set(projectId: string, data: { components: unknown[]; connections: unknown[] }): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const payload: StoredLabWorkspace = {
      version: 1,
      projectId,
      components: data.components,
      connections: data.connections,
      updatedAt: new Date().toISOString()
    };

    window.localStorage.setItem(this.key(projectId), JSON.stringify(payload));
  }

  private key(projectId: string): string {
    return `robotech_lab_workspace_v1:${projectId}`;
  }
}

