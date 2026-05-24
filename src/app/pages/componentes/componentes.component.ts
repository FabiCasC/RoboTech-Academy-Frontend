import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { KIT_CATALOG } from './data/kit-catalog.data';
import type { KitItem } from './models/kit.models';

@Component({
  selector: 'app-componentes',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './componentes.component.html',
  styleUrl: './componentes.component.css'
})
export class ComponentesComponent {
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

  readonly items: KitItem[] = KIT_CATALOG;

  get filteredItems(): KitItem[] {
    const query = this.searchQuery.trim().toLowerCase();

    return this.items.filter((item) => {
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
