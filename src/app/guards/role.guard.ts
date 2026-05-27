import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import type { SystemRole } from '../core/models/system-roles.models';
import { AuthService } from '../services/auth.service';

export function roleGuard(...allowedRoles: SystemRole[]): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (!auth.isAuthenticated()) {
      return router.createUrlTree(['/login']);
    }

    const role = auth.getRole();
    if (role && allowedRoles.includes(role)) {
      return true;
    }

    return router.createUrlTree([auth.getHomeRoute()]);
  };
}
