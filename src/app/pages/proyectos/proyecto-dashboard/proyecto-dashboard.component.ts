import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LabProjectsService } from '../../../services/lab-projects.service';
import { COURSE_CATALOG } from '../../../data/course-catalog';
import type { LabProject } from '../models/lab-project.models';

@Component({
  selector: 'app-proyecto-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './proyecto-dashboard.component.html',
  styleUrl: './proyecto-dashboard.component.css'
})
export class ProyectoDashboardComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly projects = inject(LabProjectsService);

  readonly projectId = this.route.snapshot.paramMap.get('projectId') ?? '';
  project: LabProject | undefined = this.projects.getById(this.projectId);

  titleDraft = this.project?.title ?? '';
  descriptionDraft = this.project?.description ?? '';

  get kindLabel(): string {
    return this.project?.kind === 'COURSE' ? 'RELACIONADO A CURSO' : 'LIBRE';
  }

  get courseTitle(): string | null {
    if (this.project?.kind !== 'COURSE' || !this.project.courseSlug) return null;
    const course = COURSE_CATALOG.find((c) => c.slug === this.project!.courseSlug);
    return course?.title ?? null;
  }

  get courseLink(): any[] | null {
    if (this.project?.kind !== 'COURSE' || !this.project.courseSlug) return null;
    return ['/cursos', this.project.courseSlug];
  }

  saveFree(): void {
    if (!this.project || this.project.kind !== 'FREE') return;
    const updated = this.projects.updateFree(this.project.id, {
      title: this.titleDraft,
      description: this.descriptionDraft
    });
    this.project = updated;
  }

  continueAssembly(): void {
    if (!this.project) return;
    this.projects.touch(this.project.id);
    void this.router.navigate(['/laboratorio2d'], {
      queryParams: { projectId: this.project.id }
    });
  }

  backToProjects(): void {
    void this.router.navigate(['/proyectos']);
  }
}

