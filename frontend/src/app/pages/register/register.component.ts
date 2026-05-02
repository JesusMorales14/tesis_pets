import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class RegisterComponent {
  nombre = '';
  email = '';
  password = '';
  confirmPassword = '';
  adminCode = '';
  showPassword = false;
  showAdminCode = false;
  isLoading = false;
  errorMsg = '';

  constructor(
    private auth: AuthService,
    private router: Router,
    public themeService: ThemeService,
  ) {}

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
    this.isLoading = true;
    this.errorMsg = '';
    this.auth.register(this.nombre.trim(), this.email.trim(), this.password, this.adminCode).subscribe({
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
