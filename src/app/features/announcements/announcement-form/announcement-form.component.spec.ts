import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AnnouncementFormComponent } from '@features/announcements/announcement-form/announcement-form.component';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('AnnouncementFormComponent', () => {
  let component: AnnouncementFormComponent;
  let fixture: ComponentFixture<AnnouncementFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnnouncementFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AnnouncementFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be successfully created', () => {
    expect(component).toBeTruthy();
  });

  it('should have an invalid form at start', () => {
    expect(component.form.valid).toBe(false);
  });

  it('should correctly display validation errors (contentError)', () => {
    const ctrl = component.form.get('content')!;

    ctrl.markAsTouched();
    ctrl.setValue('');
    expect(component.contentError()).toBe('Введіть текст оголошення');

    ctrl.setValue('123'); // Less than 10 characters
    expect(component.contentError()).toBe('Мінімум 10 символів');

    ctrl.setValue('A'.repeat(1001)); // More than 1000 characters
    expect(component.contentError()).toBe('Максимум 1000 символів');
  });

  it('should not emit formSubmit if the form is invalid', () => {
    const emitSpy = vi.spyOn(component.formSubmit, 'emit');

    component.submit();

    expect(emitSpy).not.toHaveBeenCalled();
    expect(component.form.touched).toBe(true);
  });

  it('should emit formSubmit with correct data', () => {
    const emitSpy = vi.spyOn(component.formSubmit, 'emit');

    component.form.setValue({
      title: 'Увага',
      content: 'Сьогодні не буде світла',
      important: true,
    });

    component.submit();

    expect(emitSpy).toHaveBeenCalledWith({
      title: 'Увага',
      content: 'Сьогодні не буде світла',
      important: true,
    });
  });

  it('should emit formCancel when Cancel is clicked', () => {
    const emitSpy = vi.spyOn(component.formCancel, 'emit');
    component.cancel();
    expect(emitSpy).toHaveBeenCalled();
  });

  it('should fill the form via effect() if an ad is passed and isOpen=true', async () => {
    // Transfer data via Signals
    fixture.componentRef.setInput('isOpen', true);
    fixture.componentRef.setInput('announcement', {
      id: '1',
      title: 'Старе оголошення',
      content: 'Текст тексту',
      important: false,
    });

    // Start the change detection loop to execute effect()
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.form.value.title).toBe('Старе оголошення');
    expect(component.form.value.content).toBe('Текст тексту');
    expect(component.form.value.important).toBe(false);
  });
});
