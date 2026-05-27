import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DocenteAnalyticsService } from '../../services/docente-analytics.service';

@Component({
  selector: 'app-docente-secciones',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './docente-secciones.component.html',
  styleUrl: './docente-secciones.component.css'
})
export class DocenteSeccionesComponent {
  private readonly analytics = inject(DocenteAnalyticsService);
  readonly sections = this.analytics.getSections();
}
