import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '@core/services/auth.service';
import { FirebaseError } from 'firebase/app';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { RouterLink } from '@angular/router';
import { InputMaskModule } from 'primeng/inputmask';

@Component({
  selector: 'app-register',
  imports: [
    ReactiveFormsModule,
    CardModule,
    MessageModule,
    PasswordModule,
    ButtonModule,
    RouterLink,
    InputMaskModule,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  public loading = signal(false);
  public error = signal<string | null>(null);

  public form = this.fb.group({
    name: this.fb.control('', [Validators.required, Validators.minLength(3)]),
    apartmentNumber: this.fb.control('', Validators.required),
    phone: this.fb.control('', Validators.required),
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
      await this.authService.register(this.form.value.email!, this.form.value.password!, {
        name: this.form.value.name!,
        apartmentNumber: this.form.value.apartmentNumber!,
        phone: this.form.value.phone || '',
      });
    } catch (e: unknown) {
      if (e instanceof FirebaseError) {
        const errorMap: Record<string, string> = {
          'auth/email-already-in-use': 'Цей email вже зареєстрований',
          'auth/invalid-email': 'Невірний формат email',
          'auth/weak-password': 'Пароль надто слабкий',
        };

        this.error.set(errorMap[e.code] || 'Помилка реєстрації. Спробуйте ще раз');
      } else {
        this.error.set('Невідома помилка. Спробуйте ще раз');
      }
    } finally {
      this.loading.set(false);
    }
  }
}
