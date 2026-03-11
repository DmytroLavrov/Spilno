import { Routes } from '@angular/router';
import { roleGuard } from '@core/guards/role.guard';

export const usersRoutes: Routes = [
  {
    path: '',
    title: 'Керування мешканцями | Spilno',
    canActivate: [roleGuard('admin')],
    loadComponent: () =>
      import('@features/users/user-list/user-list.component').then((m) => m.UserListComponent),
  },
];
