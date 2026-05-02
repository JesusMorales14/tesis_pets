import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ThemeService } from '../../services/theme.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  imports: [IonicModule, CommonModule],
  standalone: true,
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  constructor(
    public themeService: ThemeService,
    public auth: AuthService,
    private router: Router,
  ) {}

  goToProfile() {
    this.router.navigate(['/profile']);
  }
}
