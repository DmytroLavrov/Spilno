import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { map, take } from 'rxjs';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.currentUser$.pipe(
    take(1),
    map((user) => {
      if (!user) {
        router.navigate(['/auth/login']);
        return false;
      }
      if (user.status === 'pending') {
        router.navigate(['/auth/pending']); // page "waiting for approval"
        return false;
      }
      if (user.status === 'rejected') {
        router.navigate(['/auth/rejected']);
        return false;
      }
      return true;
    }),
  );
};
