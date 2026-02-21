import { inject, Injectable } from '@angular/core';
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
import { map, Observable } from 'rxjs';
import { MaintenanceRequest, RequestStatus } from '@models/request.model';
import { toSignal } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root',
})
export class RequestService {
  private firestore = inject(Firestore);
  private authService = inject(AuthService);

  private requestsCollection = collection(this.firestore, 'requests');

  public getRequests(): Observable<MaintenanceRequest[]> {
    const user = this.authService.currentUser();

    const q =
      user?.role === 'admin'
        ? // Admin sees all applications sorted by date
          query(this.requestsCollection, orderBy('createdAt', 'desc'))
        : // The resident sees only his own
          query(
            this.requestsCollection,
            where('userId', '==', user?.id),
            orderBy('createdAt', 'desc'),
          );

    return collectionData(q, { idField: 'id' }).pipe(
      map((docs) =>
        docs.map(
          (d) =>
            ({
              ...d,
              // Convert Firestore Timestamp → JS Date
              createdAt: (d['createdAt'] as Timestamp).toDate(),
              updatedAt: (d['updatedAt'] as Timestamp).toDate(),
            }) as MaintenanceRequest,
        ),
      ),
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

    await addDoc(this.requestsCollection, {
      ...data,
      userId: user.id,
      userName: user.name,
      apartmentNumber: user.apartmentNumber,
      status: 'new' as RequestStatus,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  }

  public async updateStatus(requestId: string, status: RequestStatus): Promise<void> {
    const ref = doc(this.firestore, 'requests', requestId);
    await updateDoc(ref, {
      status,
      updatedAt: Timestamp.now(),
    });
  }

  public async deleteRequest(requestId: string): Promise<void> {
    const ref = doc(this.firestore, 'requests', requestId);
    await deleteDoc(ref);
  }
}
