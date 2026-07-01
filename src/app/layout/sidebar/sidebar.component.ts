import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { navItemsForRole, type NavItem } from '../../core/navigation/role-nav.config';
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

  /** Getter: la sesión vive en localStorage; no snapshotear al construir (SSR/hidración). */
  get session() {
    return this.auth.getSession();
  }

  get roleProfile() {
    const s = this.session;
    return s ? ROLE_PROFILES[s.role] : null;
  }

  get navItems(): NavItem[] {
    const s = this.session;
    return s ? navItemsForRole(s.role) : [];
  }

  isItemActive(path: string): boolean {
    const url = this.router.url;
    if (path === '/dashboard') {
      return url.includes('/dashboard') || url.includes('/cursos');
    }
    if (path === '/proyectos') {
      return (
        url.includes('/proyectos') ||
        url.includes('/laboratorio2d') ||
        url.includes('/ide-programacion')
      );
    }
    if (path === '/docente') {
      return url === '/docente' || (url.startsWith('/docente') && !url.startsWith('/docente/secciones'));
    }
    return url.startsWith(path);
  }
}
