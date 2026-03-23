import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PendingComponent } from '@features/auth/pending/pending.component';
import { AuthService } from '@core/services/auth.service';
import { AuthLayoutService } from '@layout/auth-layout/auth-layout.service';
import { signal } from '@angular/core';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('PendingComponent', () => {
  let component: PendingComponent;
  let fixture: ComponentFixture<PendingComponent>;
  let mockAuthService: any;
  let mockLayoutService: any;

  beforeEach(async () => {
    mockAuthService = {
      logout: vi.fn(),
    };

    mockLayoutService = {
      title: signal(''),
      subtitle: signal(''),
      bgGradient: signal(''),
    };

    await TestBed.configureTestingModule({
      imports: [PendingComponent],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: AuthLayoutService, useValue: mockLayoutService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PendingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should successfully create and set texts for Layout', () => {
    expect(component).toBeTruthy();
    expect(mockLayoutService.title()).toBe('Безпека<br />понад усе.');
    expect(mockLayoutService.subtitle()).toContain('Ми перевіряємо кожного користувача');
  });

  it('should call authService.logout when the logout button is clicked', async () => {
    await component.logout();
    expect(mockAuthService.logout).toHaveBeenCalled();
  });
});
