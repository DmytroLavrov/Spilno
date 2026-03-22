import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { statusGuard } from '@core/guards/status.guard';
import { AuthService } from '@core/services/auth.service';
import { Auth } from '@angular/fire/auth';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('statusGuard', () => {
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

  const runGuard = (allowedStatus: string) => {
    const guardFn = statusGuard(allowedStatus);
    return TestBed.runInInjectionContext(() => guardFn({} as any, {} as any));
  };

  it('should redirect to /auth/login if the user is NOT authorized', async () => {
    currentUserSubject.next(null);

    const resultObs = runGuard('pending') as any;
    const result = await firstValueFrom(resultObs);

    expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/auth/login']);
    expect(result).toBe(dummyUrlTree);
  });

  it("should allow access (return true) if the user's status MATCHES allowedStatus", async () => {
    currentUserSubject.next({ id: '1', status: 'pending' });

    const resultObs = runGuard('pending') as any;
    const result = await firstValueFrom(resultObs);

    expect(result).toBe(true);
    expect(mockRouter.createUrlTree).not.toHaveBeenCalled();
  });

  it('should redirect to /auth/pending if the status is pending, but another one was expected (e.g. rejected)', async () => {
    currentUserSubject.next({ id: '1', status: 'pending' });

    const resultObs = runGuard('rejected') as any;
    const result = await firstValueFrom(resultObs);

    expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/auth/pending']);
    expect(result).toBe(dummyUrlTree);
  });

  it('should redirect to /auth/rejected if the status is rejected, but another one was expected (e.g. pending)', async () => {
    currentUserSubject.next({ id: '1', status: 'rejected' });

    const resultObs = runGuard('pending') as any;
    const result = await firstValueFrom(resultObs);

    expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/auth/rejected']);
    expect(result).toBe(dummyUrlTree);
  });

  it('should redirect to /dashboard (fallback) if status is active, but expected pending/rejected', async () => {
    currentUserSubject.next({ id: '1', status: 'active' });

    const resultObs = runGuard('pending') as any;
    const result = await firstValueFrom(resultObs);

    expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/dashboard']);
    expect(result).toBe(dummyUrlTree);
  });
});
