import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminDashboardComponent } from '@features/dashboard/admin-dashboard/admin-dashboard.component';
import { RequestService } from '@core/services/request.service';
import { UserService } from '@core/services/user.service';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { describe, it, expect, beforeEach } from 'vitest';

describe('AdminDashboardComponent', () => {
  let component: AdminDashboardComponent;
  let fixture: ComponentFixture<AdminDashboardComponent>;
  let mockRequestsSignal: any;

  beforeEach(async () => {
    // Create dates: today and last month
    const now = new Date();
    const lastMonth = new Date();
    lastMonth.setMonth(now.getMonth() - 1);

    mockRequestsSignal = signal([
      { id: '1', status: 'new', createdAt: now },
      { id: '2', status: 'new', createdAt: now },
      { id: '3', status: 'in_progress', createdAt: now },
      { id: '4', status: 'done', createdAt: now }, // This month
      { id: '5', status: 'done', createdAt: lastMonth }, // Last month
      { id: '6', status: 'rejected', createdAt: now },
    ]);

    const mockRequestService = { requests: mockRequestsSignal };
    const mockUserService = { pendingUsersCount: signal(3) };

    await TestBed.configureTestingModule({
      imports: [AdminDashboardComponent],
      providers: [
        provideRouter([]),
        { provide: RequestService, useValue: mockRequestService },
        { provide: UserService, useValue: mockUserService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should correctly count new applications', () => {
    expect(component.newCount()).toBe(2);
  });

  it('should correctly count applications in processing', () => {
    expect(component.inProgressCount()).toBe(1);
  });

  it('should correctly count completed applications ONLY for the current month', () => {
    // Total 2 'done', but 1 was last month
    expect(component.doneThisMonthCount()).toBe(1);
  });

  it('should only take the last 5 requests for the table (recentRequests)', () => {
    // We have 6 requests in the signal, and recentRequests should return 5
    expect(component.recentRequests().length).toBe(5);
  });

  it('should format the application type correctly', () => {
    expect(component.typeLabel('plumbing')).toBe('🔧 Сантехніка');
    expect(component.typeLabel('electrical')).toBe('⚡ Електрика');
    expect(component.typeLabel('unknown')).toBe('unknown');
  });
});
