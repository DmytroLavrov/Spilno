import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from '@features/dashboard/dashboard.component';
import { AuthService } from '@core/services/auth.service';
import { RequestService } from '@core/services/request.service';
import { UserService } from '@core/services/user.service';
import { AnnouncementService } from '@core/services/announcement.service';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { By } from '@angular/platform-browser';
import { describe, it, expect, beforeEach } from 'vitest';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let currentUserSignal: any;

  beforeEach(async () => {
    currentUserSignal = signal(null);

    const mockAuthService = { currentUser: currentUserSignal };
    const mockRequestService = { requests: signal([]) };
    const mockUserService = { pendingUsersCount: signal(0) };
    const mockAnnouncementService = { announcements: signal([]) };

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: mockAuthService },
        { provide: RequestService, useValue: mockRequestService },
        { provide: UserService, useValue: mockUserService },
        { provide: AnnouncementService, useValue: mockAnnouncementService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
  });

  it('should be successfully created', () => {
    expect(component).toBeTruthy();
  });

  it('should render <app-admin-dashboard> if the user is admin', () => {
    currentUserSignal.set({ id: '1', role: 'admin' });
    fixture.detectChanges();

    const adminDash = fixture.debugElement.query(By.css('app-admin-dashboard'));
    const residentDash = fixture.debugElement.query(By.css('app-resident-dashboard'));

    expect(adminDash).toBeTruthy();
    expect(residentDash).toBeNull();
  });

  it('should render <app-resident-dashboard> if the user is resident', () => {
    currentUserSignal.set({ id: '2', role: 'resident' });
    fixture.detectChanges();

    const adminDash = fixture.debugElement.query(By.css('app-admin-dashboard'));
    const residentDash = fixture.debugElement.query(By.css('app-resident-dashboard'));

    expect(residentDash).toBeTruthy();
    expect(adminDash).toBeNull();
  });
});
