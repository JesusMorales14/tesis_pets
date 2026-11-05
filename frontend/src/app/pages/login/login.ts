import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { AuthService } from '@core/services/auth';
import { navigateAfterAuth } from '@core/utils/auth-redirect';
import { getApiErrorMessage } from '@core/utils/http-error';

/** Inicio de sesión. */
@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
  standalone: true,
  imports: [IonicModule, ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });
  protected readonly showPassword = signal(false);
  protected readonly isLoading = signal(false);
  protected readonly errorMsg = signal('');
  /** Se conserva el estado (returnTo) al pasar al registro. */
  protected readonly navState = history.state;

  ngOnInit(): void {
    if (history.state?.expiredSession) {
      this.errorMsg.set('Tu sesión ha expirado. Inicia sesión nuevamente para continuar.');
    }
  }

  protected invalid(control: 'email' | 'password'): boolean {
    const c = this.form.controls[control];
    return c.touched && c.invalid;
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMsg.set('Por favor completa todos los campos');
      return;
    }
    const { email, password } = this.form.getRawValue();
    this.isLoading.set(true);
    this.errorMsg.set('');
    this.auth.login(email.trim(), password).subscribe({
      next: () => {
        this.isLoading.set(false);
        void navigateAfterAuth(this.router, this.auth.isAdmin);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMsg.set(getApiErrorMessage(err, 'Correo o contraseña incorrectos'));
      },
    });
  }
}
