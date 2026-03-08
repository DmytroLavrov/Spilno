import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Output,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RequestService } from '@core/services/request.service';
import { RequestType } from '@models/request.model';
import { Select } from 'primeng/select';
import { Message } from 'primeng/message';
import { TextareaModule } from 'primeng/textarea';
import { Button } from 'primeng/button';

const TYPE_OPTIONS: { label: string; value: RequestType }[] = [
  { label: '🔧 Сантехніка', value: 'plumbing' },
  { label: '⚡ Електрика', value: 'electrical' },
  { label: '📋 Інше', value: 'other' },
];

@Component({
  selector: 'app-request-form',
  imports: [ReactiveFormsModule, Select, Message, TextareaModule, Button],
  templateUrl: './request-form.component.html',
  styleUrl: './request-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RequestFormComponent {
  private fb = inject(FormBuilder);
  private requestService = inject(RequestService);
  private router = inject(Router);

  @Output() completed = new EventEmitter<void>();
  @Output() canceled = new EventEmitter<void>();

  public readonly typeOptions = TYPE_OPTIONS;
  public submitting = signal(false);

  public form = this.fb.group({
    type: this.fb.control<RequestType | null>(null, Validators.required),
    description: this.fb.control('', [
      Validators.required,
      Validators.minLength(10),
      Validators.maxLength(500),
    ]),
  });

  public descriptionError(): string {
    const ctrl = this.form.get('description');
    if (ctrl?.hasError('required')) return 'Введіть опис проблеми';
    if (ctrl?.hasError('minlength')) return 'Мінімум 10 символів';
    if (ctrl?.hasError('maxlength')) return 'Максимум 500 символів';
    return '';
  }

  public async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    try {
      await this.requestService.createRequest({
        type: this.form.value.type!,
        description: this.form.value.description!,
      });
      this.form.reset();
      this.completed.emit();
    } catch (e) {
      console.error(e);
    } finally {
      this.submitting.set(false);
    }
  }

  public resetFormState() {
    this.form.reset();
  }

  public cancel() {
    this.resetFormState();
    this.canceled.emit();
  }
}
