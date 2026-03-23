import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ForgotPasswordComponent } from '@features/auth/forgot-password/forgot-password.component';
import { AuthService } from '@core/services/auth.service';
import { AuthLayoutService } from '@layout/auth-layout/auth-layout.service';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('ForgotPasswordComponent', () => {
  let component: ForgotPasswordComponent;
  let fixture: ComponentFixture<ForgotPasswordComponent>;
  let mockAuthService: any;
  let mockLayoutService: any;

  beforeEach(async () => {
    mockAuthService = {
      resetPassword: vi.fn(),
    };

    mockLayoutService = {
      title: signal(''),
      subtitle: signal(''),
      bgGradient: signal(''),
    };

    await TestBed.configureTestingModule({
      imports: [ForgotPasswordComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: mockAuthService },
        { provide: AuthLayoutService, useValue: mockLayoutService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ForgotPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should successfully create and set texts for Layout', () => {
    expect(component).toBeTruthy();
    expect(mockLayoutService.title()).toBe('Відновлення<br>доступу 🔐');
  });

  it('should have an invalid form when created', () => {
    expect(component.form.invalid).toBe(true);
  });

  it('should not call authService.resetPassword if the form is invalid', async () => {
    component.form.patchValue({ email: 'bad-email' }); // Invalid email
    await component.submit();

    expect(mockAuthService.resetPassword).not.toHaveBeenCalled();
    expect(component.form.touched).toBe(true);
  });

  it('should call authService.resetPassword and show a successful status', async () => {
    component.form.patchValue({ email: 'test@example.com' });

    // Simulate successful execution
    mockAuthService.resetPassword.mockResolvedValueOnce(undefined);

    await component.submit();

    expect(mockAuthService.resetPassword).toHaveBeenCalledWith('test@example.com');
    expect(component.success()).toBe(true);
    expect(component.loading()).toBe(false);
    expect(component.form.value.email).toBe(null); // The form should be cleared (form.reset())
  });

  it('should handle the error and display a message', async () => {
    component.form.patchValue({ email: 'wrong@example.com' });

    // Simulate an error (your service throws a regular Error, so we mock it)
    mockAuthService.resetPassword.mockRejectedValueOnce(
      new Error('Користувача з таким email не знайдено'),
    );

    await component.submit();

    expect(component.success()).toBe(false);
    expect(component.error()).toBe('Користувача з таким email не знайдено');
    expect(component.loading()).toBe(false);
  });

  it('should show default error for unknown failures', async () => {
    component.form.patchValue({ email: 'test@example.com' });

    // Throw something that is not an Error object (e.g. a string or null)
    mockAuthService.resetPassword.mockRejectedValueOnce('Some weird error');

    await component.submit();

    expect(component.error()).toBe('Невідома помилка');
  });
});
