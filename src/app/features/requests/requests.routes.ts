import { Routes } from '@angular/router';

export const requestsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('@features/requests/request-list/request-list.component').then(
        (m) => m.RequestListComponent,
      ),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./request-detail/request-detail.component').then((m) => m.RequestDetailComponent),
  },
];
