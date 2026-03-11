import { Routes } from '@angular/router';

export const announcementsRoutes: Routes = [
  {
    path: '',
    title: 'Оголошення | Spilno',
    loadComponent: () =>
      import('@features/announcements/announcement-list/announcement-list.component').then(
        (m) => m.AnnouncementListComponent,
      ),
  },
];
