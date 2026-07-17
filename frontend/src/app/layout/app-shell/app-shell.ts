import { Component, inject } from '@angular/core';

import { IonicModule } from '@ionic/angular';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { ThemeService } from '@core/services/theme';
import { AuthService } from '@core/services/auth';
import { NavItem, PRIMARY_NAV_ITEMS } from './nav-items';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [IonicModule],
  templateUrl: './app-shell.html',
  styleUrls: ['./app-shell.scss'],
})
export class AppShellComponent {
  private router = inject(Router);
  themeService = inject(ThemeService);
  auth = inject(AuthService);

  readonly navItems = PRIMARY_NAV_ITEMS;
  currentUrl = this.router.url;

  constructor() {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => (this.currentUrl = e.urlAfterRedirects));
  }

  isActive(item: NavItem): boolean {
    return this.currentUrl.startsWith(item.route);
  }

  isAdminActive(): boolean {
    return this.currentUrl.startsWith('/admin');
  }

  navigate(route: string): void {
    this.router.navigateByUrl(route);
  }

  goToProfile(): void {
    this.router.navigate(['/profile']);
  }
}
