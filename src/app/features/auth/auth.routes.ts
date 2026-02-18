import { Routes } from '@angular/router';
import { guestGuard } from '@core/guards/guest.guard';
import { statusGuard } from '@core/guards/status.guard';
import { AuthLayoutComponent } from '@layout/auth-layout/auth-layout.component';

export const authRoutes: Routes = [
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('@features/auth/login/login.component').then((m) => m.LoginComponent),
        canActivate: [guestGuard],
      },
      {
        path: 'register',
        loadComponent: () =>
          import('@features/auth/register/register.component').then((m) => m.RegisterComponent),
        canActivate: [guestGuard],
      },
      {
        path: 'pending',
        loadComponent: () =>
          import('@features/auth/pending/pending.component').then((m) => m.PendingComponent),
        canActivate: [statusGuard('pending')],
      },
      {
        path: 'rejected',
        loadComponent: () =>
          import('@features/auth/rejected/rejected.component').then((m) => m.RejectedComponent),
        canActivate: [statusGuard('rejected')],
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
      },
    ],
  },
];
