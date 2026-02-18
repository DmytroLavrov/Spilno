import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { map, take } from 'rxjs';

export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.currentUser$.pipe(
    take(1),
    map((user) => {
      if (!user) {
        return true;
      }

      switch (user.status) {
        case 'pending':
          return router.createUrlTree(['/auth/pending']);
        case 'rejected':
          return router.createUrlTree(['/auth/rejected']);
        case 'active':
        default:
          return router.createUrlTree(['/dashboard']);
      }
    }),
  );
};
