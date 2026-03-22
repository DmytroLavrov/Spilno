import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { roleGuard } from './role.guard';

describe('statusGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => roleGuard('admin')(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
