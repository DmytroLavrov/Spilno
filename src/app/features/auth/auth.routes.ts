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
        title: 'Вхід | Spilno',
        loadComponent: () =>
          import('@features/auth/login/login.component').then((m) => m.LoginComponent),
        canActivate: [guestGuard],
      },
      {
        path: 'register',
        title: 'Реєстрація | Spilno',
        loadComponent: () =>
          import('@features/auth/register/register.component').then((m) => m.RegisterComponent),
        canActivate: [guestGuard],
      },
      {
        path: 'pending',
        title: 'Очікування підтвердження | Spilno',
        loadComponent: () =>
          import('@features/auth/pending/pending.component').then((m) => m.PendingComponent),
        canActivate: [statusGuard('pending')],
      },
      {
        path: 'rejected',
        title: 'Доступ заборонено | Spilno',
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
