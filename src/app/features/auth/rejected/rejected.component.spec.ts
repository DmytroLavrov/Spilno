import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RejectedComponent } from '@features/auth/rejected/rejected.component';
import { AuthService } from '@core/services/auth.service';
import { AuthLayoutService } from '@layout/auth-layout/auth-layout.service';
import { signal } from '@angular/core';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('RejectedComponent', () => {
  let component: RejectedComponent;
  let fixture: ComponentFixture<RejectedComponent>;
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
      imports: [RejectedComponent],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: AuthLayoutService, useValue: mockLayoutService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RejectedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should successfully create and set texts for Layout', () => {
    expect(component).toBeTruthy();
    expect(mockLayoutService.title()).toBe('Щось пішло<br>не так.');
    expect(mockLayoutService.subtitle()).toContain('Виникла проблема з вашою заявкою');
  });

  it('should call authService.logout when the logout button is clicked', async () => {
    await component.logout();
    expect(mockAuthService.logout).toHaveBeenCalled();
  });
});
