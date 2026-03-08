import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AuthService } from '@core/services/auth.service';
import { AuthLayoutService } from '@layout/auth-layout/auth-layout.service';
import { Button } from 'primeng/button';

@Component({
  selector: 'app-rejected',
  imports: [Button],
  templateUrl: './rejected.component.html',
  styleUrl: './rejected.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RejectedComponent {
  private authService = inject(AuthService);
  private layout = inject(AuthLayoutService);

  constructor() {
    this.layout.title.set('Щось пішло<br>не так.');
    this.layout.subtitle.set('Виникла проблема з вашою заявкою. Не хвилюйтесь, це можна вирішити.');
    this.layout.bgGradient.set('linear-gradient(135deg, #450a0a 0%, #7f1d1d 100%)');
  }

  async logout() {
    await this.authService.logout();
  }
}
