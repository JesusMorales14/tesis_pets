import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ThemeService } from '@core/services/theme';
import { BreakpointService } from '@core/services/breakpoint';
import { PRIMARY_NAV_ITEMS } from '@layout/app-shell/nav-items';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.html',
  styleUrls: ['./tabs.scss'],
  standalone: true,
  imports: [IonicModule],
})
export class TabsPage {
  private readonly router = inject(Router);
  readonly themeService = inject(ThemeService);
  readonly breakpointService = inject(BreakpointService);

  selectedTab: string = 'tab1';
  readonly navItems = PRIMARY_NAV_ITEMS;

  goHome() {
    this.router.navigateByUrl('/tabs/tab2');
  }

  setCurrentTab(tab: string) {
    this.selectedTab = tab;
  }

  toggleTheme() {
    this.themeService.toggle();
  }
}
