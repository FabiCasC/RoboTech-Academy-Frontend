import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import type { Course, CourseModule } from '../../data/course.models';
import { CoursePracticeComponent } from '../../components/course-practice/course-practice.component';
import { CourseProgressService } from '../../services/course-progress.service';
import { LabProjectsService } from '../../services/lab-projects.service';
import { CoursesApiService } from '../../core/api/courses-api.service';
import { mapCourseDto, totalPractices } from '../../core/api/course.mapper';
import { extractHttpErrorMessage } from '../../core/api/http-error.util';
import type { JsonObject } from '../../core/api/api.models';

@Component({
  selector: 'app-course-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, CoursePracticeComponent],
  templateUrl: './course-detail.component.html',
  styleUrl: './course-detail.component.css'
})
export class CourseDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly progress = inject(CourseProgressService);
  private readonly labProjects = inject(LabProjectsService);
  private readonly coursesApi = inject(CoursesApiService);

  readonly loading = signal(true);
  readonly loadError = signal<string | null>(null);
  readonly course = signal<Course | null>(null);
  readonly startingLab = signal(false);
  readonly labError = signal<string | null>(null);
  refreshToken = 0;

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (!slug) {
      void this.router.navigate(['/dashboard']);
      return;
    }

    forkJoin({
      progress: this.progress.ensureLoaded(),
      course: this.coursesApi.getBySlug(slug)
    }).subscribe({
      next: ({ course }) => {
        this.course.set(mapCourseDto(course as JsonObject));
        this.loading.set(false);
      },
      error: (err) => {
        this.loadError.set(extractHttpErrorMessage(err));
        this.loading.set(false);
        void this.router.navigate(['/dashboard']);
      }
    });
  }

  getTotalPractices(course: Course): number {
    return totalPractices(course);
  }

  getProgressPercent(course: Course): number {
    return this.progress.getProgressPercent(course.slug, this.getTotalPractices(course));
  }

  onPracticeChanged(): void {
    this.refreshToken++;
  }

  isLaboratorioModule(module: CourseModule): boolean {
    return /laboratorio/i.test(module.title);
  }

  startLaboratorio(course: Course): void {
    if (this.startingLab()) return;
    this.labError.set(null);
    this.startingLab.set(true);

    this.labProjects.createForCourse(course.slug, course.title).subscribe({
      next: (project) => {
        this.startingLab.set(false);
        void this.router.navigate(['/laboratorio2d'], {
          queryParams: { projectId: project.id, courseSlug: course.slug }
        });
      },
      error: (err) => {
        this.startingLab.set(false);
        this.labError.set(extractHttpErrorMessage(err));
      }
    });
  }
}
