import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { FormsModule } from '@angular/forms';
import { AuthService } from '@core/services/auth';
import { ThemeService } from '@core/services/theme';

@Component({
  selector: 'app-register',
  templateUrl: './register.html',
  styleUrls: ['./register.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, RouterLink],
})
export class RegisterComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  themeService = inject(ThemeService);

  nombre = '';
  email = '';
  password = '';
  confirmPassword = '';
  adminCode = '';
  showPassword = false;
  showAdminCode = false;
  acceptedPrivacy = false;
  isLoading = false;
  errorMsg = '';

  togglePassword() { this.showPassword = !this.showPassword; }
  toggleAdminCode() { this.showAdminCode = !this.showAdminCode; }

  register() {
    if (!this.nombre.trim() || !this.email.trim() || !this.password) {
      this.errorMsg = 'Por favor completa todos los campos';
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.errorMsg = 'Las contraseñas no coinciden';
      return;
    }
    if (this.password.length < 6) {
      this.errorMsg = 'La contraseña debe tener al menos 6 caracteres';
      return;
    }
    if (!this.acceptedPrivacy) {
      this.errorMsg = 'Debes aceptar la Política de Privacidad para continuar';
      return;
    }
    this.isLoading = true;
    this.errorMsg = '';
    this.auth.register(
      this.nombre.trim(), this.email.trim(), this.password, this.adminCode, this.acceptedPrivacy,
    ).subscribe({
      next: () => {
        this.isLoading = false;
        const state = history.state;
        const returnTo = state?.returnTo || '/tabs/tab1';
        const returnState = state?.returnState;
        this.router.navigate([returnTo], returnState ? { state: returnState } : {});
      },
      error: (err) => {
        this.errorMsg = err?.error?.detail || 'Error al registrarse';
        this.isLoading = false;
      },
    });
  }

  goToLogin() {
    this.router.navigate(['/login'], { state: history.state });
  }

  goBack() {
    this.router.navigate(['/tabs/tab1']);
  }
}
