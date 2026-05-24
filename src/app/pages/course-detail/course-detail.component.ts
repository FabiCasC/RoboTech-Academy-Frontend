import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { COURSE_MAP, type Course } from '../../data/course-catalog';
import { CoursePracticeComponent } from '../../components/course-practice/course-practice.component';
import { CourseProgressService } from '../../services/course-progress.service';

@Component({
  selector: 'app-course-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, CoursePracticeComponent],
  templateUrl: './course-detail.component.html',
  styleUrl: './course-detail.component.css'
})
export class CourseDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly progress = inject(CourseProgressService);

  readonly course: Course | null = this.resolveCourse();
  refreshToken = 0;

  getTotalPractices(course: Course): number {
    return course.modules.reduce((sum, module) => sum + (module.practices?.length ?? 0), 0);
  }

  getProgressPercent(course: Course): number {
    return this.progress.getProgressPercent(course.slug, this.getTotalPractices(course));
  }

  onPracticeChanged(): void {
    this.refreshToken++;
  }

  private resolveCourse(): Course | null {
    const slug = this.route.snapshot.paramMap.get('slug');
    const course = slug ? COURSE_MAP.get(slug) ?? null : null;

    if (!course) {
      void this.router.navigate(['/dashboard']);
    }

    return course;
  }
}
