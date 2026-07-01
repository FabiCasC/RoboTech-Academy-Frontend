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
