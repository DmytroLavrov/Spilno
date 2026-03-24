import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotFoundComponent } from '@features/not-found/not-found.component';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';
import { describe, it, expect, beforeEach } from 'vitest';

describe('NotFoundComponent', () => {
  let component: NotFoundComponent;
  let fixture: ComponentFixture<NotFoundComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotFoundComponent],
      providers: [
        provideRouter([]), // Be sure to add it, because there is a RouterLink in HTML
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NotFoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be successfully created', () => {
    expect(component).toBeTruthy();
  });

  it('should display error code 404', () => {
    const errorCodeEl = fixture.debugElement.query(By.css('.error-code')).nativeElement;
    expect(errorCodeEl.textContent.trim()).toBe('404');
  });

  it('should display the correct title', () => {
    const titleEl = fixture.debugElement.query(By.css('.not-found__title')).nativeElement;
    expect(titleEl.textContent.trim()).toBe('Сторінку не знайдено');
  });

  it('should contain links to the home page and application page', () => {
    // Find all <a> tags
    const links = fixture.debugElement.queryAll(By.css('a'));

    expect(links.length).toBe(2);

    // Check routerLink attributes in HTML
    expect(links[0].attributes['routerLink']).toBe('/dashboard');
    expect(links[1].attributes['routerLink']).toBe('/requests');
  });
});
