import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { LabProjectsService } from '../../services/lab-projects.service';
import { CoursesApiService } from '../../core/api/courses-api.service';
import { extractHttpErrorMessage } from '../../core/api/http-error.util';
import type { JsonObject } from '../../core/api/api.models';
import type { LabProject } from './models/lab-project.models';

@Component({
  selector: 'app-proyectos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './proyectos.component.html',
  styleUrl: './proyectos.component.css'
})
export class ProyectosComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly projectsSvc = inject(LabProjectsService);
  private readonly coursesApi = inject(CoursesApiService);

  readonly loading = signal(false);
  readonly loadError = signal<string | null>(null);
  readonly modalOpen = signal(false);
  readonly creating = signal(false);
  readonly createError = signal<string | null>(null);

  private readonly allProjects = signal<LabProject[]>([]);
  private readonly courseTitles = signal<Record<string, string>>({});

  readonly courseProjects = computed(() =>
    this.allProjects().filter((p) => !!p.courseSlug)
  );

  readonly freeProjects = computed(() =>
    this.allProjects().filter((p) => !p.courseSlug)
  );

  createTitle = '';
  createDescription = '';

  ngOnInit(): void {
    this.reload();
  }

  reload(): void {
    this.loading.set(true);
    this.loadError.set(null);

    forkJoin({
      projects: this.projectsSvc.syncFromRemote(),
      courses: this.coursesApi.list()
    }).subscribe({
      next: ({ courses }) => {
        const titles: Record<string, string> = {};
        const rows = Array.isArray(courses) ? courses : [];
        for (const row of rows) {
          const o = row as JsonObject;
          const slug = String(o['slug'] ?? o['id'] ?? '');
          if (slug) {
            titles[slug] = String(o['title'] ?? slug);
          }
        }
        this.courseTitles.set(titles);
        this.allProjects.set(this.projectsSvc.list());
        this.loading.set(false);
      },
      error: (err) => {
        this.allProjects.set(this.projectsSvc.list());
        this.loading.set(false);
        this.loadError.set(extractHttpErrorMessage(err));
      }
    });
  }

  courseTitle(slug: string | undefined): string {
    if (!slug) return '—';
    return this.courseTitles()[slug] ?? slug;
  }

  formatDate(iso: string): string {
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString('es-EC');
  }

  statusLabel(project: LabProject): 'ENTREGADO' | 'EN PROGRESO' {
    return project.submitted ? 'ENTREGADO' : 'EN PROGRESO';
  }

  openCreateModal(): void {
    this.createError.set(null);
    this.createTitle = '';
    this.createDescription = '';
    this.modalOpen.set(true);
  }

  closeCreateModal(): void {
    if (this.creating()) return;
    this.modalOpen.set(false);
    this.createError.set(null);
  }

  createAndEnter(): void {
    const title = this.createTitle.trim();
    if (!title) {
      this.createError.set('El nombre del laboratorio es obligatorio.');
      return;
    }

    this.creating.set(true);
    this.createError.set(null);

    this.projectsSvc.createFree(title, this.createDescription).subscribe({
      next: (project) => {
        this.creating.set(false);
        this.modalOpen.set(false);
        this.allProjects.set(this.projectsSvc.list());
        void this.router.navigate(['/laboratorio2d'], {
          queryParams: { projectId: project.id, new: 'true' }
        });
      },
      error: (err) => {
        this.creating.set(false);
        this.createError.set(extractHttpErrorMessage(err));
      }
    });
  }

  continueProject(project: LabProject): void {
    void this.router.navigate(['/laboratorio2d'], {
      queryParams: { projectId: project.id }
    });
  }

  openFreeProject(project: LabProject): void {
    void this.router.navigate(['/laboratorio2d'], {
      queryParams: { projectId: project.id }
    });
  }
}
