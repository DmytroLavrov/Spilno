import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('EmptyStateComponent', () => {
  let component: EmptyStateComponent;
  let fixture: ComponentFixture<EmptyStateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmptyStateComponent],
      providers: [provideRouter([])], // Required for RouterLink
    }).compileComponents();

    fixture = TestBed.createComponent(EmptyStateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be successfully created with default values', () => {
    expect(component).toBeTruthy();
    expect(component.message()).toBe('Немає даних');
    expect(component.variant()).toBe('default');
  });

  it('should display the passed title and message', () => {
    fixture.componentRef.setInput('title', 'Упс!');
    fixture.componentRef.setInput('message', 'Тут нічого немає');
    fixture.detectChanges();

    const titleEl = fixture.debugElement.query(By.css('.empty-state__title')).nativeElement;
    const messageEl = fixture.debugElement.query(By.css('.empty-state__message')).nativeElement;

    expect(titleEl.textContent.trim()).toBe('Упс!');
    expect(messageEl.textContent.trim()).toBe('Тут нічого немає');
  });

  it('should emit actionClick when the button is clicked (if there is no actionLink)', () => {
    // Set up a "spy" on our Output
    const emitSpy = vi.spyOn(component.actionClick, 'emit');

    fixture.componentRef.setInput('actionLabel', 'Додати нове');
    // actionLink is not passed (default is null)
    fixture.detectChanges();

    // Find the button and click it
    const button = fixture.debugElement.query(By.css('p-button'));
    button.triggerEventHandler('onClick', null);

    expect(emitSpy).toHaveBeenCalled();
  });

  it('should generate a link (<a>) if actionLink is passed', () => {
    fixture.componentRef.setInput('actionLabel', 'Перейти');
    fixture.componentRef.setInput('actionLink', '/some-path');
    fixture.detectChanges();

    // Check if the <a> tag with the href attribute has appeared
    const linkEl = fixture.debugElement.query(By.css('a')).nativeElement;
    expect(linkEl.getAttribute('href')).toBe('/some-path');
  });
});
