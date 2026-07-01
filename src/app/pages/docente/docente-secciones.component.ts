import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DocenteAnalyticsService } from '../../services/docente-analytics.service';
import type { SectionSummary } from '../../services/docente-analytics.models';

@Component({
  selector: 'app-docente-secciones',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './docente-secciones.component.html',
  styleUrl: './docente-secciones.component.css'
})
export class DocenteSeccionesComponent implements OnInit {
  private readonly analytics = inject(DocenteAnalyticsService);

  readonly loading = signal(true);
  readonly sections = signal<SectionSummary[]>([]);

  ngOnInit(): void {
    this.analytics.getSections().subscribe({
      next: (rows) => {
        this.sections.set(rows);
        this.loading.set(false);
      },
      error: () => {
        this.sections.set([]);
        this.loading.set(false);
      }
    });
  }
}
