import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { map, take } from 'rxjs';

export const roleGuard = (requiredRole: string): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    return authService.currentUser$.pipe(
      take(1),
      map((user) => {
        if (user?.role === requiredRole) return true;
        router.navigate(['/dashboard']);
        return false;
      }),
    );
  };
};
