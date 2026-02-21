import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { AuthService } from '@core/services/auth.service';
import { RequestService } from '@core/services/request.service';
import { RequestStatus } from '@models/request.model';
import { RouterLink } from '@angular/router';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TimelineModule } from 'primeng/timeline';
import { TagModule } from 'primeng/tag';

type TagSeverity = 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast';

@Component({
  selector: 'app-resident-dashboard',
  imports: [
    RouterLink,
    TitleCasePipe,
    DatePipe,
    CardModule,
    ButtonModule,
    TimelineModule,
    TagModule,
  ],
  templateUrl: './resident-dashboard.component.html',
  styleUrl: './resident-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResidentDashboardComponent {
  private requestService = inject(RequestService);
  private authService = inject(AuthService);

  public myRequests = computed(() => this.requestService.requests().slice(0, 5));

  public userName = computed(() => this.authService.currentUser()?.name ?? '');
  public apartmentNumber = computed(() => this.authService.currentUser()?.apartmentNumber ?? '');

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
}
