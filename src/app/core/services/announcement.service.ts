import { inject, Injectable, Injector, runInInjectionContext, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  addDoc,
  collection,
  collectionData,
  deleteDoc,
  doc,
  Firestore,
  orderBy,
  query,
  Timestamp,
  updateDoc,
} from '@angular/fire/firestore';
import { AuthService } from '@core/services/auth.service';
import { Announcement } from '@models/announcement.model';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AnnouncementService {
  private firestore = inject(Firestore);
  private authService = inject(AuthService);
  private injector = inject(Injector);

  private announcementsCol = collection(this.firestore, 'announcements');

  // Announcements — sorted: important ones at the top, the rest by date
  private announcements$: Observable<Announcement[]> = collectionData(
    query(this.announcementsCol, orderBy('createdAt', 'desc')),
    { idField: 'id' },
  ).pipe(
    map((docs) => {
      const list = docs.map(
        (d) =>
          ({
            ...d,
            createdAt: (d['createdAt'] as Timestamp).toDate(),
          }) as Announcement,
      );

      return [...list.filter((a) => a.important), ...list.filter((a) => !a.important)];
    }),
  );

  public announcements: Signal<Announcement[]> = toSignal(this.announcements$, {
    initialValue: [],
    injector: this.injector,
  });

  // CRUD
  public async createAnnouncement(
    data: Pick<Announcement, 'title' | 'content' | 'important'>,
  ): Promise<void> {
    return runInInjectionContext(this.injector, async () => {
      const user = this.authService.currentUser();
      if (!user) throw new Error('Unauthorized');

      await addDoc(this.announcementsCol, {
        ...data,
        authorId: user.id,
        createdAt: Timestamp.now(),
      });
    });
  }

  public async updateAnnouncement(
    id: string,
    data: Partial<Pick<Announcement, 'title' | 'content' | 'important'>>,
  ): Promise<void> {
    return runInInjectionContext(this.injector, async () => {
      await updateDoc(doc(this.firestore, 'announcements', id), data);
    });
  }

  public async deleteAnnouncement(id: string): Promise<void> {
    return runInInjectionContext(this.injector, async () => {
      await deleteDoc(doc(this.firestore, 'announcements', id));
    });
  }
}
