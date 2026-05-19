import { Component } from '@angular/core';
import { Router, NavigationEnd, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.css'
})
export class TopbarComponent {
  activeTab: 'play' | 'debug' | 'save' | null = 'play';

  constructor(private router: Router) {
    // Escuchar cambios de ruta para deseleccionar pestañas en Dashboard
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const url = event.urlAfterRedirects || event.url;
      if (!url.includes('/laboratorio2d')) {
        this.activeTab = null;
      } else if (this.activeTab === null) {
        this.activeTab = 'play';
      }
    });

    // Validar ruta inicial
    setTimeout(() => {
      if (!this.router.url.includes('/laboratorio2d')) {
        this.activeTab = null;
      }
    }, 100);
  }

  setTab(tab: 'play' | 'debug' | 'save') {
    if (this.router.url.includes('/laboratorio2d')) {
      this.activeTab = tab;
    }
  }
}
