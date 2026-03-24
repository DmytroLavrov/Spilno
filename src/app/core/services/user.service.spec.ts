import { TestBed } from '@angular/core/testing';
import {
  collectionData,
  deleteDoc,
  doc,
  Firestore,
  orderBy,
  updateDoc,
  where,
} from '@angular/fire/firestore';

import { UserService } from '@core/services/user.service';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { Mock } from 'vitest';
import { AuthService } from '@core/services/auth.service';

vi.mock('@angular/fire/firestore', async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    collection: vi.fn().mockReturnValue('mock-users-collection'),
    doc: vi.fn().mockReturnValue('mock-user-doc'),
    updateDoc: vi.fn(),
    deleteDoc: vi.fn(),
    query: vi.fn().mockReturnValue('mock-query'),
    where: vi.fn().mockReturnValue('mock-where'),
    orderBy: vi.fn().mockReturnValue('mock-order-by'),
    collectionData: vi.fn(),
  };
});

describe('UserService', () => {
  let service: UserService;
  let mockAuthService: any;
  let currentUserSubject: BehaviorSubject<any>;

  beforeEach(() => {
    vi.clearAllMocks();

    currentUserSubject = new BehaviorSubject<any>(null);

    mockAuthService = {
      currentUser$: currentUserSubject.asObservable(),
    };

    (collectionData as Mock).mockReturnValue(of([]));

    TestBed.configureTestingModule({
      providers: [
        UserService,
        { provide: AuthService, useValue: mockAuthService },
        { provide: Firestore, useValue: {} },
      ],
    });

    service = TestBed.inject(UserService);
  });

  // ─── TESTS FOR THREADS AND SIGNALS ───

  it('pendingUsers and pendingUsersCount: should be empty/0 if the user is not admin', () => {
    // Simulate an ordinary resident
    currentUserSubject.next({ id: 'user-1', role: 'resident' });

    expect(service.pendingUsers()).toEqual([]);
    expect(service.pendingUsersCount()).toBe(0);
  });

  it('pendingUsers and pendingUsersCount: should load data if the user is admin', () => {
    const mockPending = [
      { id: '1', name: 'Олексій', createdAt: { toDate: () => new Date('2026-03-23') } },
      { id: '2', name: 'Марія', createdAt: { toDate: () => new Date('2026-03-24') } },
    ];
    (collectionData as Mock).mockReturnValue(of(mockPending));

    currentUserSubject.next({ id: 'admin-1', role: 'admin' });

    expect(where).toHaveBeenCalledWith('status', '==', 'pending');

    expect(service.pendingUsers().length).toBe(2);
    expect(service.pendingUsersCount()).toBe(2);
    expect(service.pendingUsers()[0].name).toBe('Олексій');
    expect(service.pendingUsers()[0].createdAt).toBeInstanceOf(Date);
  });

  it('pendingUsers: should catch a Firebase error and return an empty array', () => {
    (collectionData as Mock).mockReturnValue(throwError(() => new Error('DB Error')));

    currentUserSubject.next({ id: 'admin-1', role: 'admin' });

    expect(service.pendingUsers()).toEqual([]);
    expect(service.pendingUsersCount()).toBe(0);
  });

  it('activeUsers and rejectedUsers: should be initialized correctly', () => {
    // These signals are created immediately, so check if the correct queries were called for them
    expect(where).toHaveBeenCalledWith('status', '==', 'active');
    expect(where).toHaveBeenCalledWith('status', '==', 'rejected');
    expect(orderBy).toHaveBeenCalledWith('createdAt', 'desc'); // for rejected
  });

  // ─── TESTS FOR CRUD AND BUSINESS LOGIC ───

  it('updateUserStatus: should update the user status', async () => {
    await service.updateUserStatus('user-123', 'active');

    expect(doc).toHaveBeenCalledWith(expect.anything(), 'users', 'user-123');
    expect(updateDoc).toHaveBeenCalledWith('mock-user-doc', { status: 'active' });
  });

  it('approveUser: should set the status to "active"', async () => {
    // Can intercept the updateDoc call to make sure approveUser is taking the correct action
    await service.approveUser('user-123');
    expect(updateDoc).toHaveBeenCalledWith('mock-user-doc', { status: 'active' });
  });

  it('rejectUser: should set the status to "rejected"', async () => {
    await service.rejectUser('user-123');
    expect(updateDoc).toHaveBeenCalledWith('mock-user-doc', { status: 'rejected' });
  });

  it("deleteUser: should delete the user's document", async () => {
    await service.deleteUser('user-999');

    expect(doc).toHaveBeenCalledWith(expect.anything(), 'users', 'user-999');
    expect(deleteDoc).toHaveBeenCalledWith('mock-user-doc');
  });
});
