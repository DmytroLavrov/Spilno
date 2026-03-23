import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from '@features/auth/login/login.component';
import { AuthService } from '@core/services/auth.service';
import { AuthLayoutService } from '@layout/auth-layout/auth-layout.service';
import { provideRouter } from '@angular/router';
import { FirebaseError } from 'firebase/app';
import { signal } from '@angular/core';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let mockAuthService: any;
  let mockLayoutService: any;

  beforeEach(async () => {
    mockAuthService = {
      login: vi.fn(),
    };

    // We're mopping up the AuthLayoutService (since it uses signals)
    mockLayoutService = {
      title: signal(''),
      subtitle: signal(''),
      bgGradient: signal(''),
    };

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: mockAuthService },
        { provide: AuthLayoutService, useValue: mockLayoutService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should successfully create and set texts for Layout', () => {
    expect(component).toBeTruthy();
    expect(mockLayoutService.title()).toBe('Ваш дім.<br>Ваші правила.');
    expect(mockLayoutService.subtitle()).toContain('Єдина платформа для розумного управління ОСББ');
  });

  it('should have an invalid form when created (empty fields)', () => {
    expect(component.form.invalid).toBe(true);
  });

  it('should not call authService.login if the form is invalid', async () => {
    await component.submit();
    expect(mockAuthService.login).not.toHaveBeenCalled();
    // Check if the fields are "touched" (to show errors in the UI)
    expect(component.form.touched).toBe(true);
  });

  it('should call authService.login with the correct data', async () => {
    component.form.patchValue({
      email: 'test@test.com',
      password: 'password123',
    });

    expect(component.form.valid).toBe(true);

    await component.submit();

    expect(component.loading()).toBe(false); // At the end it should be false (because of finally)
    expect(mockAuthService.login).toHaveBeenCalledWith('test@test.com', 'password123');
  });

  it('should correctly handle known Firebase errors (e.g. auth/invalid-credential)', async () => {
    component.form.patchValue({ email: 'test@test.com', password: 'wrong123' });

    // Simulate an error from Firebase
    mockAuthService.login.mockRejectedValueOnce(
      new FirebaseError('auth/invalid-credential', 'Invalid creds'),
    );

    await component.submit();

    expect(component.error()).toBe('Невірний email або пароль');
    expect(component.loading()).toBe(false);
  });

  it('should set default error for unknown Firebase codes', async () => {
    component.form.patchValue({ email: 'test@test.com', password: 'password' });

    mockAuthService.login.mockRejectedValueOnce(
      new FirebaseError('auth/unknown-error', 'Something bad happened'),
    );

    await component.submit();

    expect(component.error()).toBe('Помилка входу. Спробуйте ще раз');
  });
});
