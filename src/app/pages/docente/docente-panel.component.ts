import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  DocenteAnalyticsService,
  type StudentMetric
} from '../../services/docente-analytics.service';
import { AuthService } from '../../services/auth.service';
import { ROLE_PROFILES } from '../../core/models/system-roles.models';

@Component({
  selector: 'app-docente-panel',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './docente-panel.component.html',
  styleUrl: './docente-panel.component.css'
})
export class DocentePanelComponent implements OnInit {
  private readonly analytics = inject(DocenteAnalyticsService);
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);

  readonly profile = ROLE_PROFILES['DOC-ROLE'];
  readonly session = this.auth.getSession();
  readonly kpis = this.analytics.getPlatformKpis();
  readonly sections = this.analytics.getSections();

  selectedSection = signal<string | null>(null);

  ngOnInit(): void {
    const section = this.route.snapshot.queryParamMap.get('section');
    if (section) {
      this.selectedSection.set(section);
    }
  }

  get students(): StudentMetric[] {
    return this.analytics.getStudents(this.selectedSection() ?? undefined);
  }

  selectSection(id: string | null): void {
    this.selectedSection.set(id);
  }

  statusLabel(status: StudentMetric['status']): string {
    const map: Record<StudentMetric['status'], string> = {
      excelente: 'EXCELENTE',
      en_riesgo: 'EN RIESGO',
      inactivo: 'INACTIVO'
    };
    return map[status];
  }
}
