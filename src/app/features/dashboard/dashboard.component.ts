import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AuthService } from '@core/services/auth.service';
import { AdminDashboardComponent } from '@features/dashboard/admin-dashboard/admin-dashboard.component';
import { ResidentDashboardComponent } from '@features/dashboard/resident-dashboard/resident-dashboard.component';

@Component({
  selector: 'app-dashboard',
  imports: [AdminDashboardComponent, ResidentDashboardComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  public authService = inject(AuthService);
}
