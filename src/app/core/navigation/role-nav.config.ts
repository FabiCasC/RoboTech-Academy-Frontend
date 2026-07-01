import type { SystemRole } from '../models/system-roles.models';

export interface NavItem {
  path: string;
  label: string;
  icon: string;
  roles: SystemRole[];
}

export const ROLE_NAV_ITEMS: NavItem[] = [
  {
    path: '/dashboard',
    label: 'Aprendizaje',
    icon: 'school',
    roles: ['EST-ROLE']
  },
  {
    path: '/proyectos',
    label: 'Laboratorio',
    icon: 'settings_input_component',
    roles: ['EST-ROLE']
  },
  {
    path: '/components',
    label: 'Kit Componentes',
    icon: 'memory',
    roles: ['EST-ROLE']
  },
  {
    path: '/foro',
    label: 'Foro',
    icon: 'forum',
    roles: ['EST-ROLE']
  },
  {
    path: '/docente',
    label: 'Panel Docente',
    icon: 'analytics',
    roles: ['DOC-ROLE']
  },
  {
    path: '/docente/secciones',
    label: 'Mis Secciones',
    icon: 'groups',
    roles: ['DOC-ROLE']
  },
  {
    path: '/sistema',
    label: 'Motores SYS',
    icon: 'hub',
    roles: ['SYS-ROLE']
  }
];

export function navItemsForRole(role: SystemRole): NavItem[] {
  return ROLE_NAV_ITEMS.filter((item) => item.roles.includes(role));
}
