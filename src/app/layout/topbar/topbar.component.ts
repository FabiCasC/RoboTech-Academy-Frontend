import { Component, inject } from '@angular/core';
import { Router, NavigationEnd, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { ROLE_PROFILES } from '../../core/models/system-roles.models';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.css'
})
export class TopbarComponent {
  activeTab: 'play' | 'debug' | 'save' | null = 'play';

  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  readonly session = this.authService.getSession();
  readonly roleProfile = this.session ? ROLE_PROFILES[this.session.role] : null;
  readonly isStudent = this.authService.hasRole('EST-ROLE');

  constructor() {
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe((event: NavigationEnd) => {
      const url = event.urlAfterRedirects || event.url;
      if (!url.includes('/laboratorio2d')) {
        this.activeTab = null;
      } else if (this.activeTab === null) {
        this.activeTab = 'play';
      }
    });

    setTimeout(() => {
      if (!this.router.url.includes('/laboratorio2d')) {
        this.activeTab = null;
      }
    }, 100);
  }

  showLabTabs(): boolean {
    return this.isStudent && this.router.url.includes('/laboratorio2d');
  }

  setTab(tab: 'play' | 'debug' | 'save'): void {
    if (this.router.url.includes('/laboratorio2d')) {
      this.activeTab = tab;
    }
  }

  logout(): void {
    this.authService.logout();
    void this.router.navigate(['/login']);
  }
}
