import { Component, OnInit, inject } from '@angular/core';
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
export class LoginComponent implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);
  themeService = inject(ThemeService);

  email = '';
  password = '';
  showPassword = false;
  isLoading = false;
  errorMsg = '';

  ngOnInit() {
    if (history.state?.expiredSession) {
      this.errorMsg = 'Tu sesión ha expirado. Inicia sesión nuevamente para continuar.';
    }
  }

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
        // Sin una pantalla a la que volver, cada rol entra a su vista
        // principal: el veterinario a su panel, el dueño al inicio.
        const returnTo = state?.returnTo || (this.auth.isAdmin ? '/admin' : '/tabs/tab1');
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
