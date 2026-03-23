import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MainLayoutComponent } from '@layout/main-layout/main-layout.component';
import { AuthService } from '@core/services/auth.service';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('MainLayoutComponent', () => {
  let component: MainLayoutComponent;
  let fixture: ComponentFixture<MainLayoutComponent>;
  let mockAuthService: any;
  let currentUserSignal: any;

  beforeEach(async () => {
    // Create a fake signal for the user
    currentUserSignal = signal(null);

    mockAuthService = {
      currentUser: currentUserSignal,
      logout: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [MainLayoutComponent],
      providers: [provideRouter([]), { provide: AuthService, useValue: mockAuthService }],
    }).compileComponents();

    fixture = TestBed.createComponent(MainLayoutComponent);
    component = fixture.componentInstance;
  });

  it('should be successfully created', () => {
    expect(component).toBeTruthy();
  });

  // ─── NAVIGATION AND ROLE TESTS ───

  it('should hide the "Residents" tab if the user is a resident', () => {
    currentUserSignal.set({ id: '1', role: 'resident', name: 'Іван', apartmentNumber: '10' });
    fixture.detectChanges();

    const navItems = component.visibleNavItems();

    // Check if the tab is filtered
    const hasUsersTab = navItems.some((item) => item.route === '/users');
    expect(hasUsersTab).toBe(false);
    expect(navItems.length).toBe(3); // Dashboard, Applications, Announcements
    expect(component.isAdmin()).toBe(false);
  });

  it('should show the "Residents" tab if the user is admin', () => {
    currentUserSignal.set({ id: '2', role: 'admin', name: 'Адмін', apartmentNumber: '1' });
    fixture.detectChanges();

    const navItems = component.visibleNavItems();

    const hasUsersTab = navItems.some((item) => item.route === '/users');
    expect(hasUsersTab).toBe(true);
    expect(navItems.length).toBe(4);
    expect(component.isAdmin()).toBe(true);
  });

  // ─── USER DATA TESTS ───

  it("should format the user's name and apartment correctly", () => {
    currentUserSignal.set({ id: '1', role: 'resident', name: 'Петро', apartmentNumber: '42' });
    fixture.detectChanges();

    expect(component.userName()).toBe('Петро');
    expect(component.apartmentNumber()).toBe('42');
  });

  it('must safely handle the absence of a user (null)', () => {
    currentUserSignal.set(null);
    fixture.detectChanges();

    expect(component.userName()).toBe('');
    expect(component.apartmentNumber()).toBe('');
    expect(component.isAdmin()).toBe(false);
  });

  // ─── UI ELEMENTS TESTS ───

  it('should toggle the sidebar state (collapsed)', () => {
    expect(component.collapsed()).toBe(false); // By default

    component.toggleCollapse();
    expect(component.collapsed()).toBe(true);

    component.toggleCollapse();
    expect(component.collapsed()).toBe(false);
  });

  it('should call the logout method of the AuthService on exit', () => {
    component.logout();
    expect(mockAuthService.logout).toHaveBeenCalled();
  });
});
