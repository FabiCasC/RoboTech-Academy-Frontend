import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LabProjectsService } from '../../../services/lab-projects.service';
import { CoursesApiService } from '../../../core/api/courses-api.service';
import type { LabProject } from '../models/lab-project.models';
import type { JsonObject } from '../../../core/api/api.models';

@Component({
  selector: 'app-proyecto-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './proyecto-dashboard.component.html',
  styleUrl: './proyecto-dashboard.component.css'
})
export class ProyectoDashboardComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly projects = inject(LabProjectsService);
  private readonly coursesApi = inject(CoursesApiService);

  readonly projectId = this.route.snapshot.paramMap.get('projectId') ?? '';
  readonly project = signal<LabProject | undefined>(undefined);
  readonly loadError = signal<string | null>(null);
  readonly courseTitle = signal<string | null>(null);

  titleDraft = '';
  descriptionDraft = '';

  ngOnInit(): void {
    const cached = this.projects.getById(this.projectId);
    if (cached) {
      this.applyProject(cached);
      return;
    }
    this.projects.fetchOne(this.projectId).subscribe({
      next: (p) => this.applyProject(p),
      error: () => {
        this.loadError.set('No se pudo cargar el proyecto.');
        void this.router.navigate(['/proyectos']);
      }
    });
  }

  private applyProject(p: LabProject): void {
    this.project.set(p);
    this.titleDraft = p.title;
    this.descriptionDraft = p.description;

    if (p.courseSlug) {
      this.coursesApi.getBySlug(p.courseSlug).subscribe({
        next: (row) => {
          const o = row as JsonObject;
          this.courseTitle.set(String(o['title'] ?? p.courseSlug));
        },
        error: () => this.courseTitle.set(p.courseSlug ?? null)
      });
    }
  }

  get kindLabel(): string {
    return this.project()?.kind === 'COURSE' ? 'RELACIONADO A CURSO' : 'LIBRE';
  }

  get courseLink(): string[] | null {
    const p = this.project();
    if (p?.kind !== 'COURSE' || !p.courseSlug) return null;
    return ['/cursos', p.courseSlug];
  }

  saveFree(): void {
    const p = this.project();
    if (!p || p.kind !== 'FREE') return;
    this.projects
      .updateFree(p.id, {
        title: this.titleDraft,
        description: this.descriptionDraft
      })
      .subscribe({
        next: (updated) => {
          if (updated) this.project.set(updated);
        }
      });
  }

  continueAssembly(): void {
    const p = this.project();
    if (!p) return;
    this.projects.touch(p.id);
    void this.router.navigate(['/laboratorio2d'], {
      queryParams: {
        projectId: p.id,
        ...(p.courseSlug ? { courseSlug: p.courseSlug } : {})
      }
    });
  }

  backToProjects(): void {
    void this.router.navigate(['/proyectos']);
  }
}
