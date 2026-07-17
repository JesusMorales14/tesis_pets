import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { FormsModule } from '@angular/forms';
import { AuthService } from '@core/services/auth';
import { ThemeService } from '@core/services/theme';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule],
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  themeService = inject(ThemeService);

  email = '';
  password = '';
  showPassword = false;
  isLoading = false;
  errorMsg = '';

  togglePassword() { this.showPassword = !this.showPassword; }

  login() {
    if (!this.email.trim() || !this.password) {
      this.errorMsg = 'Por favor completa todos los campos';
      return;
    }
    this.isLoading = true;
    this.errorMsg = '';
    this.auth.login(this.email.trim(), this.password).subscribe({
      next: () => {
        this.isLoading = false;
        const state = history.state;
        const returnTo = state?.returnTo || '/tabs/tab1';
        const returnState = state?.returnState;
        this.router.navigate([returnTo], returnState ? { state: returnState } : {});
      },
      error: (err) => {
        this.errorMsg = err?.error?.detail || 'Correo o contraseña incorrectos';
        this.isLoading = false;
      },
    });
  }

  goToRegister() {
    this.router.navigate(['/register'], { state: history.state });
  }

  goBack() {
    this.router.navigate(['/tabs/tab1']);
  }
}
