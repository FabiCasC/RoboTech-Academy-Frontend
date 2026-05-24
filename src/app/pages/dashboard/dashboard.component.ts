import { Component, inject } from '@angular/core';
import { CourseCardComponent } from '../../components/course-card/course-card.component';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { COURSE_CATALOG, type Course } from '../../data/course-catalog';
import { CourseProgressService } from '../../services/course-progress.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CourseCardComponent, RouterLink, RouterLinkActive],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  private readonly router = inject(Router);
  private readonly progress = inject(CourseProgressService);

  courses: Array<{
    id: string;
    badge: string;
    title: string;
    description: string;
    progress: number;
    image: string;
    continueLink: any[];
  }> = this.computeCourses();

  constructor() {
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
      this.courses = this.computeCourses();
    });
  }

  private computeCourses() {
    return COURSE_CATALOG.map(course => ({
      id: course.slug,
      badge: course.badge,
      title: course.title,
      description: course.description,
      progress: this.progress.getProgressPercent(course.slug, this.totalPractices(course)),
      image: course.image,
      continueLink: ['/cursos', course.slug]
    }));
  }

  private totalPractices(course: Course): number {
    return course.modules.reduce((sum, module) => sum + (module.practices?.length ?? 0), 0);
  }
}
