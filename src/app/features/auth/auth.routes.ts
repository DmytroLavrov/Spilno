import { Routes } from '@angular/router';
import { guestGuard } from '@core/guards/guest.guard';
import { statusGuard } from '@core/guards/status.guard';

export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./login/login.component').then((m) => m.LoginComponent),
    canActivate: [guestGuard],
  },
  {
    path: 'register',
    loadComponent: () => import('./register/register.component').then((m) => m.RegisterComponent),
    canActivate: [guestGuard],
  },
  {
    path: 'pending',
    loadComponent: () => import('./pending/pending.component').then((m) => m.PendingComponent),
    canActivate: [statusGuard('pending')],
  },
  {
    path: 'rejected',
    loadComponent: () => import('./rejected/rejected.component').then((m) => m.RejectedComponent),
    canActivate: [statusGuard('rejected')],
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
];
