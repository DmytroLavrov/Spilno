import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { DividerModule } from 'primeng/divider';
import { RippleModule } from 'primeng/ripple';
import { TooltipModule } from 'primeng/tooltip';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { DrawerModule } from 'primeng/drawer';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  adminOnly?: boolean;
  badge?: () => number;
}

@Component({
  selector: 'app-main-layout',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    DividerModule,
    RippleModule,
    TooltipModule,
    BadgeModule,
    ButtonModule,
    AvatarModule,
    DrawerModule,
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainLayoutComponent {
  private authService = inject(AuthService);

  public collapsed = signal(false);
  public mobileOpen = signal(false);

  // p-sidebar needs a boolean, not a Signal
  get mobileOpenVisible() {
    return this.mobileOpen();
  }
  set mobileOpenVisible(value: boolean) {
    this.mobileOpen.set(value);
  }

  public isAdmin = computed(() => this.authService.currentUser()?.role === 'admin');
  public userName = computed(() => this.authService.currentUser()?.name ?? '');
  public apartmentNumber = computed(() => this.authService.currentUser()?.apartmentNumber ?? '');

  public userInitials = computed(() => {
    const name = this.userName()?.trim();
    if (!name) return '';

    return name
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w.charAt(0))
      .join('')
      .toUpperCase();
  });

  public avatarColor = computed(() => {
    const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];
    const name = this.userName()?.trim();

    if (!name) return colors[0];

    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  });

  private navItems: NavItem[] = [
    {
      label: 'Дашборд',
      icon: 'pi-home',
      route: '/dashboard',
    },
    {
      label: 'Заявки',
      icon: 'pi-inbox',
      route: '/requests',
      badge: () => 0, // 0 for now, RequestService will be connected later
    },
    {
      label: 'Оголошення',
      icon: 'pi-megaphone',
      route: '/announcements',
    },
    {
      label: 'Мешканці',
      icon: 'pi-users',
      route: '/users',
      adminOnly: true,
    },
  ];

  public visibleNavItems = computed(() =>
    this.navItems.filter((item) => !item.adminOnly || this.isAdmin()),
  );

  public toggleCollapse() {
    this.collapsed.update((v) => !v);
  }

  public logout() {
    this.authService.logout();
  }
}
