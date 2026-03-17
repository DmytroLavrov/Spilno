import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Button } from 'primeng/button';

export type EmptyStateVariant = 'default' | 'bordered';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [RouterLink, Button],
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyStateComponent {
  // Appearance
  variant = input<EmptyStateVariant>('default');
  icon = input<string>('pi-inbox');
  iconColor = input<string | null>(null);
  iconSize = input<'small' | 'medium' | 'large'>('medium');

  // Content
  title = input<string | null>(null); // optional h2 for request detail
  message = input<string>('Немає даних');

  // Action
  actionLabel = input<string | null>(null);
  actionIcon = input<string>('pi-plus');
  actionLink = input<string | null>(null);
  actionClick = output<void>();
}
