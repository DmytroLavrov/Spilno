import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { DividerModule } from 'primeng/divider';
import { TooltipModule } from 'primeng/tooltip';
import { Badge } from 'primeng/badge';
import { Button } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';
import { UserAvatarComponent } from '@shared/components/user-avatar/user-avatar.component';

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
    TooltipModule,
    Badge,
    Button,
    DrawerModule,
    UserAvatarComponent,
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
