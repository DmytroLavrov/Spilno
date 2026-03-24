import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AnnouncementListComponent } from '@features/announcements/announcement-list/announcement-list.component';
import { AnnouncementService } from '@core/services/announcement.service';
import { AuthService } from '@core/services/auth.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { signal } from '@angular/core';
import { Subject } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('AnnouncementListComponent', () => {
  let component: AnnouncementListComponent;
  let fixture: ComponentFixture<AnnouncementListComponent>;
  let mockAnnouncementService: any;
  let mockConfirmService: any;
  let mockMessageService: any;
  let currentUserSignal: any;

  const mockAnnouncements = [
    { id: '1', title: 'Звичайне', content: 'Текст', important: false },
    { id: '2', title: 'Важливе 1', content: 'Текст', important: true },
    { id: '3', title: 'Важливе 2', content: 'Текст', important: true },
  ];

  beforeEach(async () => {
    currentUserSignal = signal({ id: 'admin-1', role: 'admin' });

    mockAnnouncementService = {
      announcements: signal(mockAnnouncements),
      createAnnouncement: vi.fn().mockResolvedValue(undefined),
      updateAnnouncement: vi.fn().mockResolvedValue(undefined),
      deleteAnnouncement: vi.fn().mockResolvedValue(undefined),
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
      imports: [AnnouncementListComponent],
      providers: [
        { provide: AnnouncementService, useValue: mockAnnouncementService },
        { provide: AuthService, useValue: { currentUser: currentUserSignal } },
      ],
    })
      .overrideComponent(AnnouncementListComponent, {
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

    fixture = TestBed.createComponent(AnnouncementListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be successfully created', () => {
    expect(component).toBeTruthy();
  });

  it('should correctly count the number of important ads (importantCount)', () => {
    // Out of 3 ads, 2 of us have important: true
    expect(component.importantCount()).toBe(2);
  });

  it('should open a form to create a NEW ad', () => {
    component.openForm();

    expect(component.formVisible).toBe(true);
    expect(component.editingAnnouncement()).toBeNull();
  });

  it('should open a form to EDIT an existing ad', () => {
    component.openForm(mockAnnouncements[0] as any);

    expect(component.formVisible).toBe(true);
    expect(component.editingAnnouncement()?.id).toBe('1');
  });

  it('should close the form and clear the state', () => {
    component.formVisible = true;
    component.editingAnnouncement.set(mockAnnouncements[0] as any);

    component.closeForm();

    expect(component.formVisible).toBe(false);
    expect(component.editingAnnouncement()).toBeNull();
  });

  it('handleSubmit: should create an announcement if editingAnnouncement = null', async () => {
    const payload = { title: 'Нове', content: 'Тест', important: false };

    await component.handleSubmit(payload);

    expect(mockAnnouncementService.createAnnouncement).toHaveBeenCalledWith(payload);
    expect(mockMessageService.add).toHaveBeenCalledWith(
      expect.objectContaining({ summary: 'Опубліковано' }),
    );
    expect(component.formVisible).toBe(false);
  });

  it('handleSubmit: should update the announcement if editingAnnouncement has data', async () => {
    component.editingAnnouncement.set(mockAnnouncements[0] as any);
    const payload = { title: 'Оновлене', content: 'Тест 2', important: true };

    await component.handleSubmit(payload);

    expect(mockAnnouncementService.updateAnnouncement).toHaveBeenCalledWith('1', payload);
    expect(mockMessageService.add).toHaveBeenCalledWith(
      expect.objectContaining({ summary: 'Збережено' }),
    );
  });

  it('confirmDelete: should delete the ad after confirmation', async () => {
    component.confirmDelete(mockAnnouncements[0] as any);

    await Promise.resolve(); // Waiting for the promise to be fulfilled

    expect(mockConfirmService.confirm).toHaveBeenCalled();
    expect(mockAnnouncementService.deleteAnnouncement).toHaveBeenCalledWith('1');
    expect(mockMessageService.add).toHaveBeenCalledWith(
      expect.objectContaining({ summary: 'Видалено' }),
    );
  });
});
