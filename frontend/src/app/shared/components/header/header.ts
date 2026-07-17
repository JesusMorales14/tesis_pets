import { Component, Input, inject } from '@angular/core';
import { Router } from '@angular/router';

import { IonicModule } from '@ionic/angular';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ThemeService } from '@core/services/theme';
import { AuthService } from '@core/services/auth';
import { BreakpointService } from '@core/services/breakpoint';

@Component({
  selector: 'app-header',
  templateUrl: './header.html',
  imports: [IonicModule, MatMenuModule, MatTooltipModule],
  standalone: true,
  styleUrls: ['./header.scss'],
})
export class HeaderComponent {
  themeService = inject(ThemeService);
  auth = inject(AuthService);
  breakpointService = inject(BreakpointService);
  private router = inject(Router);

  /** Título contextual de la página, mostrado en el toolbar cuando hay sidebar (desktop). */
  @Input() pageTitle = '';

  goToProfile() {
    this.router.navigate(['/profile']);
  }

  logout() {
    this.auth.logout();
    this.router.navigateByUrl('/tabs/tab1');
  }
}
