import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '@core/services/auth.service';
import { AuthLayoutService } from '@layout/auth-layout/auth-layout.service';
import { Button } from 'primeng/button';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  imports: [ReactiveFormsModule, Button, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private layout = inject(AuthLayoutService);

  public loading = signal<boolean>(false);
  public error = signal<string | null>(null);
  public success = signal<boolean>(false);

  public form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  constructor() {
    this.layout.title.set('Відновлення<br>доступу 🔐');
    this.layout.subtitle.set('Ми відправимо інструкції на ваш email.');
    this.layout.bgGradient.set('linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)');
  }

  public async submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    this.success.set(false);

    try {
      await this.authService.resetPassword(this.form.value.email!);
      this.success.set(true);
      this.form.reset();
    } catch (e: unknown) {
      if (e instanceof Error) {
        this.error.set(e.message);
      } else {
        this.error.set('Невідома помилка');
      }
    } finally {
      this.loading.set(false);
    }
  }
}
