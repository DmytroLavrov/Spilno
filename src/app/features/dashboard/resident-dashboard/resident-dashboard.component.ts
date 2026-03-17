import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { AuthService } from '@core/services/auth.service';
import { RequestService } from '@core/services/request.service';
import { RequestStatus } from '@models/request.model';
import { Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Card } from 'primeng/card';
import { Button } from 'primeng/button';
import { TimelineModule } from 'primeng/timeline';
import { Tag } from 'primeng/tag';
import { AnnouncementService } from '@core/services/announcement.service';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';
import { StatusLabelPipe } from '@shared/pipes/status-label.pipe';
import { StatusSeverityPipe } from '@shared/pipes/status-severity.pipe';

const TYPE_LABELS: Record<string, string> = {
  plumbing: '🔧 Сантехніка',
  electrical: '⚡ Електрика',
  other: '📋 Інше',
};

@Component({
  selector: 'app-resident-dashboard',
  imports: [
    RouterLink,
    DatePipe,
    Card,
    Button,
    TimelineModule,
    Tag,
    EmptyStateComponent,
    StatusLabelPipe,
    StatusSeverityPipe,
  ],
  templateUrl: './resident-dashboard.component.html',
  styleUrl: './resident-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResidentDashboardComponent {
  private requestService = inject(RequestService);
  private authService = inject(AuthService);
  private announcementService = inject(AnnouncementService);
  private router = inject(Router);

  public announcements = this.announcementService.announcements;

  public myRequests = computed(() => this.requestService.requests().slice(0, 5));

  public userName = computed(() => this.authService.currentUser()?.name ?? '');
  public apartmentNumber = computed(() => this.authService.currentUser()?.apartmentNumber ?? '');

  public typeLabel(type: string): string {
    return TYPE_LABELS[type] || type;
  }

  public navigateToRequestForm() {
    this.router.navigate(['/requests'], { queryParams: { new: true } });
  }
}
