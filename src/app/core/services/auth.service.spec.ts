import { TestBed } from '@angular/core/testing';
import {
  Auth,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from '@angular/fire/auth';
import { doc, Firestore, setDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';

import { AuthService } from '@core/services/auth.service';
import { FirebaseError } from 'firebase/app';
import { Mock } from 'vitest';

vi.mock('@angular/fire/auth', async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    createUserWithEmailAndPassword: vi.fn(),
    signInWithEmailAndPassword: vi.fn(),
    sendPasswordResetEmail: vi.fn(),
    signOut: vi.fn(),
    // authState is called directly during service creation, so we return a stub
    authState: vi.fn().mockReturnValue({ pipe: vi.fn() }),
  };
});

vi.mock('@angular/fire/firestore', async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    doc: vi.fn(),
    setDoc: vi.fn(),
    getDoc: vi.fn(),
  };
});

describe('AuthService', () => {
  let service: AuthService;
  let mockRouter: any;

  beforeEach(() => {
    mockRouter = {
      navigate: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: Router, useValue: mockRouter },
        // Provide empty objects instead of real database connections
        { provide: Auth, useValue: {} },
        { provide: Firestore, useValue: {} },
      ],
    });

    service = TestBed.inject(AuthService);

    // Clear the mock memory before each test
    vi.clearAllMocks();
  });

  it('should log the user in and redirect to /dashboard', async () => {
    await service.login('test@example.com', 'password123');

    // Check if the Firebase login function was called with the correct data
    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
      expect.anything(), // This is fake this.auth
      'test@example.com',
      'password123',
    );
    // Check the redirect
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should log out the user, clear the signal, and redirect to /auth/login', async () => {
    service.currentUser.set({ id: '1', role: 'resident' } as any);

    await service.logout();

    expect(signOut).toHaveBeenCalled();
    expect(service.currentUser()).toBeNull(); // The signal should become null
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth/login']);
  });

  it('should send an email to reset the password', async () => {
    await service.resetPassword('test@example.com');
    expect(sendPasswordResetEmail).toHaveBeenCalledWith(expect.anything(), 'test@example.com');
  });

  it('should throw a specific error if email is not found when resetting password', async () => {
    const firebaseError = new FirebaseError('auth/user-not-found', 'User not found');
    (sendPasswordResetEmail as Mock).mockRejectedValueOnce(firebaseError);

    await expect(service.resetPassword('wrong@email.com')).rejects.toThrow(
      'Користувача з таким email не знайдено',
    );
  });

  it('should throw a generic error for other password reset issues', async () => {
    const genericError = new FirebaseError('auth/invalid-email', 'Invalid format');
    (sendPasswordResetEmail as Mock).mockRejectedValueOnce(genericError);

    await expect(service.resetPassword('bad-email')).rejects.toThrow(
      'Помилка при відправці листа. Спробуйте пізніше.',
    );
  });

  it('should register the user, create an entry in Firestore and redirect to /auth/pending', async () => {
    // Simulate a successful registration (Firebase returns an object with uid)
    const mockCred = { user: { uid: 'new-user-123' } };
    (createUserWithEmailAndPassword as Mock).mockResolvedValueOnce(mockCred);
    // Simulate creating a link to a document in Firestore
    (doc as Mock).mockReturnValue('mock-doc-ref');

    const profileData = { name: 'Dmytro', apartmentNumber: '42' };

    await service.register('test@example.com', 'pass123', profileData);

    expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
      expect.anything(),
      'test@example.com',
      'pass123',
    );
    expect(doc).toHaveBeenCalledWith(expect.anything(), 'users', 'new-user-123');

    // Check if the database object was formed correctly
    expect(setDoc).toHaveBeenCalledWith(
      'mock-doc-ref',
      expect.objectContaining({
        name: 'Dmytro',
        apartmentNumber: '42',
        email: 'test@example.com',
        role: 'resident',
        status: 'pending',
      }),
    );

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth/pending']);
  });
});
