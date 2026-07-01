import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { KitService } from '../../services/kit.service';
import { KIT_CATALOG } from './data/kit-catalog.data';
import type { KitItem } from './models/kit.models';

@Component({
  selector: 'app-componentes',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './componentes.component.html',
  styleUrl: './componentes.component.css'
})
export class ComponentesComponent implements OnInit {
  private readonly kitService = inject(KitService);

  readonly categories = [
    'TODOS',
    'MICROCONTROLADOR',
    'SENSOR',
    'ACTUADOR',
    'CONECTIVIDAD',
    'ENERGIA',
    'MECANICA',
    'CABLEADO'
  ] as const;

  selectedCategory: (typeof this.categories)[number] = 'TODOS';
  searchQuery = '';

  readonly loading = signal(true);
  readonly items = signal<KitItem[]>([]);

  ngOnInit(): void {
    this.kitService.getCatalog().subscribe({
      next: (rows) => {
        const list = Array.isArray(rows) && rows.length > 0 ? rows : KIT_CATALOG;
        this.items.set(list);
        this.loading.set(false);
      },
      error: () => {
        this.items.set(KIT_CATALOG);
        this.loading.set(false);
      }
    });
  }

  get filteredItems(): KitItem[] {
    const query = this.searchQuery.trim().toLowerCase();

    return this.items().filter((item) => {
      const matchesCategory =
        this.selectedCategory === 'TODOS' ||
        item.category === this.selectedCategory;

      const matchesSearch =
        !query ||
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }

  selectCategory(category: (typeof this.categories)[number]): void {
    this.selectedCategory = category;
  }

  onSearchInput(event: Event): void {
    this.searchQuery = (event.target as HTMLInputElement).value;
  }
}
