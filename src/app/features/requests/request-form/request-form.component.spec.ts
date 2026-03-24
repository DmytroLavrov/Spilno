import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RequestFormComponent } from '@features/requests/request-form/request-form.component';
import { RequestService } from '@core/services/request.service';
import { provideRouter } from '@angular/router';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('RequestFormComponent', () => {
  let component: RequestFormComponent;
  let fixture: ComponentFixture<RequestFormComponent>;
  let mockRequestService: any;

  beforeEach(async () => {
    mockRequestService = {
      createRequest: vi.fn().mockResolvedValue(undefined),
    };

    await TestBed.configureTestingModule({
      imports: [RequestFormComponent],
      providers: [provideRouter([]), { provide: RequestService, useValue: mockRequestService }],
    }).compileComponents();

    fixture = TestBed.createComponent(RequestFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be successfully created', () => {
    expect(component).toBeTruthy();
  });

  it('should check the validity of the form', () => {
    expect(component.form.valid).toBe(false); // Initially empty and invalid

    // Fill in incorrectly (short description)
    component.form.patchValue({ type: 'plumbing', description: 'Коротко' });
    expect(component.form.valid).toBe(false);
    expect(component.descriptionError()).toBe('Мінімум 10 символів');

    // Fill in correctly
    component.form.patchValue({ description: 'Тут потік кран на кухні, потрібна допомога' });
    expect(component.form.valid).toBe(true);
  });

  it('should not submit an invalid form', async () => {
    await component.submit();
    expect(mockRequestService.createRequest).not.toHaveBeenCalled();
    expect(component.form.touched).toBe(true);
  });

  it('should submit a valid form, clean it up, and emit completed', async () => {
    const emitSpy = vi.spyOn(component.completed, 'emit');

    component.form.patchValue({
      type: 'electrical',
      description: 'Зникло світло у всьому підʼїзді',
    });

    await component.submit();

    expect(mockRequestService.createRequest).toHaveBeenCalledWith({
      type: 'electrical',
      description: 'Зникло світло у всьому підʼїзді',
    });
    // Check if the form has cleared
    expect(component.form.value.type).toBeNull();
    // Check if the emission occurred
    expect(emitSpy).toHaveBeenCalled();
  });

  it('should emit canceled and clear the form when canceled', () => {
    const emitSpy = vi.spyOn(component.canceled, 'emit');
    component.form.patchValue({ type: 'other' });

    component.cancel();

    expect(component.form.value.type).toBeNull();
    expect(emitSpy).toHaveBeenCalled();
  });
});
