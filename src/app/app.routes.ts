import { Routes } from '@angular/router';
import { Laboratorio2dComponent } from './pages/laboratorio2d/laboratorio2d.component';

export const routes: Routes = [
  { path: 'laboratorio2d', component: Laboratorio2dComponent },
  { path: '', redirectTo: 'laboratorio2d', pathMatch: 'full' }
];
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/layout/layout.component').then(m => m.LayoutComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { 
        path: 'dashboard', 
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent) 
      }
    ]
  }
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];
