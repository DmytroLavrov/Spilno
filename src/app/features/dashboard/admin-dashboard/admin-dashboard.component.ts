import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RequestService } from '@core/services/request.service';
import { RequestStatus } from '@models/request.model';
import { RouterLink } from '@angular/router';
import { Card } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { Button } from 'primeng/button';

type TagSeverity = 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast';

const TYPE_LABELS: Record<string, string> = {
  plumbing: '🔧 Сантехніка',
  electrical: '⚡ Електрика',
  other: '📋 Інше',
};

@Component({
  selector: 'app-admin-dashboard',
  imports: [RouterLink, Card, TableModule, Tag, Button],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDashboardComponent {
  private requestService = inject(RequestService);

  public newCount = computed(
    () => this.requestService.requests().filter((r) => r.status === 'new').length,
  );
  public inProgressCount = computed(
    () => this.requestService.requests().filter((r) => r.status === 'in_progress').length,
  );

  public doneThisMonthCount = computed(() => {
    const now = new Date();
    return this.requestService.requests().filter((r) => {
      const d = r.createdAt;
      return (
        r.status === 'done' &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear()
      );
    }).length;
  });

  public pendingUsersCount = computed(() => 0); // 0 for now, AnnouncementService will be added later

  public recentRequests = computed(() => this.requestService.requests().slice(0, 5));

  // ── Helpers for PrimeNG Tag ──
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

  public typeLabel(type: string): string {
    return TYPE_LABELS[type] || type;
  }
}
