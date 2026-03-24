import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { roleGuard } from '@core/guards/role.guard';
import { AuthService } from '@core/services/auth.service';
import { Auth } from '@angular/fire/auth';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('roleGuard', () => {
  let mockRouter: any;
  let mockAuthService: any;
  let currentUserSubject: BehaviorSubject<any>;

  beforeEach(() => {
    currentUserSubject = new BehaviorSubject<any>(null);

    mockRouter = {
      navigate: vi.fn(),
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

  const runGuard = (requiredRole: string) => {
    const guardFn = roleGuard(requiredRole);
    return TestBed.runInInjectionContext(() => guardFn({} as any, {} as any));
  };

  it('should allow access (return true) if the user role matches', async () => {
    currentUserSubject.next({ id: '1', role: 'admin' });

    const resultObs = runGuard('admin') as any;
    const result = await firstValueFrom(resultObs);

    expect(result).toBe(true);
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  it('should block access (return false) and redirect to /dashboard if the role DOES NOT match', async () => {
    currentUserSubject.next({ id: '1', role: 'resident' });

    const resultObs = runGuard('admin') as any;
    const result = await firstValueFrom(resultObs);

    expect(result).toBe(false);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should block access (return false) and redirect to /dashboard if the user is not authorized', async () => {
    currentUserSubject.next(null);

    const resultObs = runGuard('admin') as any;
    const result = await firstValueFrom(resultObs);

    expect(result).toBe(false);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
  });
});
