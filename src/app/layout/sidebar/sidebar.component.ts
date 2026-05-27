import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { navItemsForRole } from '../../core/navigation/role-nav.config';
import { ROLE_PROFILES } from '../../core/models/system-roles.models';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);

  readonly session = this.auth.getSession();
  readonly roleProfile = this.session ? ROLE_PROFILES[this.session.role] : null;
  readonly navItems = this.session ? navItemsForRole(this.session.role) : [];

  isDashboardActive(): boolean {
    return this.router.url.includes('/dashboard') || this.router.url.includes('/proyectos');
  }

  isItemActive(path: string): boolean {
    if (path === '/dashboard') return this.isDashboardActive();
    return this.router.url.startsWith(path);
  }
}
