import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ThemeService } from '../services/theme.service';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  standalone: false,
})
export class TabsPage {
  selectedTab: string = 'tab1';

  constructor(
    private router: Router,
    public themeService: ThemeService,
  ) {}

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
