import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AuthService } from '@core/services/auth.service';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-pending',
  imports: [CardModule, ButtonModule],
  templateUrl: './pending.component.html',
  styleUrl: './pending.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PendingComponent {
  private authService = inject(AuthService);

  async logout() {
    await this.authService.logout();
  }
}
