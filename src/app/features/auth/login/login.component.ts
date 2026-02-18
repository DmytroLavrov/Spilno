import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { FirebaseError } from 'firebase/app';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    CardModule,
    MessageModule,
    PasswordModule,
    ButtonModule,
    RouterLink,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  public loading = signal(false);
  public error = signal<string | null>(null);

  public form = this.fb.group({
    email: this.fb.control('', [Validators.required, Validators.email]),
    password: this.fb.control('', [Validators.required, Validators.minLength(6)]),
  });

  async submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    try {
      await this.authService.login(this.form.value.email!, this.form.value.password!);
    } catch (e: unknown) {
      if (e instanceof FirebaseError) {
        const errorMap: Record<string, string> = {
          'auth/user-not-found': 'Користувача з таким email не знайдено',
          'auth/wrong-password': 'Невірний пароль',
          'auth/invalid-credential': 'Невірний email або пароль',
          'auth/too-many-requests': 'Забагато спроб. Спробуйте пізніше',
        };

        this.error.set(errorMap[e.code] || 'Помилка входу. Спробуйте ще раз');
      } else {
        this.error.set('Невідома помилка. Спробуйте ще раз');
      }
    } finally {
      this.loading.set(false);
    }
  }
}
