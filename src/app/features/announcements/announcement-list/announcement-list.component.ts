import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AnnouncementService } from '@core/services/announcement.service';
import { AuthService } from '@core/services/auth.service';
import { Announcement } from '@models/announcement.model';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Skeleton } from 'primeng/skeleton';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Toast } from 'primeng/toast';
import { AnnouncementFormComponent } from '@features/announcements/announcement-form/announcement-form.component';

@Component({
  selector: 'app-announcement-list',
  imports: [
    ReactiveFormsModule,
    DatePipe,
    Skeleton,
    Button,
    Dialog,
    ConfirmDialog,
    Toast,
    AnnouncementFormComponent,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './announcement-list.component.html',
  styleUrl: './announcement-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnnouncementListComponent {
  private announcementService = inject(AnnouncementService);
  private authService = inject(AuthService);
  private confirmService = inject(ConfirmationService);
  private messageService = inject(MessageService);

  public formVisible: boolean = false;
  public submitting = signal(false);
  public editingAnnouncement = signal<Announcement | null>(null);

  public announcements = this.announcementService.announcements;
  public isAdmin = computed(() => this.authService.currentUser()?.role === 'admin');

  public importantCount = computed(() => this.announcements().filter((a) => a.important).length);

  // Form Management
  public openForm(ann?: Announcement): void {
    this.editingAnnouncement.set(ann || null);
    this.formVisible = true;
  }

  public closeForm(): void {
    this.formVisible = false;
    this.editingAnnouncement.set(null);
  }

  public async handleSubmit(payload: { title: string; content: string; important: boolean }) {
    this.submitting.set(true);

    try {
      const editing = this.editingAnnouncement();

      if (editing) {
        await this.announcementService.updateAnnouncement(editing.id, payload);
        this.messageService.add({
          severity: 'success',
          summary: 'Збережено',
          detail: 'Оголошення оновлено',
          life: 3000,
        });
      } else {
        await this.announcementService.createAnnouncement(payload);
        this.messageService.add({
          severity: 'success',
          summary: 'Опубліковано',
          detail: 'Оголошення додано до списку',
          life: 3000,
        });
      }

      this.closeForm();
    } catch {
      this.messageService.add({
        severity: 'error',
        summary: 'Помилка',
        detail: 'Не вдалося зберегти оголошення',
        life: 4000,
      });
    } finally {
      this.submitting.set(false);
    }
  }

  public confirmDelete(ann: Announcement) {
    this.confirmService.confirm({
      message: `Видалити оголошення "${ann.title}"?`,
      header: 'Підтвердження',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Видалити',
      rejectLabel: 'Скасувати',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.delete(ann),
    });
  }

  private async delete(ann: Announcement) {
    try {
      await this.announcementService.deleteAnnouncement(ann.id);
      this.messageService.add({
        severity: 'success',
        summary: 'Видалено',
        detail: `Оголошення "${ann.title}" видалено`,
        life: 3000,
      });
    } catch {
      this.messageService.add({
        severity: 'error',
        summary: 'Помилка',
        detail: 'Не вдалося видалити оголошення',
        life: 4000,
      });
    }
  }
}
