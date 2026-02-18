import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AuthService } from '@core/services/auth.service';
import { AuthLayoutService } from '@layout/auth-layout/auth-layout.service';
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
  private layout = inject(AuthLayoutService);

  constructor() {
    this.layout.title.set('Безпека<br />понад усе.');
    this.layout.subtitle.set(
      'Ми перевіряємо кожного користувача, щоб ваша спільнота була захищеною.',
    );
    this.layout.bgGradient.set('linear-gradient(135deg, #0f172a 0%, #1e293b 100%)');
  }

  async logout() {
    await this.authService.logout();
  }
}
