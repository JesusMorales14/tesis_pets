import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class LoginComponent {
  email = '';
  password = '';
  showPassword = false;
  isLoading = false;
  errorMsg = '';

  constructor(
    private auth: AuthService,
    private router: Router,
    public themeService: ThemeService,
  ) {}

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
