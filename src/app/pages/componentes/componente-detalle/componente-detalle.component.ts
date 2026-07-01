import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ThreeKitViewerComponent } from '../../../components/three-kit-viewer/three-kit-viewer.component';
import { KitDetail, KitItem } from '../models/kit.models';
import { getKitItemById, KIT_CATALOG } from '../data/kit-catalog.data';
import { KitService } from '../../../services/kit.service';

@Component({
  selector: 'app-componente-detalle',
  standalone: true,
  imports: [RouterLink, ThreeKitViewerComponent],
  templateUrl: './componente-detalle.component.html',
  styleUrl: './componente-detalle.component.css'
})
export class ComponenteDetalleComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly kitService = inject(KitService);

  readonly loading = signal(true);
  readonly loadError = signal<string | null>(null);
  readonly item = signal<KitItem | null>(null);
  readonly detail = signal<KitDetail | null>(null);

  codeCopied = false;
  codeExpanded = false;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') ?? '';

    forkJoin({
      catalog: this.kitService.getCatalog().pipe(catchError(() => of(KIT_CATALOG))),
      detail: this.kitService.getDetail(id).pipe(catchError(() => of(null)))
    }).subscribe({
      next: ({ catalog, detail }) => {
        const fromCatalog =
          (Array.isArray(catalog) ? catalog : KIT_CATALOG).find((k) => k.id === id) ??
          getKitItemById(id);

        if (!fromCatalog && !detail) {
          void this.router.navigate(['/components']);
          return;
        }

        this.item.set(fromCatalog ?? null);
        this.detail.set(detail);
        this.loading.set(false);
      },
      error: () => {
        this.loadError.set('No se pudo cargar el componente.');
        this.loading.set(false);
      }
    });
  }

  get hasFullDetail(): boolean {
    return !!this.detail();
  }

  get catalogLabel(): string {
    const current = this.item();
    if (!current) return 'CATÁLOGO DE COMPONENTES';
    return current.category === 'SENSOR'
      ? 'CATÁLOGO DE SENSORES'
      : 'CATÁLOGO DE COMPONENTES';
  }

  toggleCodePanel(): void {
    this.codeExpanded = !this.codeExpanded;
  }

  async copyCode(): Promise<void> {
    const snippet = this.detail()?.codeSnippet;
    if (!snippet) return;

    try {
      await navigator.clipboard.writeText(snippet);
      this.codeCopied = true;
      setTimeout(() => (this.codeCopied = false), 2000);
    } catch {
      this.codeCopied = false;
    }
  }

  addToLab(): void {
    const current = this.item();
    if (!current) return;
    void this.router.navigate(['/laboratorio2d'], {
      queryParams: { add: current.id }
    });
  }
}
