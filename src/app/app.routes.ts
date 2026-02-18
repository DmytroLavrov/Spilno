import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },

  // --- Public routes ---
  {
    path: 'auth',
    loadChildren: () => import('@features/auth/auth.routes').then((m) => m.authRoutes),
  },

  // --- TEST ROUTE ---
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('@features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
  },

  { path: '**', redirectTo: 'dashboard' },
];
