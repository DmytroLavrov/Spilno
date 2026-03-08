import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { RequestService } from '@core/services/request.service';
import { RequestStatus } from '@models/request.model';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Card } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';
import { Button } from 'primeng/button';
import { Tag } from 'primeng/tag';
import { Divider } from 'primeng/divider';
import { DatePipe } from '@angular/common';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Toast } from 'primeng/toast';
import { filter, Subscription, take } from 'rxjs';

type TagSeverity = 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast';

const STATUS_META: Record<RequestStatus, { label: string; severity: TagSeverity }> = {
  new: { label: 'Нова', severity: 'danger' },
  in_progress: { label: 'В обробці', severity: 'warn' },
  done: { label: 'Виконано', severity: 'success' },
  rejected: { label: 'Відхилено', severity: 'secondary' },
};

const TYPE_LABELS: Record<string, string> = {
  plumbing: '🔧 Сантехніка',
  electrical: '⚡ Електрика',
  other: '📋 Інше',
};

@Component({
  selector: 'app-request-detail',
  imports: [DatePipe, Card, SkeletonModule, Button, Tag, Divider, ConfirmDialog, Toast],
  providers: [ConfirmationService, MessageService],
  templateUrl: './request-detail.component.html',
  styleUrl: './request-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RequestDetailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private requestService = inject(RequestService);
  private authService = inject(AuthService);
  private confirmService = inject(ConfirmationService);
  private messageService = inject(MessageService);

  private subscription?: Subscription;

  public requestId = signal<string | null>(null);
  public loading = signal(true);

  public request = computed(() => {
    const id = this.requestId();
    if (!id) return null;
    return this.requestService.requests().find((r) => r.id === id) || null;
  });

  public isAdmin = computed(() => this.authService.currentUser()?.role === 'admin');

  public canDelete = computed(() => {
    const req = this.request();
    const user = this.authService.currentUser();
    if (!req || !user) return false;

    if (user.role === 'admin') return true;
    return req.userId === user.id && req.status === 'new';
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/requests']);
      return;
    }

    this.requestId.set(id);

    this.subscription = this.requestService
      .getRequests()
      .pipe(
        filter((requests) => requests.length > 0),
        take(1),
      )
      .subscribe((requests) => {
        this.loading.set(false);

        const found = requests.find((r) => r.id === id);
        if (!found) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Не знайдено',
            detail: 'Заявку не знайдено',
            life: 2000,
          });
          setTimeout(() => this.router.navigate(['/requests']), 2000);
        }
      });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  public typeLabel(type: string): string {
    return TYPE_LABELS[type] || type;
  }

  public statusLabel(status: RequestStatus): string {
    return STATUS_META[status].label;
  }

  public statusSeverity(status: RequestStatus): TagSeverity {
    return STATUS_META[status].severity;
  }

  public async changeStatus(newStatus: RequestStatus): Promise<void> {
    const req = this.request();
    if (!req) return;

    try {
      await this.requestService.updateStatus(req.id, newStatus);
      this.messageService.add({
        severity: 'success',
        summary: 'Готово',
        detail: `Статус змінено на "${STATUS_META[newStatus].label}"`,
        life: 3000,
      });
    } catch {
      this.messageService.add({
        severity: 'error',
        summary: 'Помилка',
        detail: 'Не вдалося змінити статус',
        life: 4000,
      });
    }
  }

  public confirmDelete(): void {
    const req = this.request();
    if (!req) return;

    this.confirmService.confirm({
      message: `Видалити заявку від кв. №${req.apartmentNumber}? Це незворотна дія.`,
      header: 'Підтвердження',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Видалити',
      rejectLabel: 'Скасувати',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.deleteRequest(),
    });
  }

  private async deleteRequest(): Promise<void> {
    const req = this.request();
    if (!req) return;

    try {
      await this.requestService.deleteRequest(req.id);
      this.messageService.add({
        severity: 'success',
        summary: 'Видалено',
        detail: 'Заявку успішно видалено',
        life: 3000,
      });
      this.router.navigate(['/requests']);
    } catch {
      this.messageService.add({
        severity: 'error',
        summary: 'Помилка',
        detail: 'Не вдалося видалити заявку',
        life: 4000,
      });
    }
  }

  public goBack(): void {
    this.router.navigate(['/requests']);
  }
}
