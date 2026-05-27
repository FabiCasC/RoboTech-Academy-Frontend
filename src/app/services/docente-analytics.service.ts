import { Injectable } from '@angular/core';

export interface StudentMetric {
  id: string;
  name: string;
  section: string;
  progressPercent: number;
  labSessions: number;
  ideCompilations: number;
  lastActive: string;
  status: 'excelente' | 'en_riesgo' | 'inactivo';
}

export interface SectionSummary {
  id: string;
  name: string;
  studentCount: number;
  avgProgress: number;
  atRiskCount: number;
}

/**
 * DOC-ROLE · Métricas de seguimiento académico (datos demo).
 */
@Injectable({ providedIn: 'root' })
export class DocenteAnalyticsService {
  private readonly sections: SectionSummary[] = [
    { id: '7A', name: '7° A — Robótica', studentCount: 28, avgProgress: 72, atRiskCount: 4 },
    { id: '8B', name: '8° B — Electrónica', studentCount: 24, avgProgress: 65, atRiskCount: 6 },
    { id: '9C', name: '9° C — Avanzado', studentCount: 22, avgProgress: 81, atRiskCount: 2 }
  ];

  private readonly students: StudentMetric[] = [
    {
      id: 'ST-001',
      name: "Alex 'Tech' Rivera",
      section: '7A',
      progressPercent: 78,
      labSessions: 14,
      ideCompilations: 22,
      lastActive: 'Hace 2 h',
      status: 'excelente'
    },
    {
      id: 'ST-002',
      name: 'Sofía Mendoza',
      section: '7A',
      progressPercent: 45,
      labSessions: 6,
      ideCompilations: 8,
      lastActive: 'Hace 5 días',
      status: 'en_riesgo'
    },
    {
      id: 'ST-003',
      name: 'Diego Castillo',
      section: '8B',
      progressPercent: 92,
      labSessions: 18,
      ideCompilations: 31,
      lastActive: 'Hoy',
      status: 'excelente'
    },
    {
      id: 'ST-004',
      name: 'Valentina Ruiz',
      section: '8B',
      progressPercent: 38,
      labSessions: 3,
      ideCompilations: 4,
      lastActive: 'Hace 12 días',
      status: 'inactivo'
    },
    {
      id: 'ST-005',
      name: 'Mateo Herrera',
      section: '9C',
      progressPercent: 88,
      labSessions: 16,
      ideCompilations: 27,
      lastActive: 'Ayer',
      status: 'excelente'
    },
    {
      id: 'ST-006',
      name: 'Camila Torres',
      section: '9C',
      progressPercent: 52,
      labSessions: 9,
      ideCompilations: 11,
      lastActive: 'Hace 3 días',
      status: 'en_riesgo'
    }
  ];

  getSections(): SectionSummary[] {
    return [...this.sections];
  }

  getStudents(sectionId?: string): StudentMetric[] {
    if (!sectionId) return [...this.students];
    return this.students.filter((s) => s.section === sectionId);
  }

  getPlatformKpis() {
    const students = this.students;
    return {
      totalStudents: students.length,
      avgProgress: Math.round(
        students.reduce((s, st) => s + st.progressPercent, 0) / students.length
      ),
      atRisk: students.filter((s) => s.status !== 'excelente').length,
      activeToday: students.filter((s) => s.lastActive.includes('Hoy') || s.lastActive.includes('h')).length
    };
  }
}
