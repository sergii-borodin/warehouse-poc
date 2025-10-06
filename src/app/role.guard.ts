import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from './services/auth.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // Check if user is authenticated
  if (!auth.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  // Check if user can access the current route
  const currentRoute = route.url.map((segment) => segment.path).join('/');
  const fullRoute = currentRoute ? `/${currentRoute}` : '/';

  if (!auth.canAccessRoute(fullRoute)) {
    // Redirect to access denied page
    router.navigate(['/access-denied']);
    return false;
  }

  return true;
};
