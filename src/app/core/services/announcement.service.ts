import { inject, Injectable, Signal } from '@angular/core';
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
  where,
} from '@angular/fire/firestore';
import { AuthService } from '@core/services/auth.service';
import { Announcement } from '@models/announcement.model';
import { User } from '@models/user.model';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AnnouncementService {
  private firestore = inject(Firestore);
  private authService = inject(AuthService);

  private announcementsCol = collection(this.firestore, 'announcements');
  private usersCol = collection(this.firestore, 'users');

  // Announcements — sorted: important ones at the top, the rest by date
  private announcements$ = collectionData(
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
  });

  // Residents awaiting approval
  private pendingUsers$ = collectionData(query(this.usersCol, where('status', '==', 'pending')), {
    idField: 'id',
  }).pipe(
    map((docs) =>
      docs.map(
        (d) =>
          ({
            ...d,
            createdAt: (d['createdAt'] as Timestamp)?.toDate() || new Date(),
          }) as User,
      ),
    ),
  );

  public pendingUsersCount = toSignal(this.pendingUsers$.pipe(map((u) => u.length)), {
    initialValue: 0,
  });

  public pendingUsers = toSignal(this.pendingUsers$, { initialValue: [] });

  // Active users
  private activeUsers$ = collectionData(query(this.usersCol, where('status', '==', 'active')), {
    idField: 'id',
  }).pipe(
    map((docs) =>
      docs.map(
        (d) =>
          ({
            ...d,
            createdAt: (d['createdAt'] as Timestamp)?.toDate() || new Date(),
          }) as User,
      ),
    ),
  );

  public activeUsers = toSignal(this.activeUsers$, { initialValue: [] });

  // CRUD
  public async createAnnouncement(
    data: Pick<Announcement, 'title' | 'content' | 'important'>,
  ): Promise<void> {
    const user = this.authService.currentUser();
    if (!user) throw new Error('Unauthorized');

    await addDoc(this.announcementsCol, {
      ...data,
      authorId: user.id,
      createdAt: Timestamp.now(),
    });
  }

  public async updateAnnouncement(
    id: string,
    data: Partial<Pick<Announcement, 'title' | 'content' | 'important'>>,
  ): Promise<void> {
    await updateDoc(doc(this.firestore, 'announcements', id), data);
  }

  public async deleteAnnouncement(id: string) {
    await deleteDoc(doc(this.firestore, 'announcements', id));
  }

  // Approval / rejection of registration
  public async approveUser(userId: string): Promise<void> {
    await updateDoc(doc(this.firestore, 'users', userId), { status: 'active' });
  }

  public async rejectUser(userId: string) {
    await updateDoc(doc(this.firestore, 'users', userId), {
      status: 'rejected',
    });
  }
}
