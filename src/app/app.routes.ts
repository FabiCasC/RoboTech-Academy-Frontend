import { Routes } from '@angular/router';
import { Laboratorio2dComponent } from './pages/laboratorio2d/laboratorio2d.component';

export const routes: Routes = [
  { path: 'laboratorio2d', component: Laboratorio2dComponent },
  { path: '', redirectTo: 'laboratorio2d', pathMatch: 'full' }
];