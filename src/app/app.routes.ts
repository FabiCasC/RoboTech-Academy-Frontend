import { Routes } from '@angular/router';
import { Laboratorio2dComponent } from './pages/laboratorio2d/laboratorio2d.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { authChildGuard, authGuard, guestGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';
import { RoleRedirectComponent } from './core/role-redirect.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [guestGuard] },
  {
    path: '',
    canActivate: [authGuard],
    canActivateChild: [authChildGuard],
    loadComponent: () => import('./layout/layout/layout.component').then(m => m.LayoutComponent),
    children: [
      { path: '', pathMatch: 'full', component: RoleRedirectComponent },
      {
        path: 'dashboard',
        canActivate: [roleGuard('EST-ROLE')],
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'cursos/:slug',
        canActivate: [roleGuard('EST-ROLE')],
        loadComponent: () =>
          import('./pages/course-detail/course-detail.component').then(m => m.CourseDetailComponent)
      },
      {
        path: 'cursos/:courseId/leccion/:lessonId',
        canActivate: [roleGuard('EST-ROLE')],
        loadComponent: () =>
          import('./pages/aprendizaje/modulo-aprendizaje/modulo-aprendizaje.component').then(
            (m) => m.ModuloAprendizajeComponent
          )
      },
      {
        path: 'laboratorio2d',
        canActivate: [roleGuard('EST-ROLE')],
        component: Laboratorio2dComponent
      },
      {
        path: 'ide-programacion',
        canActivate: [roleGuard('EST-ROLE')],
        loadComponent: () =>
          import('./pages/ide-programacion/ide-programacion.component').then(m => m.IdeProgramacionComponent)
      },
      {
        path: 'perfil',
        loadComponent: () => import('./pages/perfil/perfil.component').then(m => m.PerfilComponent)
      },
      {
        path: 'foro',
        canActivate: [roleGuard('EST-ROLE')],
        loadComponent: () => import('./pages/foro/foro.component').then(m => m.ForoComponent)
      },
      {
        path: 'proyectos',
        canActivate: [roleGuard('EST-ROLE')],
        loadComponent: () => import('./pages/proyectos/proyectos.component').then(m => m.ProyectosComponent)
      },
      {
        path: 'proyectos/control',
        redirectTo: 'proyectos',
        pathMatch: 'full'
      },
      {
        path: 'proyectos/:projectId',
        canActivate: [roleGuard('EST-ROLE')],
        loadComponent: () =>
          import('./pages/proyectos/proyecto-dashboard/proyecto-dashboard.component').then(
            (m) => m.ProyectoDashboardComponent
          )
      },
      {
        path: 'components',
        canActivate: [roleGuard('EST-ROLE')],
        loadComponent: () => import('./pages/componentes/componentes.component').then(m => m.ComponentesComponent)
      },
      {
        path: 'components/:id',
        canActivate: [roleGuard('EST-ROLE')],
        loadComponent: () =>
          import('./pages/componentes/componente-detalle/componente-detalle.component').then(
            (m) => m.ComponenteDetalleComponent
          )
      },
      {
        path: 'docente',
        canActivate: [roleGuard('DOC-ROLE')],
        loadComponent: () =>
          import('./pages/docente/docente-panel.component').then(m => m.DocentePanelComponent)
      },
      {
        path: 'docente/secciones',
        canActivate: [roleGuard('DOC-ROLE')],
        loadComponent: () =>
          import('./pages/docente/docente-secciones.component').then(m => m.DocenteSeccionesComponent)
      },
      {
        path: 'sistema',
        canActivate: [roleGuard('SYS-ROLE', 'DOC-ROLE')],
        loadComponent: () =>
          import('./pages/sistema/sistema-monitoreo.component').then(m => m.SistemaMonitoreoComponent)
      }
    ]
  },
  { path: '**', redirectTo: '/login' }
];
