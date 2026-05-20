import { Routes } from '@angular/router';
import { Laboratorio2dComponent } from './pages/laboratorio2d/laboratorio2d.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: '',
    loadComponent: () => import('./layout/layout/layout.component').then(m => m.LayoutComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'laboratorio2d', component: Laboratorio2dComponent },
      { path: 'ide-programacion', loadComponent: () => import('./pages/ide-programacion/ide-programacion.component').then(m => m.IdeProgramacionComponent) },
      { path: 'perfil', loadComponent: () => import('./pages/perfil/perfil.component').then(m => m.PerfilComponent) },
      { path: 'foro', loadComponent: () => import('./pages/foro/foro.component').then(m => m.ForoComponent) },
      { path: 'proyectos', loadComponent: () => import('./pages/proyectos/proyectos.component').then(m => m.ProyectosComponent) },
      { path: 'components', loadComponent: () => import('./pages/componentes/componentes.component').then(m => m.ComponentesComponent) }
    ]
  },
  { path: '**', redirectTo: '/login' }
];