import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { statusGuard } from './status.guard';

describe('statusGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => statusGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
