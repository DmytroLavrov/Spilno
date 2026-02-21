import { inject, Injectable, Injector, runInInjectionContext } from '@angular/core';
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
import { AuthService } from './auth.service';
import { map, Observable, of, switchMap } from 'rxjs';
import { MaintenanceRequest, RequestStatus } from '@models/request.model';
import { toSignal } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root',
})
export class RequestService {
  private firestore = inject(Firestore);
  private authService = inject(AuthService);
  private injector = inject(Injector);

  private requestsCollection = collection(this.firestore, 'requests');

  public getRequests(): Observable<MaintenanceRequest[]> {
    return this.authService.currentUser$.pipe(
      switchMap((user) => {
        // If the user is not logged in, return an empty array
        if (!user) {
          return of([]);
        }

        return runInInjectionContext(this.injector, () => {
          const q =
            user.role === 'admin'
              ? query(this.requestsCollection, orderBy('createdAt', 'desc'))
              : query(
                  this.requestsCollection,
                  where('userId', '==', user.id),
                  orderBy('createdAt', 'desc'),
                );

          return collectionData(q, { idField: 'id' }).pipe(
            map((docs) =>
              docs.map(
                (d) =>
                  ({
                    ...d,
                    createdAt: (d['createdAt'] as Timestamp).toDate(),
                    updatedAt: (d['updatedAt'] as Timestamp).toDate(),
                  }) as MaintenanceRequest,
              ),
            ),
          );
        });
      }),
    );
  }

  // Signals — for reactive UI without async pipes
  public requests = toSignal(this.getRequests(), { initialValue: [] });

  // CRUD
  public async createRequest(
    data: Pick<MaintenanceRequest, 'type' | 'description'>,
  ): Promise<void> {
    const user = this.authService.currentUser();
    if (!user) throw new Error('Unauthorized');

    await runInInjectionContext(this.injector, async () => {
      await addDoc(this.requestsCollection, {
        ...data,
        userId: user.id,
        userName: user.name,
        apartmentNumber: user.apartmentNumber,
        status: 'new' as RequestStatus,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    });
  }

  public async updateStatus(requestId: string, status: RequestStatus): Promise<void> {
    await runInInjectionContext(this.injector, async () => {
      const ref = doc(this.firestore, 'requests', requestId);
      await updateDoc(ref, {
        status,
        updatedAt: Timestamp.now(),
      });
    });
  }

  public async deleteRequest(requestId: string): Promise<void> {
    await runInInjectionContext(this.injector, async () => {
      const ref = doc(this.firestore, 'requests', requestId);
      await deleteDoc(ref);
    });
  }
}
