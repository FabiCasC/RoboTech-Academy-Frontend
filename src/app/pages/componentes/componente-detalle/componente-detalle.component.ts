import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { KitDetail, KitItem } from '../models/kit.models';
import { getKitItemById } from '../data/kit-catalog.data';
import { getKitDetailById } from '../data/kit-details.data';

@Component({
  selector: 'app-componente-detalle',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './componente-detalle.component.html',
  styleUrl: './componente-detalle.component.css'
})
export class ComponenteDetalleComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly item: KitItem | undefined;
  readonly detail: KitDetail | undefined;
  readonly hasFullDetail: boolean;
  codeCopied = false;
  codeExpanded = false;

  constructor() {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.detail = getKitDetailById(id);
    this.item = this.detail ?? getKitItemById(id);
    this.hasFullDetail = !!this.detail;

    if (!this.item) {
      void this.router.navigate(['/components']);
    }
  }

  get catalogLabel(): string {
    if (!this.item) return 'CATÁLOGO DE COMPONENTES';
    return this.item.category === 'SENSOR'
      ? 'CATÁLOGO DE SENSORES'
      : 'CATÁLOGO DE COMPONENTES';
  }

  toggleCodePanel(): void {
    this.codeExpanded = !this.codeExpanded;
  }

  async copyCode(): Promise<void> {
    if (!this.detail?.codeSnippet) return;

    try {
      await navigator.clipboard.writeText(this.detail.codeSnippet);
      this.codeCopied = true;
      setTimeout(() => (this.codeCopied = false), 2000);
    } catch {
      this.codeCopied = false;
    }
  }

  addToLab(): void {
    // Integración futura con el laboratorio
  }
}
