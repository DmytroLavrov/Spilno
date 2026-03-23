import { TestBed } from '@angular/core/testing';
import {
  addDoc,
  collectionData,
  deleteDoc,
  doc,
  Firestore,
  query,
  Timestamp,
  updateDoc,
  where,
} from '@angular/fire/firestore';

import { RequestService } from '@core/services/request.service';
import { BehaviorSubject, firstValueFrom, of, throwError } from 'rxjs';
import { Mock } from 'vitest';
import { AuthService } from '@core/services/auth.service';

vi.mock('@angular/fire/firestore', async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    collection: vi.fn().mockReturnValue('mock-collection-ref'),
    doc: vi.fn().mockReturnValue('mock-doc-ref'),
    addDoc: vi.fn(),
    updateDoc: vi.fn(),
    deleteDoc: vi.fn(),
    query: vi.fn().mockReturnValue('mock-query'),
    where: vi.fn().mockReturnValue('mock-where-clause'),
    orderBy: vi.fn().mockReturnValue('mock-order-by-clause'),
    collectionData: vi.fn(),
    // We are using Timestamp, because the service uses Timestamp.now()
    Timestamp: {
      now: vi.fn(() => ({ toDate: () => new Date('2026-03-23T12:00:00Z') })),
    },
  };
});

describe('RequestService', () => {
  let service: RequestService;
  let mockAuthService: any;
  let currentUserSubject: BehaviorSubject<any>;

  beforeEach(() => {
    vi.clearAllMocks();

    currentUserSubject = new BehaviorSubject<any>(null);

    mockAuthService = {
      currentUser$: currentUserSubject.asObservable(),
      // We soak the currentUser() signal as a regular function that returns the current value
      currentUser: vi.fn(() => currentUserSubject.value),
    };

    // By default, collectionData returns an empty array,
    // so that toSignal() does not throw errors when creating the service
    (collectionData as Mock).mockReturnValue(of([]));

    TestBed.configureTestingModule({
      providers: [
        RequestService,
        { provide: AuthService, useValue: mockAuthService },
        { provide: Firestore, useValue: {} },
      ],
    });

    // The service is being created here, so the initial toSignal will already have executed
    service = TestBed.inject(RequestService);
  });

  // ─── TESTS FOR getRequests() AND THREADS ───

  it('should return an empty array if the user is not authorized', async () => {
    currentUserSubject.next(null);
    const result = await firstValueFrom(service.getRequests());
    expect(result).toEqual([]);
  });

  it('should query ALL applications if the user is admin', async () => {
    currentUserSubject.next({ id: 'admin-1', role: 'admin' });

    // Simulate data from the database. Note the fake Timestamp with the toDate() method
    const mockDocs = [
      {
        id: 'req-1',
        type: 'plumbing',
        createdAt: { toDate: () => new Date('2026-03-23T10:00:00Z') },
        updatedAt: { toDate: () => new Date('2026-03-23T11:00:00Z') },
      },
    ];
    (collectionData as Mock).mockReturnValue(of(mockDocs));

    const result = await firstValueFrom(service.getRequests());

    // Check that the query was called WITHOUT where (admin sees everything)
    expect(query).toHaveBeenCalledWith('mock-collection-ref', 'mock-order-by-clause');
    // Check if map worked correctly and converted the dates
    expect(result[0].id).toBe('req-1');
    expect(result[0].createdAt).toBeInstanceOf(Date);
  });

  it('should make a request ONLY for their own applications if the user is a resident', async () => {
    currentUserSubject.next({ id: 'res-1', role: 'resident' });
    (collectionData as Mock).mockReturnValue(of([]));

    await firstValueFrom(service.getRequests());

    // Check that where was called with the correct user ID
    expect(where).toHaveBeenCalledWith('userId', '==', 'res-1');
    expect(query).toHaveBeenCalledWith(
      'mock-collection-ref',
      'mock-where-clause',
      'mock-order-by-clause',
    );
  });

  it('should catch a Firebase error and return an empty array', async () => {
    currentUserSubject.next({ id: 'res-1', role: 'resident' });
    // Simulate the base falling
    (collectionData as Mock).mockReturnValue(throwError(() => new Error('Firebase DB Error')));

    const result = await firstValueFrom(service.getRequests());

    expect(result).toEqual([]);
  });

  // ─── TESTS FOR CRUD OPERATIONS ───

  it('createRequest: should throw an "Unauthorized" error if the user does not exist', async () => {
    currentUserSubject.next(null); // No user
    await expect(service.createRequest({ type: 'plumbing', description: 'Test' })).rejects.toThrow(
      'Unauthorized',
    );
  });

  it('createRequest: should add a document to Firestore with the correct data', async () => {
    currentUserSubject.next({ id: 'user-123', name: 'Дмитро', apartmentNumber: '42' });

    await service.createRequest({ type: 'electrical', description: 'Немає світла' });

    expect(addDoc).toHaveBeenCalledWith(
      'mock-collection-ref',
      expect.objectContaining({
        type: 'electrical',
        description: 'Немає світла',
        userId: 'user-123',
        userName: 'Дмитро',
        apartmentNumber: '42',
        status: 'new',
      }),
    );
    // Timestamp.now() should have been called too
    expect(Timestamp.now).toHaveBeenCalled();
  });

  it('updateStatus: should update the status of the application', async () => {
    await service.updateStatus('req-999', 'in_progress');

    expect(doc).toHaveBeenCalledWith(expect.anything(), 'requests', 'req-999');
    expect(updateDoc).toHaveBeenCalledWith(
      'mock-doc-ref',
      expect.objectContaining({
        status: 'in_progress',
      }),
    );
  });

  it('deleteRequest: should delete the request', async () => {
    await service.deleteRequest('req-999');

    expect(doc).toHaveBeenCalledWith(expect.anything(), 'requests', 'req-999');
    expect(deleteDoc).toHaveBeenCalledWith('mock-doc-ref');
  });
});
