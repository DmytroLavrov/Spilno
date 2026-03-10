import { Routes } from '@angular/router';
import { roleGuard } from '@core/guards/role.guard';

export const usersRoutes: Routes = [
  {
    path: '',
    canActivate: [roleGuard('admin')],
    loadComponent: () => import('./user-list/user-list.component').then((m) => m.UserListComponent),
  },
];
