import { TestBed } from '@angular/core/testing';
import { AuthLayoutService } from '@layout/auth-layout/auth-layout.service';
import { describe, it, expect, beforeEach } from 'vitest';

describe('AuthLayoutService', () => {
  let service: AuthLayoutService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthLayoutService],
    });

    service = TestBed.inject(AuthLayoutService);
  });

  it('should be successfully created', () => {
    expect(service).toBeTruthy();
  });

  it('must have correct default values', () => {
    expect(service.title()).toBe('Ваш дім.<br>Ваші правила.');
    expect(service.subtitle()).toBe('Єдина платформа для розумного управління ОСББ.');
    expect(service.bgGradient()).toBe('linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)');
  });

  it('should allow changing the values ​​of signals', () => {
    // Change the value
    service.title.set('Новий заголовок');
    service.subtitle.set('Новий текст');
    service.bgGradient.set('red');

    // Check if they are actually updated
    expect(service.title()).toBe('Новий заголовок');
    expect(service.subtitle()).toBe('Новий текст');
    expect(service.bgGradient()).toBe('red');
  });
});
