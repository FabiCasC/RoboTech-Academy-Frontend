import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LabProjectsService } from '../../services/lab-projects.service';
import type { LabProject } from './models/lab-project.models';

@Component({
  selector: 'app-proyectos',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, FormsModule],
  templateUrl: './proyectos.component.html',
  styleUrl: './proyectos.component.css'
})
export class ProyectosComponent {
  private readonly router = inject(Router);
  private readonly projects = inject(LabProjectsService);

  items: LabProject[] = this.projects.list();

  titleDraft = '';
  descriptionDraft = '';

  refresh(): void {
    this.items = this.projects.list();
  }

  get totalLabs(): number {
    return this.items.length;
  }

  get courseLabs(): number {
    return this.items.filter((p) => p.kind === 'COURSE').length;
  }

  get freeLabs(): number {
    return this.items.filter((p) => p.kind === 'FREE').length;
  }

  createFree(): void {
    const project = this.projects.createFree(this.titleDraft, this.descriptionDraft);
    this.titleDraft = '';
    this.descriptionDraft = '';
    this.refresh();
    void this.router.navigate(['/proyectos', project.id]);
  }
}
