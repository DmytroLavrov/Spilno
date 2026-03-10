import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { AnnouncementService } from '@core/services/announcement.service';
import { User, UserStatus } from '@models/user.model';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TabsModule } from 'primeng/tabs';
import { Badge } from 'primeng/badge';
import { TableModule } from 'primeng/table';
import { DatePipe } from '@angular/common';
import { Avatar } from 'primeng/avatar';
import { Button } from 'primeng/button';
import { Tag } from 'primeng/tag';
import { Toast } from 'primeng/toast';
import { ConfirmDialog } from 'primeng/confirmdialog';

type TagSeverity = 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast';

const STATUS_META: Record<UserStatus, { label: string; severity: TagSeverity }> = {
  pending: { label: 'Очікує', severity: 'warn' },
  active: { label: 'Активний', severity: 'success' },
  rejected: { label: 'Відхилено', severity: 'danger' },
};

@Component({
  selector: 'app-user-list',
  imports: [DatePipe, TabsModule, Badge, TableModule, Avatar, Button, Tag, Toast, ConfirmDialog],
  providers: [ConfirmationService, MessageService],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserListComponent {
  private announcementService = inject(AnnouncementService);
  private confirmService = inject(ConfirmationService);
  private messageService = inject(MessageService);

  readonly statusMeta = STATUS_META;

  // State
  public activeTab: string = '0';
  public loadingId = signal<string | null>(null);

  // Data
  public pendingUsers = this.announcementService.pendingUsers;
  public activeUsers = this.announcementService.activeUsers;
  public rejectedUsers = this.announcementService.rejectedUsers;

  public allUsers = computed(() => [...this.pendingUsers(), ...this.activeUsers()]);

  // Helpers
  public initials(user: User): string {
    return user.name
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w.charAt(0))
      .join('')
      .toUpperCase();
  }

  public avatarColor(name: string): string {
    const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];
    return colors[name.charCodeAt(0) % colors.length];
  }

  public getStatusMeta(status: UserStatus) {
    return this.statusMeta[status];
  }

  // Actions
  public async approve(user: User) {
    this.loadingId.set(user.id + '_approve');
    try {
      await this.announcementService.approveUser(user.id);
      this.messageService.add({
        severity: 'success',
        summary: 'Підтверджено',
        detail: `${user.name} тепер має доступ до системи`,
        life: 3000,
      });
    } catch {
      this.messageService.add({
        severity: 'error',
        summary: 'Помилка',
        detail: 'Не вдалося підтвердити мешканця',
        life: 4000,
      });
    } finally {
      this.loadingId.set(null);
    }
  }

  public confirmReject(user: User) {
    this.confirmService.confirm({
      message: `Відхилити реєстрацію ${user.name} (кв. №${user.apartmentNumber})?`,
      header: 'Відхилення реєстрації',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Відхилити',
      rejectLabel: 'Скасувати',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.reject(user),
    });
  }

  private async reject(user: User) {
    this.loadingId.set(user.id + '_reject');
    try {
      await this.announcementService.rejectUser(user.id);
      this.messageService.add({
        severity: 'info',
        summary: 'Відхилено',
        detail: `Реєстрацію ${user.name} відхилено`,
        life: 3000,
      });
    } catch {
      this.messageService.add({
        severity: 'error',
        summary: 'Помилка',
        detail: 'Не вдалося відхилити реєстрацію',
        life: 4000,
      });
    } finally {
      this.loadingId.set(null);
    }
  }

  public confirmDelete(user: User) {
    this.confirmService.confirm({
      message: `Видалити користувача ${user.name} назовсім? Ця дія незворотна.`,
      header: 'Видалення користувача',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Видалити',
      rejectLabel: 'Скасувати',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.deleteUser(user),
    });
  }

  private async deleteUser(user: User) {
    this.loadingId.set(user.id + '_delete');
    try {
      await this.announcementService.deleteUser(user.id);
      this.messageService.add({
        severity: 'success',
        summary: 'Видалено',
        detail: `Користувача ${user.name} видалено назовсім`,
        life: 3000,
      });
    } catch {
      this.messageService.add({
        severity: 'error',
        summary: 'Помилка',
        detail: 'Не вдалося видалити користувача',
        life: 4000,
      });
    } finally {
      this.loadingId.set(null);
    }
  }
}
