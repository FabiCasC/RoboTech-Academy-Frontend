/** Actores definidos en la Especificación de Requisitos (SRS). */
export type SystemRole = 'EST-ROLE' | 'DOC-ROLE' | 'SYS-ROLE';

export interface SessionUser {
  email: string;
  displayName: string;
  role: SystemRole;
}

export interface RoleProfile {
  role: SystemRole;
  code: string;
  label: string;
  description: string;
  homeRoute: string;
}

export const ROLE_PROFILES: Record<SystemRole, RoleProfile> = {
  'EST-ROLE': {
    role: 'EST-ROLE',
    code: 'EST',
    label: 'Estudiante autónomo',
    description:
      'Consume lecciones, interactúa con el catálogo, construye circuitos virtuales y ejecuta simulaciones sin asistencia docente mandatoria.',
    homeRoute: '/dashboard'
  },
  'DOC-ROLE': {
    role: 'DOC-ROLE',
    code: 'DOC',
    label: 'Docente asignado',
    description:
      'Supervisa el progreso académico, analiza patrones de aprendizaje y evalúa métricas de rendimiento por sección.',
    homeRoute: '/docente'
  },
  'SYS-ROLE': {
    role: 'SYS-ROLE',
    code: 'SYS',
    label: 'Sistema automatizado',
    description:
      'Orquesta validación de hardware (grafos), análisis sintáctico del IDE, persistencia y renderizado p5.js.',
    homeRoute: '/sistema'
  }
};
