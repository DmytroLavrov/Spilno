import { TestBed } from '@angular/core/testing';

import { AuthLayoutService } from './auth-layout.service';

describe('AuthLayoutService', () => {
  let service: AuthLayoutService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthLayoutService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
