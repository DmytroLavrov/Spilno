import { TestBed } from '@angular/core/testing';
import {
  addDoc,
  collectionData,
  deleteDoc,
  doc,
  Firestore,
  orderBy,
  query,
  Timestamp,
  updateDoc,
} from '@angular/fire/firestore';

import { AnnouncementService } from '@core/services/announcement.service';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { Mock } from 'vitest';
import { AuthService } from '@core/services/auth.service';

vi.mock('@angular/fire/firestore', async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    collection: vi.fn().mockReturnValue('mock-collection'),
    doc: vi.fn().mockReturnValue('mock-doc'),
    addDoc: vi.fn(),
    updateDoc: vi.fn(),
    deleteDoc: vi.fn(),
    query: vi.fn().mockReturnValue('mock-query'),
    orderBy: vi.fn().mockReturnValue('mock-order-by'),
    collectionData: vi.fn(),
    Timestamp: {
      now: vi.fn(() => ({ toDate: () => new Date('2026-03-23T12:00:00Z') })),
    },
  };
});

describe('AnnouncementService', () => {
  let service: AnnouncementService;
  let mockAuthService: any;
  let currentUserSubject: BehaviorSubject<any>;

  beforeEach(() => {
    vi.clearAllMocks();

    currentUserSubject = new BehaviorSubject<any>(null);

    mockAuthService = {
      currentUser$: currentUserSubject.asObservable(),
      currentUser: vi.fn(() => currentUserSubject.value),
    };

    // By default, the database returns an empty array
    (collectionData as Mock).mockReturnValue(of([]));

    TestBed.configureTestingModule({
      providers: [
        AnnouncementService,
        { provide: AuthService, useValue: mockAuthService },
        { provide: Firestore, useValue: {} },
      ],
    });

    service = TestBed.inject(AnnouncementService);
  });

  // ─── TESTS FOR SIGNAL announcements() ───

  it('should return an empty array if the user is not authorized', () => {
    currentUserSubject.next(null);
    expect(service.announcements()).toEqual([]);
  });

  it('should query the database, convert dates and SORT important announcements at the top', () => {
    // Prepare fake data from the database (mixture: normal, important, normal)
    const mockDocs = [
      {
        id: '1',
        title: 'Звичайне 1',
        important: false,
        createdAt: { toDate: () => new Date('2026-03-21') },
      },
      {
        id: '2',
        title: 'ВАЖЛИВЕ',
        important: true,
        createdAt: { toDate: () => new Date('2026-03-22') },
      },
      {
        id: '3',
        title: 'Звичайне 2',
        important: false,
        createdAt: { toDate: () => new Date('2026-03-23') },
      },
    ];
    (collectionData as Mock).mockReturnValue(of(mockDocs));

    // Simulate user login
    currentUserSubject.next({ id: 'user-1' });

    // Check if the request is correctly formed
    expect(orderBy).toHaveBeenCalledWith('createdAt', 'desc');
    expect(query).toHaveBeenCalledWith('mock-collection', 'mock-order-by');

    // Check the signal itself
    const result = service.announcements();
    expect(result.length).toBe(3);

    // Check the sorting (important should be FIRST, although it was second in the database)
    expect(result[0].id).toBe('2'); // Important
    expect(result[1].id).toBe('1'); // Normal
    expect(result[2].id).toBe('3'); // Normal

    // Check date conversion
    expect(result[0].createdAt).toBeInstanceOf(Date);
  });

  it('should catch the Firebase error and return an empty array without breaking the app', () => {
    // Simulate the base falling
    (collectionData as Mock).mockReturnValue(throwError(() => new Error('Firebase DB Error')));

    currentUserSubject.next({ id: 'user-1' });

    expect(service.announcements()).toEqual([]);
  });

  // ─── TESTS FOR CRUD OPERATIONS ───

  it('createAnnouncement: should throw an "Unauthorized" error if there is no user', async () => {
    currentUserSubject.next(null);
    await expect(
      service.createAnnouncement({ title: 'Тест', content: 'Текст', important: false }),
    ).rejects.toThrow('Unauthorized');
  });

  it('createAnnouncement: should add a document with the correct authorId and date', async () => {
    currentUserSubject.next({ id: 'admin-123' });

    await service.createAnnouncement({ title: 'Новина', content: 'Текст', important: true });

    expect(addDoc).toHaveBeenCalledWith(
      'mock-collection',
      expect.objectContaining({
        title: 'Новина',
        content: 'Текст',
        important: true,
        authorId: 'admin-123',
      }),
    );
    expect(Timestamp.now).toHaveBeenCalled();
  });

  it('updateAnnouncement: should update the selected fields', async () => {
    await service.updateAnnouncement('ann-99', { title: 'Оновлена назва' });

    expect(doc).toHaveBeenCalledWith(expect.anything(), 'announcements', 'ann-99');
    expect(updateDoc).toHaveBeenCalledWith('mock-doc', { title: 'Оновлена назва' });
  });

  it('deleteAnnouncement: should delete the announcement', async () => {
    await service.deleteAnnouncement('ann-99');

    expect(doc).toHaveBeenCalledWith(expect.anything(), 'announcements', 'ann-99');
    expect(deleteDoc).toHaveBeenCalledWith('mock-doc');
  });
});
