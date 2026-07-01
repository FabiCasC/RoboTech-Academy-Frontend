import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { CourseCardComponent } from '../../components/course-card/course-card.component';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CourseProgressService } from '../../services/course-progress.service';
import { EstudianteFlowComponent } from '../../features/estudiante/estudiante-flow.component';
import { filter, forkJoin } from 'rxjs';
import { CoursesApiService } from '../../core/api/courses-api.service';
import { UsersApiService } from '../../core/api/users-api.service';
import { LabProjectsService } from '../../services/lab-projects.service';
import { mapCourseDto, totalPractices } from '../../core/api/course.mapper';
import type { JsonObject } from '../../core/api/api.models';
import type { LabProject } from '../proyectos/models/lab-project.models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CourseCardComponent, RouterLink, RouterLinkActive, EstudianteFlowComponent, CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly progress = inject(CourseProgressService);
  private readonly coursesApi = inject(CoursesApiService);
  private readonly usersApi = inject(UsersApiService);
  private readonly projectsSvc = inject(LabProjectsService);

  readonly loading = signal(true);
  readonly loadError = signal<string | null>(null);
  readonly courses = signal<
    Array<{
      id: string;
      badge: string;
      title: string;
      description: string;
      progress: number;
      image: string;
      continueLink: string[];
    }>
  >([]);

  readonly displayName = signal('—');
  readonly userUid = signal('—');
  readonly xp = signal<number | null>(null);
  readonly level = signal<number | null>(null);
  readonly recentProjects = signal<LabProject[]>([]);

  refreshToken = 0;

  ngOnInit(): void {
    this.loadDashboard();
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe(() => {
      this.loadDashboard();
    });
  }

  private loadDashboard(): void {
    this.loading.set(true);
    this.loadError.set(null);

    forkJoin({
      progress: this.progress.ensureLoaded(),
      courses: this.coursesApi.list(),
      me: this.usersApi.getMe(),
      stats: this.usersApi.getMeStats(),
      projects: this.projectsSvc.syncFromRemote()
    }).subscribe({
      next: ({ courses, me, stats }) => {
        const rows = Array.isArray(courses) ? courses : [];
        this.courses.set(
          rows.map((row) => {
            const mapped = mapCourseDto(row as JsonObject);
            const total = totalPractices(mapped);
            return {
              id: mapped.slug,
              badge: mapped.badge,
              title: mapped.title,
              description: mapped.description,
              progress: this.progress.getProgressPercent(mapped.slug, total || 1),
              image: mapped.image,
              continueLink: ['/cursos', mapped.slug]
            };
          })
        );

        const meObj = me as JsonObject;
        this.displayName.set(
          String(meObj['displayName'] ?? meObj['fullName'] ?? meObj['email'] ?? '—')
        );
        this.userUid.set(String(meObj['uid'] ?? meObj['id'] ?? '—'));

        const statsObj = stats as JsonObject;
        const xpVal = statsObj['xp'];
        const levelVal = statsObj['level'];
        this.xp.set(typeof xpVal === 'number' ? xpVal : xpVal != null ? Number(xpVal) : null);
        this.level.set(
          typeof levelVal === 'number' ? levelVal : levelVal != null ? Number(levelVal) : null
        );

        this.recentProjects.set(this.projectsSvc.list().slice(0, 3));
        this.loading.set(false);
      },
      error: () => {
        this.courses.set([]);
        this.recentProjects.set([]);
        this.loadError.set('No se pudo cargar el dashboard desde el servidor.');
        this.loading.set(false);
      }
    });
  }

  onPracticeChanged(): void {
    this.refreshToken++;
    this.loadDashboard();
  }
}
