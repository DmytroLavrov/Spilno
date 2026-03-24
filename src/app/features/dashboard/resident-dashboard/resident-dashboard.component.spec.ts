import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ResidentDashboardComponent } from '@features/dashboard/resident-dashboard/resident-dashboard.component';
import { AuthService } from '@core/services/auth.service';
import { RequestService } from '@core/services/request.service';
import { AnnouncementService } from '@core/services/announcement.service';
import { provideRouter, Router } from '@angular/router';
import { signal } from '@angular/core';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('ResidentDashboardComponent', () => {
  let component: ResidentDashboardComponent;
  let fixture: ComponentFixture<ResidentDashboardComponent>;
  let router: Router;

  beforeEach(async () => {
    const mockAuthService = {
      currentUser: signal({ id: '1', name: 'Олена', apartmentNumber: '42' }),
    };

    // Simulate 6 requests (should trim to 5)
    const mockRequests = new Array(6).fill({ id: 'req', type: 'plumbing' });
    const mockRequestService = { requests: signal(mockRequests) };

    const mockAnnouncementService = { announcements: signal([]) };

    await TestBed.configureTestingModule({
      imports: [ResidentDashboardComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: mockAuthService },
        { provide: RequestService, useValue: mockRequestService },
        { provide: AnnouncementService, useValue: mockAnnouncementService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ResidentDashboardComponent);
    component = fixture.componentInstance;

    // Get an instance of the real router from TestBed
    router = TestBed.inject(Router);

    // We put a "spy" on the navigate method so that it doesn't actually go anywhere,
    // but we could check if it was called.
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture.detectChanges();
  });

  it('should be successfully created', () => {
    expect(component).toBeTruthy();
  });

  it('should pull up the name and apartment from AuthService', () => {
    expect(component.userName()).toBe('Олена');
    expect(component.apartmentNumber()).toBe('42');
  });

  it('should truncate the requests array (myRequests) to 5 elements', () => {
    expect(component.myRequests().length).toBe(5);
  });

  it('should correctly translate application types', () => {
    expect(component.typeLabel('other')).toBe('📋 Інше');
  });

  it('navigateToRequestForm: should navigate to /requests with queryParams { new: true }', () => {
    component.navigateToRequestForm();

    // Test our spy on a real router
    expect(router.navigate).toHaveBeenCalledWith(['/requests'], { queryParams: { new: true } });
  });
});
