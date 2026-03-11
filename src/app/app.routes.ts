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
    title: 'Авторизація | Spilno',
    loadChildren: () => import('@features/auth/auth.routes').then((m) => m.authRoutes),
  },

  // --- Protected routes with Main Layout ---
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('@layout/main-layout/main-layout.component').then((m) => m.MainLayoutComponent),
    children: [
      {
        path: 'dashboard',
        title: 'Головна | Spilno',
        loadComponent: () =>
          import('@features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'requests',
        title: 'Заявки | Spilno',
        loadChildren: () =>
          import('@features/requests/requests.routes').then((m) => m.requestsRoutes),
      },
      {
        path: 'announcements',
        title: 'Оголошення | Spilno',
        loadChildren: () =>
          import('@features/announcements/announcements.routes').then((m) => m.announcementsRoutes),
      },
      {
        path: 'users',
        title: 'Мешканці | Spilno',
        loadChildren: () => import('@features/users/users.routes').then((m) => m.usersRoutes),
      },
    ],
  },

  // 404 Page
  {
    path: '404',
    title: 'Сторінку не знайдено | Spilno',
    loadComponent: () =>
      import('@features/not-found/not-found.component').then((m) => m.NotFoundComponent),
  },

  // Catch-all — redirect to 404
  { path: '**', redirectTo: '404' },
];
