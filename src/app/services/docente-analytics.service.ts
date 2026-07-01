import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { environment } from '../../environments/environment';
import type { StudentMetric, SectionSummary } from './docente-analytics.models';

@Injectable({ providedIn: 'root' })
export class DocenteAnalyticsService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/docente`;

  getSections(): Observable<SectionSummary[]> {
    return this.http.get<SectionSummary[]>(`${this.base}/sections`).pipe(
      catchError(() => of([]))
    );
  }

  getStudents(sectionId?: string): Observable<StudentMetric[]> {
    const url = sectionId
      ? `${this.base}/students?section=${encodeURIComponent(sectionId)}`
      : `${this.base}/students`;
    return this.http.get<StudentMetric[]>(url).pipe(catchError(() => of([])));
  }

  getPlatformKpis(): Observable<{
    totalStudents: number;
    avgProgress: number;
    atRisk: number;
    activeToday: number;
  }> {
    return this.getStudents().pipe(
      map((students) => {
        if (!students.length) {
          return { totalStudents: 0, avgProgress: 0, atRisk: 0, activeToday: 0 };
        }
        return {
          totalStudents: students.length,
          avgProgress: Math.round(
            students.reduce((s, st) => s + st.progressPercent, 0) / students.length
          ),
          atRisk: students.filter((s) => s.status !== 'excelente').length,
          activeToday: students.filter(
            (s) => /hoy/i.test(s.lastActive) || /hace\s+\d+\s*h/i.test(s.lastActive)
          ).length
        };
      })
    );
  }
}
