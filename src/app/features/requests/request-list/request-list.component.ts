import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { AuthService } from '@core/services/auth.service';
import { RequestService } from '@core/services/request.service';
import { MaintenanceRequest, RequestStatus, RequestType } from '@models/request.model';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { Select } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { Tag } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { InputText } from 'primeng/inputtext';
import { Dialog } from 'primeng/dialog';
import { RequestFormComponent } from '../request-form/request-form.component';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

type TagSeverity = 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast';

export const STATUS_OPTIONS: { label: string; value: RequestStatus | null }[] = [
  { label: 'Всі статуси', value: null },
  { label: 'Нова', value: 'new' },
  { label: 'В обробці', value: 'in_progress' },
  { label: 'Виконано', value: 'done' },
  { label: 'Відхилено', value: 'rejected' },
];

export const STATUS_META: Record<RequestStatus, { label: string; severity: TagSeverity }> = {
  new: { label: 'Нова', severity: 'danger' },
  in_progress: { label: 'В обробці', severity: 'warn' },
  done: { label: 'Виконано', severity: 'success' },
  rejected: { label: 'Відхилено', severity: 'secondary' },
};

export const TYPE_META: Record<RequestType, string> = {
  plumbing: '🔧 Сантехніка',
  electrical: '⚡ Електрика',
  other: '📋 Інше',
};

@Component({
  selector: 'app-request-list',
  imports: [
    RouterLink,
    FormsModule,
    DatePipe,
    Button,
    Select,
    TableModule,
    TooltipModule,
    Tag,
    ConfirmDialogModule,
    ToastModule,
    InputText,
    Dialog,
    RequestFormComponent,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './request-list.component.html',
  styleUrl: './request-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RequestListComponent implements OnInit {
  private requestService = inject(RequestService);
  private authService = inject(AuthService);
  private confirmService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  readonly statusOptions = STATUS_OPTIONS;
  readonly statusMeta = STATUS_META;

  public loading = signal<boolean>(false);
  public selectedStatus = signal<RequestStatus | null>(null);
  public searchQuery = signal<string>('');
  public isDialogVisible = signal<boolean>(false);

  @ViewChild(RequestFormComponent) requestForm!: RequestFormComponent;

  public isAdmin = computed(() => this.authService.currentUser()?.role === 'admin');
  public isResident = computed(() => this.authService.currentUser()?.role === 'resident');

  public filtered = computed(() => {
    let result = this.requestService.requests();

    const status = this.selectedStatus();
    if (status) {
      result = result.filter((r) => r.status === status);
    }

    const q = this.searchQuery().toLowerCase().trim();
    if (q) {
      result = result.filter(
        (r) =>
          r.description.toLowerCase().includes(q) ||
          r.apartmentNumber.toLowerCase().includes(q) ||
          r.userName?.toLowerCase().includes(q),
      );
    }

    return result;
  });

  public activeFilter = computed(() => !!this.selectedStatus() || !!this.searchQuery().trim());

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      if (params['new'] === 'true') {
        this.openNewRequestDialog();

        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { new: null },
          queryParamsHandling: 'merge',
        });
      }
    });
  }

  // ── Helpers ──
  public typeLabel(type: RequestType): string {
    return TYPE_META[type];
  }

  public statusLabel(status: RequestStatus): string {
    const map: Record<RequestStatus, string> = {
      new: 'Нова',
      in_progress: 'В обробці',
      done: 'Виконано',
      rejected: 'Відхилено',
    };
    return map[status];
  }

  public statusSeverity(status: RequestStatus): TagSeverity {
    const map: Record<RequestStatus, TagSeverity> = {
      new: 'danger',
      in_progress: 'warn',
      done: 'success',
      rejected: 'secondary',
    };

    return map[status];
  }

  public canDelete(req: MaintenanceRequest): boolean {
    const user = this.authService.currentUser();
    if (user?.role === 'admin') return true;
    // A resident can only delete their new application
    return req.userId === user?.id && req.status === 'new';
  }

  // ── Actions ──
  public applyFilter() {
    // filtered() will be automatically computed via signal/computed
    // method left for (onChange) binding — Angular requires a callback
  }

  public resetFilter() {
    this.selectedStatus.set(null);
    this.searchQuery.set('');
  }

  public async onStatusChange(req: MaintenanceRequest, newStatus: RequestStatus) {
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
        detail: 'Не вдалося змінити статус. Спробуйте ще раз.',
        life: 4000,
      });
    }
  }

  public confirmDelete(req: MaintenanceRequest) {
    this.confirmService.confirm({
      message: `Видалити заявку від кв. №${req.apartmentNumber}? Це незворотна дія.`,
      header: 'Підтвердження',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Видалити',
      rejectLabel: 'Скасувати',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.deleteRequest(req),
    });
  }

  private async deleteRequest(req: MaintenanceRequest) {
    this.loading.set(true);
    try {
      await this.requestService.deleteRequest(req.id);
      this.messageService.add({
        severity: 'success',
        summary: 'Видалено',
        detail: 'Заявку успішно видалено',
        life: 3000,
      });
    } catch {
      this.messageService.add({
        severity: 'error',
        summary: 'Помилка',
        detail: 'Не вдалося видалити заявку.',
        life: 4000,
      });
    } finally {
      this.loading.set(false);
    }
  }

  public openNewRequestDialog() {
    this.isDialogVisible.set(true);
  }

  public onRequestCreated() {
    this.isDialogVisible.set(false);
    this.messageService.add({
      severity: 'success',
      summary: 'Успіх',
      detail: 'Заявку успішно створено',
      life: 3000,
    });
  }

  public onDialogHide() {
    if (this.requestForm) {
      this.requestForm.resetFormState();
    }
  }
}
