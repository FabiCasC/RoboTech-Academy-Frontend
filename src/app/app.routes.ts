import { Routes } from '@angular/router';
import { Laboratorio2dComponent } from './pages/laboratorio2d/laboratorio2d.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { authChildGuard, authGuard, guestGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [guestGuard] },
  {
    path: '',
    canActivate: [authGuard],
    canActivateChild: [authChildGuard],
    loadComponent: () => import('./layout/layout/layout.component').then(m => m.LayoutComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'cursos/:slug',
        loadComponent: () =>
          import('./pages/course-detail/course-detail.component').then(m => m.CourseDetailComponent)
      },
      {
        path: 'cursos/:courseId/leccion/:lessonId',
        loadComponent: () =>
          import('./pages/aprendizaje/modulo-aprendizaje/modulo-aprendizaje.component').then(
            (m) => m.ModuloAprendizajeComponent
          )
      },
      { path: 'laboratorio2d', component: Laboratorio2dComponent },
      {
        path: 'ide-programacion',
        loadComponent: () =>
          import('./pages/ide-programacion/ide-programacion.component').then(m => m.IdeProgramacionComponent)
      },
      {
        path: 'perfil',
        loadComponent: () => import('./pages/perfil/perfil.component').then(m => m.PerfilComponent)
      },
      {
        path: 'foro',
        loadComponent: () => import('./pages/foro/foro.component').then(m => m.ForoComponent)
      },
      {
        path: 'proyectos',
        loadComponent: () => import('./pages/proyectos/proyectos.component').then(m => m.ProyectosComponent)
      },
      {
        path: 'proyectos/control',
        redirectTo: 'proyectos',
        pathMatch: 'full'
      },
      {
        path: 'proyectos/:projectId',
        loadComponent: () =>
          import('./pages/proyectos/proyecto-dashboard/proyecto-dashboard.component').then(
            (m) => m.ProyectoDashboardComponent
          )
      },
      {
        path: 'components',
        loadComponent: () => import('./pages/componentes/componentes.component').then(m => m.ComponentesComponent)
      },
      {
        path: 'components/:id',
        loadComponent: () =>
          import('./pages/componentes/componente-detalle/componente-detalle.component').then(
            (m) => m.ComponenteDetalleComponent
          )
      }
    ]
  },
  { path: '**', redirectTo: '/login' }
];
