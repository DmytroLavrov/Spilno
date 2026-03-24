import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserListComponent } from '@features/users/user-list/user-list.component';
import { UserService } from '@core/services/user.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { signal } from '@angular/core';
import { Subject } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';

class MockResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
globalThis.ResizeObserver = MockResizeObserver as any;

describe('UserListComponent', () => {
  let component: UserListComponent;
  let fixture: ComponentFixture<UserListComponent>;
  let mockUserService: any;
  let mockConfirmService: any;
  let mockMessageService: any;

  // Fake data for different user states
  const mockPendingUsers = [{ id: 'p1', name: 'Очікуючий', status: 'pending' }];
  const mockActiveUsers = [{ id: 'a1', name: 'Активний', status: 'active' }];
  const mockRejectedUsers = [{ id: 'r1', name: 'Відхилений', status: 'rejected' }];

  beforeEach(async () => {
    mockUserService = {
      // Signals from the service
      pendingUsers: signal(mockPendingUsers),
      activeUsers: signal(mockActiveUsers),
      rejectedUsers: signal(mockRejectedUsers),
      // Service methods
      approveUser: vi.fn().mockResolvedValue(undefined),
      rejectUser: vi.fn().mockResolvedValue(undefined),
      updateUserStatus: vi.fn().mockResolvedValue(undefined),
      deleteUser: vi.fn().mockResolvedValue(undefined),
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
      imports: [UserListComponent],
      providers: [{ provide: UserService, useValue: mockUserService }],
    })
      .overrideComponent(UserListComponent, {
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

    fixture = TestBed.createComponent(UserListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be successfully created', () => {
    expect(component).toBeTruthy();
  });

  it('should correctly calculate allUsers (pending + active)', () => {
    const all = component.allUsers();
    expect(all.length).toBe(2);
    expect(all[0].id).toBe('a1'); // First come pending
    expect(all[1].id).toBe('p1'); // Then active
  });

  it('should correctly generate subtitle text (subtitleText)', () => {
    expect(component.subtitleText()).toBe('Активних: 1 · Очікують: 1 · Відхилених: 1');
  });

  it('approve: should confirm the user and show a success toast', async () => {
    await component.approve(mockPendingUsers[0] as any);

    expect(mockUserService.approveUser).toHaveBeenCalledWith('p1');
    expect(mockMessageService.add).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'success' }),
    );
  });

  it('confirmReject: should trigger a dialog and then reject the user', async () => {
    component.confirmReject(mockPendingUsers[0] as any);
    await Promise.resolve(); // Waiting for the promise from reject() to be fulfilled

    expect(mockConfirmService.confirm).toHaveBeenCalled();
    expect(mockUserService.rejectUser).toHaveBeenCalledWith('p1');
    expect(mockMessageService.add).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'info' }),
    );
  });

  it('onStatusChange: should do nothing if the status has not changed', async () => {
    await component.onStatusChange(mockActiveUsers[0] as any, 'active');
    expect(mockUserService.updateUserStatus).not.toHaveBeenCalled();
  });

  it("onStatusChange: should change the user's status", async () => {
    await component.onStatusChange(mockActiveUsers[0] as any, 'rejected');

    expect(mockUserService.updateUserStatus).toHaveBeenCalledWith('a1', 'rejected');
    expect(mockMessageService.add).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'success' }),
    );
  });

  it('restore: should return the user to pending status', async () => {
    await component.restore(mockRejectedUsers[0] as any);

    expect(mockUserService.updateUserStatus).toHaveBeenCalledWith('r1', 'pending');
    expect(mockMessageService.add).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'success' }),
    );
  });

  it('confirmDelete: should trigger a dialog and permanently delete the user', async () => {
    component.confirmDelete(mockRejectedUsers[0] as any);
    await Promise.resolve();

    expect(mockConfirmService.confirm).toHaveBeenCalled();
    expect(mockUserService.deleteUser).toHaveBeenCalledWith('r1');
    expect(mockMessageService.add).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'success' }),
    );
  });
});
