import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { By } from '@angular/platform-browser';
import { describe, it, expect, beforeEach } from 'vitest';

describe('PageHeaderComponent', () => {
  let component: PageHeaderComponent;
  let fixture: ComponentFixture<PageHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageHeaderComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PageHeaderComponent);
    component = fixture.componentInstance;

    // Since title is required, should set it before the first detectChanges
    fixture.componentRef.setInput('title', 'Головна сторінка');
    fixture.detectChanges();
  });

  it('should display the passed title', () => {
    const titleEl = fixture.debugElement.query(By.css('.page-title')).nativeElement;
    expect(titleEl.textContent.trim()).toBe('Головна сторінка');
  });

  it('should not render subtitle if it is not passed', () => {
    const subtitleEl = fixture.debugElement.query(By.css('.page-subtitle'));
    expect(subtitleEl).toBeNull(); // The element should not be in the DOM
  });

  it('should display subtitle if it is passed', () => {
    fixture.componentRef.setInput('subtitle', 'Підзаголовок');
    fixture.detectChanges();

    const subtitleEl = fixture.debugElement.query(By.css('.page-subtitle')).nativeElement;
    expect(subtitleEl.textContent.trim()).toBe('Підзаголовок');
  });

  it('should add the page-header--flex class if flex=true is passed', () => {
    fixture.componentRef.setInput('flex', true);
    fixture.detectChanges();

    const headerEl = fixture.debugElement.query(By.css('.page-header')).nativeElement;
    expect(headerEl.classList.contains('page-header--flex')).toBe(true);
  });
});
