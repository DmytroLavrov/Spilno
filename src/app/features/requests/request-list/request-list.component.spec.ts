import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RequestListComponent } from '@features/requests/request-list/request-list.component';
import { RequestService } from '@core/services/request.service';
import { AuthService } from '@core/services/auth.service';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RequestStatus } from '@models/request.model';

describe('RequestListComponent', () => {
  let component: RequestListComponent;
  let fixture: ComponentFixture<RequestListComponent>;
  let mockRequestService: any;
  let currentUserSignal: any;

  const mockRequests = [
    {
      id: '1',
      apartmentNumber: '10',
      description: 'Тече труба',
      status: 'new' as RequestStatus,
      type: 'plumbing',
    },
    {
      id: '2',
      apartmentNumber: '42',
      description: 'Немає світла',
      status: 'done' as RequestStatus,
      type: 'electrical',
    },
  ];

  beforeEach(async () => {
    currentUserSignal = signal({ id: 'admin-1', role: 'admin' });

    mockRequestService = {
      requests: signal(mockRequests),
      updateStatus: vi.fn().mockResolvedValue(undefined),
    };

    await TestBed.configureTestingModule({
      imports: [RequestListComponent],
      providers: [
        provideRouter([]),
        { provide: RequestService, useValue: mockRequestService },
        { provide: AuthService, useValue: { currentUser: currentUserSignal } },
        { provide: ActivatedRoute, useValue: { queryParams: of({}) } },
        // Since the component itself will provide the ConfirmationService and MessageService,
        // we don't need to include them here to test the basic signal logic
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RequestListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should display all requests first', () => {
    expect(component.filtered().length).toBe(2);
    expect(component.activeFilter()).toBe(false);
  });

  it('should filter by status', () => {
    component.selectedStatus.set('new');
    expect(component.filtered().length).toBe(1);
    expect(component.filtered()[0].id).toBe('1');
    expect(component.activeFilter()).toBe(true);
  });

  it('should filter by search text (apartment or description)', () => {
    // We search the apartment
    component.searchQuery.set('42');
    expect(component.filtered().length).toBe(1);
    expect(component.filtered()[0].id).toBe('2');

    // Search by description
    component.searchQuery.set('тРуБА'); // Case is not important
    expect(component.filtered().length).toBe(1);
    expect(component.filtered()[0].id).toBe('1');
  });

  it('should reset filters', () => {
    component.selectedStatus.set('done');
    component.searchQuery.set('світло');

    component.resetFilter();

    expect(component.selectedStatus()).toBeNull();
    expect(component.searchQuery()).toBe('');
    expect(component.filtered().length).toBe(2);
  });

  it('canDelete: admin can delete anything, resident can only delete their own new ones', () => {
    const adminUser = { id: 'admin-1', role: 'admin' };
    const residentUser = { id: 'res-1', role: 'resident' };

    const newReq = { userId: 'res-1', status: 'new' } as any;
    const doneReq = { userId: 'res-1', status: 'done' } as any;
    const otherReq = { userId: 'res-2', status: 'new' } as any;

    // Admin check
    currentUserSignal.set(adminUser);
    expect(component.canDelete(newReq)).toBe(true);

    // Resident check
    currentUserSignal.set(residentUser);
    expect(component.canDelete(newReq)).toBe(true); // Own, new
    expect(component.canDelete(doneReq)).toBe(false); // Own, but done
    expect(component.canDelete(otherReq)).toBe(false); // Someone else's
  });
});
