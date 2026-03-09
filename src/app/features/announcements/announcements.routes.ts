import { Routes } from '@angular/router';

export const announcementsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./announcement-list/announcement-list.component').then(
        (m) => m.AnnouncementListComponent,
      ),
  },
];
