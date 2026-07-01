import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Course, Lesson, LessonStatus } from '../models/learning.models';
import { CoursesApiService } from '../../../core/api/courses-api.service';
import {
  findLesson,
  flattenLessons,
  mapLearningCourseDto
} from '../../../core/api/course.mapper';
import type { JsonObject } from '../../../core/api/api.models';

@Component({
  selector: 'app-modulo-aprendizaje',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './modulo-aprendizaje.component.html',
  styleUrl: './modulo-aprendizaje.component.css'
})
export class ModuloAprendizajeComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly coursesApi = inject(CoursesApiService);

  readonly loading = signal(true);
  readonly loadError = signal<string | null>(null);
  readonly course = signal<Course | null>(null);
  readonly lessons = signal<Lesson[]>([]);
  readonly activeLesson = signal<Lesson | null>(null);
  readonly activeIndex = signal(0);
  readonly maxUnlockedIndex = signal(0);

  ngOnInit(): void {
    const courseId = this.route.snapshot.paramMap.get('courseId') ?? '';
    if (!courseId) {
      void this.router.navigate(['/dashboard']);
      return;
    }

    forkJoin({
      course: this.coursesApi.getBySlug(courseId),
      progress: this.coursesApi.getProgress(courseId).pipe(catchError(() => of({})))
    }).subscribe({
      next: ({ course, progress }) => {
        const mapped = mapLearningCourseDto(course as JsonObject);
        const progressObj = progress as JsonObject;
        const pct = Number(progressObj['percent'] ?? progressObj['progress'] ?? mapped.progress);
        mapped.progress = Number.isFinite(pct) ? pct : 0;

        const allLessons = flattenLessons(mapped);
        this.course.set(mapped);
        this.lessons.set(allLessons);

        const completedCount = Math.floor((mapped.progress / 100) * allLessons.length);
        this.maxUnlockedIndex.set(
          Math.min(Math.max(completedCount, 0), Math.max(allLessons.length - 1, 0))
        );

        this.loading.set(false);
        this.bindLessonFromRoute();
      },
      error: () => {
        this.loadError.set('No se pudo cargar el módulo de aprendizaje.');
        this.loading.set(false);
        void this.router.navigate(['/dashboard']);
      }
    });

    this.route.paramMap.subscribe(() => this.bindLessonFromRoute());
  }

  get activeModule() {
    return this.course()?.modules[0];
  }

  get moduleProgress(): number {
    const list = this.lessons();
    if (!list.length) return 0;
    return Math.round(((this.maxUnlockedIndex() + 1) / list.length) * 100);
  }

  getLessonStatus(index: number): LessonStatus {
    if (index === this.activeIndex()) return 'active';
    if (index <= this.maxUnlockedIndex()) return 'completed';
    return 'locked';
  }

  isLessonClickable(index: number): boolean {
    return index <= this.maxUnlockedIndex();
  }

  goToLesson(lesson: Lesson, index: number): void {
    const c = this.course();
    if (!this.isLessonClickable(index) || !c) return;
    void this.router.navigate(['/cursos', c.id, 'leccion', lesson.id]);
  }

  goPrevious(): void {
    const c = this.course();
    const list = this.lessons();
    const idx = this.activeIndex();
    if (idx > 0 && c) {
      const prev = list[idx - 1];
      void this.router.navigate(['/cursos', c.id, 'leccion', prev.id]);
    }
  }

  goNext(): void {
    const c = this.course();
    const list = this.lessons();
    const idx = this.activeIndex();
    if (idx < list.length - 1 && c) {
      const next = list[idx + 1];
      void this.router.navigate(['/cursos', c.id, 'leccion', next.id]);
    }
  }

  get hasPrevious(): boolean {
    return this.activeIndex() > 0;
  }

  get hasNext(): boolean {
    return this.activeIndex() < this.lessons().length - 1;
  }

  private bindLessonFromRoute(): void {
    const c = this.course();
    if (!c) return;

    const list = this.lessons();
    const lessonId = this.route.snapshot.paramMap.get('lessonId') ?? list[0]?.id ?? '';
    const lesson = findLesson(c, lessonId) ?? list[0];
    if (!lesson) return;

    this.activeLesson.set(lesson);
    const idx = list.findIndex((l) => l.id === lesson.id);
    this.activeIndex.set(idx < 0 ? 0 : idx);

    if (idx > this.maxUnlockedIndex()) {
      this.maxUnlockedIndex.set(idx);
      this.course.update((prev) =>
        prev ? { ...prev, progress: this.moduleProgress } : prev
      );
    }
  }
}
