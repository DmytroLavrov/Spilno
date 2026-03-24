import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';
import { AuthService } from '@core/services/auth.service';
import { Auth } from '@angular/fire/auth';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('authGuard', () => {
  let mockRouter: any;
  let mockAuthService: any;
  let currentUserSubject: BehaviorSubject<any>;

  const dummyUrlTree = { isFakeUrlTree: true } as unknown as UrlTree;

  beforeEach(() => {
    currentUserSubject = new BehaviorSubject<any>(null);

    mockRouter = {
      createUrlTree: vi.fn().mockReturnValue(dummyUrlTree),
    };

    mockAuthService = {
      currentUser$: currentUserSubject.asObservable(),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: AuthService, useValue: mockAuthService },
        { provide: Auth, useValue: {} },
      ],
    });

    TestBed.overrideProvider(AuthService, { useValue: mockAuthService });
  });

  const runGuard = () => {
    return TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));
  };

  it('should redirect to /auth/login if the user is NOT authorized', async () => {
    currentUserSubject.next(null);

    const resultObs = runGuard() as any;
    const result = await firstValueFrom(resultObs);

    expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/auth/login']);
    expect(result).toBe(dummyUrlTree);
  });

  it('should redirect to /auth/pending if the user status is pending', async () => {
    currentUserSubject.next({ id: '1', status: 'pending' });

    const resultObs = runGuard() as any;
    const result = await firstValueFrom(resultObs);

    expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/auth/pending']);
    expect(result).toBe(dummyUrlTree);
  });

  it('should redirect to /auth/rejected if the user status is rejected', async () => {
    currentUserSubject.next({ id: '1', status: 'rejected' });

    const resultObs = runGuard() as any;
    const result = await firstValueFrom(resultObs);

    expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/auth/rejected']);
    expect(result).toBe(dummyUrlTree);
  });

  it('should allow access (return true) if the user is authorized and has active status', async () => {
    currentUserSubject.next({ id: '1', status: 'active' });

    const resultObs = runGuard() as any;
    const result = await firstValueFrom(resultObs);

    expect(result).toBe(true);
    expect(mockRouter.createUrlTree).not.toHaveBeenCalled();
  });
});
