import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthLayoutComponent } from '@layout/auth-layout/auth-layout.component';
import { AuthLayoutService } from '@layout/auth-layout/auth-layout.service';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';
import { describe, it, expect, beforeEach } from 'vitest';

describe('AuthLayoutComponent', () => {
  let component: AuthLayoutComponent;
  let fixture: ComponentFixture<AuthLayoutComponent>;
  let layoutService: AuthLayoutService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthLayoutComponent],
      providers: [
        provideRouter([]), // Required for <router-outlet>
        AuthLayoutService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AuthLayoutComponent);
    component = fixture.componentInstance;
    layoutService = TestBed.inject(AuthLayoutService);
    fixture.detectChanges();
  });

  it('should be successfully created', () => {
    expect(component).toBeTruthy();
  });

  it('should display default values ​​from AuthLayoutService', () => {
    const titleEl = fixture.debugElement.query(By.css('.cover-title')).nativeElement;
    const subtitleEl = fixture.debugElement.query(By.css('.cover-subtitle')).nativeElement;

    // Check if the HTML is pulling the correct values ​​from the service
    expect(titleEl.innerHTML).toBe(layoutService.title());
    expect(subtitleEl.textContent.trim()).toBe(layoutService.subtitle());
  });

  it('should dynamically update the template if the service changes signals', () => {
    // Change the text in the service (simulate a transition to the "Forgot your password" page)
    layoutService.title.set('Новий заголовок');
    layoutService.subtitle.set('Новий підзаголовок');
    fixture.detectChanges();

    const titleEl = fixture.debugElement.query(By.css('.cover-title')).nativeElement;
    const subtitleEl = fixture.debugElement.query(By.css('.cover-subtitle')).nativeElement;

    expect(titleEl.innerHTML).toBe('Новий заголовок');
    expect(subtitleEl.textContent.trim()).toBe('Новий підзаголовок');
  });
});
