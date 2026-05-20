import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Course, Lesson, LessonStatus } from '../models/learning.models';
import {
  getAllLessons,
  getContinueLessonId,
  getCourseById,
  getLessonById
} from '../data/courses.data';

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

  readonly course: Course | undefined;
  readonly lessons: Lesson[];
  activeLesson: Lesson | undefined;
  activeIndex = 0;
  maxUnlockedIndex = 0;

  constructor() {
    const courseId = this.route.snapshot.paramMap.get('courseId') ?? '';
    this.course = getCourseById(courseId);
    this.lessons = this.course ? getAllLessons(this.course) : [];

    if (!this.course) {
      void this.router.navigate(['/dashboard']);
    } else {
      const completedCount = Math.floor((this.course.progress / 100) * this.lessons.length);
      this.maxUnlockedIndex = Math.min(completedCount, this.lessons.length - 1);
      if (this.maxUnlockedIndex < 0) this.maxUnlockedIndex = 0;
    }
  }

  get activeModule() {
    return this.course?.modules[0];
  }

  ngOnInit(): void {
    if (!this.course) return;

    this.route.paramMap.subscribe((params) => {
      const lessonId =
        params.get('lessonId') ?? getContinueLessonId(this.course!);
      this.setActiveLesson(lessonId);
    });
  }

  get moduleProgress(): number {
    if (!this.lessons.length) return 0;
    return Math.round(((this.maxUnlockedIndex + 1) / this.lessons.length) * 100);
  }

  getLessonStatus(index: number): LessonStatus {
    if (index === this.activeIndex) return 'active';
    if (index <= this.maxUnlockedIndex) return 'completed';
    return 'locked';
  }

  isLessonClickable(index: number): boolean {
    return index <= this.maxUnlockedIndex;
  }

  goToLesson(lesson: Lesson, index: number): void {
    if (!this.isLessonClickable(index) || !this.course) return;
    void this.router.navigate(['/cursos', this.course.id, 'leccion', lesson.id]);
  }

  goPrevious(): void {
    if (this.activeIndex > 0 && this.course) {
      const prev = this.lessons[this.activeIndex - 1];
      void this.router.navigate(['/cursos', this.course.id, 'leccion', prev.id]);
    }
  }

  goNext(): void {
    if (this.activeIndex < this.lessons.length - 1 && this.course) {
      const next = this.lessons[this.activeIndex + 1];
      void this.router.navigate(['/cursos', this.course.id, 'leccion', next.id]);
    }
  }

  get hasPrevious(): boolean {
    return this.activeIndex > 0;
  }

  get hasNext(): boolean {
    return this.activeIndex < this.lessons.length - 1;
  }

  private setActiveLesson(lessonId: string): void {
    if (!this.course) return;

    const lesson = getLessonById(this.course, lessonId) ?? this.lessons[0];
    this.activeLesson = lesson;
    this.activeIndex = this.lessons.findIndex((l) => l.id === lesson.id);
    if (this.activeIndex < 0) this.activeIndex = 0;

    if (this.activeIndex > this.maxUnlockedIndex) {
      this.maxUnlockedIndex = this.activeIndex;
      this.course.progress = this.moduleProgress;
    }
  }
}
