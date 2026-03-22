import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { statusGuard } from './status.guard';

describe('roleGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => statusGuard('pending')(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
