import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AnnouncementService } from '@core/services/announcement.service';
import { AuthService } from '@core/services/auth.service';
import { Announcement } from '@models/announcement.model';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Skeleton } from 'primeng/skeleton';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Toast } from 'primeng/toast';
import { CheckboxModule } from 'primeng/checkbox';
import { InputText } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { Message } from 'primeng/message';

@Component({
  selector: 'app-announcement-list',
  imports: [
    ReactiveFormsModule,
    DatePipe,
    Skeleton,
    Button,
    Dialog,
    CheckboxModule,
    ConfirmDialog,
    Toast,
    InputText,
    TextareaModule,
    Message,
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
  private fb = inject(FormBuilder);

  public formVisible: boolean = false;
  public submitting = signal(false);
  public editingId = signal<string | null>(null);

  public announcements = this.announcementService.announcements;
  public isAdmin = computed(() => this.authService.currentUser()?.role === 'admin');

  public importantCount = computed(() => this.announcements().filter((a) => a.important).length);

  // Form
  public form = this.fb.group({
    title: this.fb.control('', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(100),
    ]),
    content: this.fb.control('', [
      Validators.required,
      Validators.minLength(10),
      Validators.maxLength(1000),
    ]),
    important: this.fb.control(false),
  });

  public contentError(): string {
    const ctrl = this.form.get('content');
    if (ctrl?.hasError('required')) return 'Введіть текст оголошення';
    if (ctrl?.hasError('minlength')) return 'Мінімум 10 символів';
    if (ctrl?.hasError('maxlength')) return 'Максимум 1000 символів';
    return '';
  }

  // Form Management
  public openForm(ann?: Announcement): void {
    if (ann) {
      this.editingId.set(ann.id);
      this.form.setValue({
        title: ann.title,
        content: ann.content,
        important: ann.important,
      });
    }
    this.formVisible = true;
  }

  public closeForm(): void {
    this.formVisible = false;
  }

  public resetForm(): void {
    this.editingId.set(null);
    this.form.reset({ important: false });
  }

  public async submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);

    const payload = {
      title: this.form.value.title!,
      content: this.form.value.content!,
      important: this.form.value.important ?? false,
    };

    try {
      const id = this.editingId();

      if (id) {
        await this.announcementService.updateAnnouncement(id, payload);
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
