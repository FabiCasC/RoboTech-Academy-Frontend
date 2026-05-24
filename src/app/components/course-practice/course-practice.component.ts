import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { type CoursePractice } from '../../data/course-catalog';
import { CourseProgressService } from '../../services/course-progress.service';

@Component({
  selector: 'app-course-practice',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './course-practice.component.html',
  styleUrl: './course-practice.component.css'
})
export class CoursePracticeComponent {
  @Input({ required: true }) courseSlug!: string;
  @Input({ required: true }) practice!: CoursePractice;
  @Output() changed = new EventEmitter<void>();

  private readonly progress = inject(CourseProgressService);

  key(index: number): string {
    return String(index);
  }

  get completed(): boolean {
    return this.progress.isPracticeCompleted(this.courseSlug, this.practice.id);
  }

  toggleCompleted(next: boolean): void {
    this.progress.setPracticeCompleted(this.courseSlug, this.practice.id, next);
    this.changed.emit();
  }

  checklistState(): boolean[] {
    const fallback = new Array((this.practice.kind === 'checklist' ? this.practice.items.length : 0)).fill(false);
    return this.progress.getPracticeState<boolean[]>(this.courseSlug, this.practice.id, fallback);
  }

  setChecklistItem(index: number, checked: boolean): void {
    if (this.practice.kind !== 'checklist') {
      return;
    }

    const state = this.checklistState();
    state[index] = checked;
    this.progress.setPracticeState(this.courseSlug, this.practice.id, state);

    const done = state.length > 0 && state.every(Boolean);
    this.progress.setPracticeCompleted(this.courseSlug, this.practice.id, done);
    this.changed.emit();
  }

  quizState(): { answers: Record<string, number>; submitted: boolean; score: number } {
    return this.progress.getPracticeState(this.courseSlug, this.practice.id, {
      answers: {},
      submitted: false,
      score: 0
    });
  }

  chooseQuizAnswer(questionIndex: number, optionIndex: number): void {
    if (this.practice.kind !== 'quiz') {
      return;
    }

    const state = this.quizState();
    state.answers[String(questionIndex)] = optionIndex;
    state.submitted = false;
    state.score = 0;
    this.progress.setPracticeState(this.courseSlug, this.practice.id, state);
    this.changed.emit();
  }

  submitQuiz(): void {
    if (this.practice.kind !== 'quiz') {
      return;
    }

    const state = this.quizState();
    const total = this.practice.questions.length;
    const correct = this.practice.questions.reduce((acc, question, idx) => {
      const chosen = state.answers[String(idx)];
      return acc + (chosen === question.answerIndex ? 1 : 0);
    }, 0);

    const score = total > 0 ? Math.round((correct / total) * 100) : 0;
    const passed = score >= 70;

    state.submitted = true;
    state.score = score;
    this.progress.setPracticeState(this.courseSlug, this.practice.id, state);
    this.progress.setPracticeCompleted(this.courseSlug, this.practice.id, passed);
    this.changed.emit();
  }

  wiringState(): Record<string, string> {
    return this.progress.getPracticeState(this.courseSlug, this.practice.id, {});
  }

  setWiringChoice(rowIndex: number, value: string): void {
    if (this.practice.kind !== 'wiring') {
      return;
    }

    const state = this.wiringState();
    state[String(rowIndex)] = value;
    this.progress.setPracticeState(this.courseSlug, this.practice.id, state);

    const ok = this.practice.rows.every((row, idx) => state[String(idx)] === row.expectedArduinoPin);
    this.progress.setPracticeCompleted(this.courseSlug, this.practice.id, ok);
    this.changed.emit();
  }

  stateMachineState(): Record<string, string> {
    return this.progress.getPracticeState(this.courseSlug, this.practice.id, {});
  }

  setStateMachineChoice(caseIndex: number, value: string): void {
    if (this.practice.kind !== 'state-machine') {
      return;
    }

    const state = this.stateMachineState();
    state[String(caseIndex)] = value;
    this.progress.setPracticeState(this.courseSlug, this.practice.id, state);

    const ok = this.practice.cases.every((c, idx) => state[String(idx)] === c.expectedAction);
    this.progress.setPracticeCompleted(this.courseSlug, this.practice.id, ok);
    this.changed.emit();
  }
}
