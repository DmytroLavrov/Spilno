import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RequestDetailComponent } from '@features/requests/request-detail/request-detail.component';
import { RequestService } from '@core/services/request.service';
import { AuthService } from '@core/services/auth.service';
import { ActivatedRoute, Router, provideRouter } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { signal } from '@angular/core';
import { of, Subject } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('RequestDetailComponent', () => {
  let component: RequestDetailComponent;
  let fixture: ComponentFixture<RequestDetailComponent>;
  let mockRequestService: any;
  let mockConfirmService: any;
  let mockMessageService: any;
  let router: Router;

  const mockRequest = {
    id: 'req-1',
    type: 'plumbing',
    description: 'Тест',
    status: 'new',
    userId: 'user-1',
    apartmentNumber: '10',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    mockRequestService = {
      requests: signal([mockRequest]),
      getRequests: vi.fn().mockReturnValue(of([mockRequest])),
      updateStatus: vi.fn().mockResolvedValue(undefined),
      deleteRequest: vi.fn().mockResolvedValue(undefined),
    };

    mockConfirmService = {
      requireConfirmation$: new Subject(),
      accept: new Subject(),
      confirm: vi.fn().mockImplementation((config) => config.accept()),
    };

    mockMessageService = {
      messageObserver: new Subject(),
      clearObserver: new Subject(),
      add: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [RequestDetailComponent],
      providers: [
        provideRouter([]),
        { provide: RequestService, useValue: mockRequestService },
        {
          provide: AuthService,
          useValue: { currentUser: signal({ id: 'admin-1', role: 'admin' }) },
        },
        { provide: ConfirmationService, useValue: mockConfirmService },
        { provide: MessageService, useValue: mockMessageService },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => 'req-1' } } },
        },
      ],
    })
      .overrideComponent(RequestDetailComponent, {
        remove: {
          providers: [ConfirmationService, MessageService],
        },
        add: {
          providers: [
            { provide: ConfirmationService, useValue: mockConfirmService },
            { provide: MessageService, useValue: mockMessageService },
          ],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(RequestDetailComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture.detectChanges();
  });

  it('should download an ID request from the router', () => {
    expect(component.requestId()).toBe('req-1');
    expect(component.request()?.id).toBe('req-1');
    expect(component.loading()).toBe(false);
  });

  it('should change status and show toast', async () => {
    await component.changeStatus('in_progress');

    expect(mockRequestService.updateStatus).toHaveBeenCalledWith('req-1', 'in_progress');
    expect(mockMessageService.add).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'success' }),
    );
  });

  it('should delete the application after confirmation and redirect', async () => {
    component.confirmDelete();

    // Wait for promises to be fulfilled (since deleteRequest is asynchronous)
    await Promise.resolve();

    expect(mockConfirmService.confirm).toHaveBeenCalled();
    expect(mockRequestService.deleteRequest).toHaveBeenCalledWith('req-1');
    expect(router.navigate).toHaveBeenCalledWith(['/requests']);
  });
});
