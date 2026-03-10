import { inject, Injectable, Injector, runInInjectionContext, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
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
import { User, UserStatus } from '@models/user.model';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private firestore = inject(Firestore);
  private injector = inject(Injector);

  private usersCol = collection(this.firestore, 'users');

  // Residents awaiting approval
  private pendingUsers$: Observable<User[]> = collectionData(
    query(this.usersCol, where('status', '==', 'pending')),
    {
      idField: 'id',
    },
  ).pipe(
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

  public pendingUsersCount: Signal<number> = toSignal(
    this.pendingUsers$.pipe(map((u) => u.length)),
    {
      initialValue: 0,
      injector: this.injector,
    },
  );

  public pendingUsers: Signal<User[]> = toSignal(this.pendingUsers$, {
    initialValue: [],
    injector: this.injector,
  });

  // Active users
  private activeUsers$: Observable<User[]> = collectionData(
    query(this.usersCol, where('status', '==', 'active')),
    {
      idField: 'id',
    },
  ).pipe(
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

  public activeUsers: Signal<User[]> = toSignal(this.activeUsers$, {
    initialValue: [],
    injector: this.injector,
  });

  private rejectedUsers$: Observable<User[]> = collectionData(
    query(this.usersCol, where('status', '==', 'rejected'), orderBy('createdAt', 'desc')),
    { idField: 'id' },
  ).pipe(
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

  public rejectedUsers: Signal<User[]> = toSignal(this.rejectedUsers$, {
    initialValue: [],
    injector: this.injector,
  });

  // Approval / rejection of registration
  public async updateUserStatus(userId: string, status: UserStatus): Promise<void> {
    return runInInjectionContext(this.injector, async () => {
      await updateDoc(doc(this.firestore, 'users', userId), {
        status,
      });
    });
  }

  public async approveUser(userId: string): Promise<void> {
    return runInInjectionContext(this.injector, async () => {
      await this.updateUserStatus(userId, 'active');
    });
  }

  public async rejectUser(userId: string): Promise<void> {
    return runInInjectionContext(this.injector, async () => {
      await this.updateUserStatus(userId, 'rejected');
    });
  }

  public async deleteUser(userId: string): Promise<void> {
    return runInInjectionContext(this.injector, async () => {
      await deleteDoc(doc(this.firestore, 'users', userId));
    });
  }
}
