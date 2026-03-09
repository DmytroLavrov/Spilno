import { ChangeDetectionStrategy, Component, effect, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Announcement } from '@models/announcement.model';
import { CheckboxModule } from 'primeng/checkbox';
import { Button } from 'primeng/button';
import { Message } from 'primeng/message';
import { TextareaModule } from 'primeng/textarea';
import { InputText } from 'primeng/inputtext';

@Component({
  selector: 'app-announcement-form',
  imports: [ReactiveFormsModule, CheckboxModule, Button, InputText, TextareaModule, Message],
  templateUrl: './announcement-form.component.html',
  styleUrl: './announcement-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnnouncementFormComponent {
  private fb = inject(FormBuilder);

  public announcement = input<Announcement | null>(null);
  public submitting = input<boolean>(false);

  public formSubmit = output<{ title: string; content: string; important: boolean }>();
  public formCancel = output<void>();

  public form = this.fb.group({
    title: this.fb.control('', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(100),
    ]),
    content: this.fb.control('', [
      Validators.required,
      Validators.minLength(10),
      Validators.maxLength(1000),
    ]),
    important: this.fb.control(false),
  });

  constructor() {
    effect(() => {
      // When an announcement comes for editing — fill out the form
      const ann = this.announcement();
      if (ann) {
        this.form.setValue({
          title: ann.title,
          content: ann.content,
          important: ann.important,
        });
      } else {
        this.form.reset({ important: false });
      }
    });
  }

  public contentError(): string {
    const ctrl = this.form.get('content');
    if (ctrl?.hasError('required')) return 'Введіть текст оголошення';
    if (ctrl?.hasError('minlength')) return 'Мінімум 10 символів';
    if (ctrl?.hasError('maxlength')) return 'Максимум 1000 символів';
    return '';
  }

  public submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.formSubmit.emit({
      title: this.form.value.title!,
      content: this.form.value.content!,
      important: this.form.value.important ?? false,
    });
  }

  public cancel(): void {
    this.formCancel.emit();
  }
}
