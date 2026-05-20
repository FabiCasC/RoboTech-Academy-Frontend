import { Component } from '@angular/core';
import { CourseCardComponent } from '../../components/course-card/course-card.component';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { COURSES, getContinueLessonId } from '../aprendizaje/data/courses.data';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CourseCardComponent, RouterLink, RouterLinkActive],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  readonly courses = COURSES.map((course) => ({
    id: course.id,
    badge: course.badge,
    title: course.title,
    description: course.description,
    progress: course.progress,
    image: course.image,
    continueLink: ['/cursos', course.id, 'leccion', getContinueLessonId(course)]
  }));
}
