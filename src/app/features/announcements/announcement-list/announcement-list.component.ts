import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { AnnouncementService } from '@core/services/announcement.service';
import { AuthService } from '@core/services/auth.service';
import { Skeleton } from 'primeng/skeleton';

@Component({
  selector: 'app-announcement-list',
  imports: [DatePipe, Skeleton],
  templateUrl: './announcement-list.component.html',
  styleUrl: './announcement-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnnouncementListComponent {
  private announcementService = inject(AnnouncementService);
  private authService = inject(AuthService);

  public announcements = this.announcementService.announcements;
  public isAdmin = computed(() => this.authService.currentUser()?.role === 'admin');

  public importantCount = computed(() => this.announcements().filter((a) => a.important).length);
}
