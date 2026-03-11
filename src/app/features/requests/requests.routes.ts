import { Routes } from '@angular/router';

export const requestsRoutes: Routes = [
  {
    path: '',
    title: 'Заявки | Spilno',
    loadComponent: () =>
      import('@features/requests/request-list/request-list.component').then(
        (m) => m.RequestListComponent,
      ),
  },
  {
    path: ':id',
    title: 'Деталі заявки | Spilno',
    loadComponent: () =>
      import('@features/requests/request-detail/request-detail.component').then(
        (m) => m.RequestDetailComponent,
      ),
  },
];
