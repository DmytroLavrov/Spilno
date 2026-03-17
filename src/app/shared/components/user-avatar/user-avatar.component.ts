import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';

const AVATAR_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];

@Component({
  selector: 'app-user-avatar',
  standalone: true,
  imports: [AvatarModule],
  template: `
    <p-avatar
      [label]="initials()"
      [shape]="shape()"
      [size]="size()"
      [styleClass]="styleClass()"
      [style]="avatarStyle()"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserAvatarComponent {
  // Required
  public name = input.required<string>();

  // Optional
  public shape = input<'circle' | 'square'>('circle');
  public size = input<'normal' | 'large' | 'xlarge'>('normal');
  public styleClass = input<string>('');

  // Color override (якщо null — використовує deterministic color)
  public color = input<string | null>(null);

  // Computed
  public initials = computed(() => {
    const name = this.name()?.trim();
    if (!name) return '?';

    return name
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w.charAt(0))
      .join('')
      .toUpperCase();
  });

  public avatarStyle = computed(() => {
    const bg = this.color() || this.deterministicColor();

    return {
      background: bg,
      color: '#fff',
    };
  });

  private deterministicColor(): string {
    const name = this.name()?.trim();
    if (!name) return AVATAR_COLORS[0];

    const index = name.charCodeAt(0) % AVATAR_COLORS.length;
    return AVATAR_COLORS[index];
  }
}
