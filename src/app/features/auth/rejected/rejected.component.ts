import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AuthService } from '@core/services/auth.service';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-rejected',
  imports: [CardModule, ButtonModule],
  templateUrl: './rejected.component.html',
  styleUrl: './rejected.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RejectedComponent {
  private authService = inject(AuthService);

  async logout() {
    await this.authService.logout();
  }
}
