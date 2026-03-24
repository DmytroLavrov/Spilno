import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterComponent } from '@features/auth/register/register.component';
import { AuthService } from '@core/services/auth.service';
import { AuthLayoutService } from '@layout/auth-layout/auth-layout.service';
import { provideRouter } from '@angular/router';
import { FirebaseError } from 'firebase/app';
import { signal } from '@angular/core';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let mockAuthService: any;
  let mockLayoutService: any;

  beforeEach(async () => {
    mockAuthService = {
      register: vi.fn(),
    };

    mockLayoutService = {
      title: signal(''),
      subtitle: signal(''),
      bgGradient: signal(''),
    };

    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: mockAuthService },
        { provide: AuthLayoutService, useValue: mockLayoutService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should successfully create and set texts for Layout', () => {
    expect(component).toBeTruthy();
    expect(mockLayoutService.title()).toBe('Почніть нове<br />життя.');
  });

  it('should check the validity of the form (all fields are required)', () => {
    expect(component.form.valid).toBe(false);

    // Don't fill in all the fields
    component.form.patchValue({
      name: 'Іван',
      email: 'ivan@test.com',
    });
    expect(component.form.valid).toBe(false);

    // Fill in the remainder
    component.form.patchValue({
      apartmentNumber: '42',
      phone: '0991234567',
      password: 'password123',
    });
    expect(component.form.valid).toBe(true);
  });

  it('should not call authService.register if the form is invalid', async () => {
    await component.submit();
    expect(mockAuthService.register).not.toHaveBeenCalled();
  });

  it('should call authService.register with full profile data', async () => {
    component.form.setValue({
      name: 'Олена',
      apartmentNumber: '10',
      phone: '0990000000',
      email: 'olena@test.com',
      password: 'securePassword',
    });

    await component.submit();

    expect(mockAuthService.register).toHaveBeenCalledWith('olena@test.com', 'securePassword', {
      name: 'Олена',
      apartmentNumber: '10',
      phone: '0990000000',
    });
  });

  it('should correctly handle Firebase error (auth/email-already-in-use)', async () => {
    component.form.setValue({
      name: 'Олена',
      apartmentNumber: '10',
      phone: '0990000000',
      email: 'exist@test.com',
      password: 'password',
    });

    mockAuthService.register.mockRejectedValueOnce(
      new FirebaseError('auth/email-already-in-use', 'Email exists'),
    );

    await component.submit();

    expect(component.error()).toBe('Цей email вже зареєстрований');
    expect(component.loading()).toBe(false);
  });

  it('should handle unknown errors safely', async () => {
    component.form.setValue({
      name: 'Олена',
      apartmentNumber: '10',
      phone: '0990000000',
      email: 'test@test.com',
      password: 'password',
    });

    // Simulate a normal JavaScript error (not Firebase)
    mockAuthService.register.mockRejectedValueOnce(new Error('Network error'));

    await component.submit();

    expect(component.error()).toBe('Невідома помилка. Спробуйте ще раз');
  });
});
