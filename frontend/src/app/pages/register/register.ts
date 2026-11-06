import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { AuthService } from '@core/services/auth';
import { navigateAfterAuth } from '@core/utils/auth-redirect';
import { getApiErrorMessage } from '@core/utils/http-error';
import { PASSWORD_MIN_LENGTH, passwordMatchValidator } from '@shared/validators/password-match.validator';

/** Registro de cuenta con consentimiento expreso (Ley N.° 29733). */
@Component({
  selector: 'app-register',
  templateUrl: './register.html',
  styleUrls: ['./register.scss'],
  standalone: true,
  imports: [IonicModule, ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly minLength = PASSWORD_MIN_LENGTH;
  protected readonly form = this.fb.group(
    {
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      newPassword: ['', [Validators.required, Validators.minLength(PASSWORD_MIN_LENGTH)]],
      confirmPassword: ['', Validators.required],
      adminCode: [''],
      acceptedPrivacy: [false, Validators.requiredTrue],
    },
    { validators: passwordMatchValidator() },
  );
  protected readonly showPassword = signal(false);
  protected readonly showAdminCode = signal(false);
  protected readonly isLoading = signal(false);
  protected readonly errorMsg = signal('');
  protected readonly navState = history.state;

  protected invalid(control: keyof typeof this.form.controls): boolean {
    const c = this.form.controls[control];
    return c.touched && c.invalid;
  }

  protected submit(): void {
    const message = this.validationMessage();
    if (message) {
      this.form.markAllAsTouched();
      this.errorMsg.set(message);
      return;
    }
    const { nombre, email, newPassword, adminCode, acceptedPrivacy } = this.form.getRawValue();
    this.isLoading.set(true);
    this.errorMsg.set('');
    this.auth.register(nombre.trim(), email.trim(), newPassword, adminCode, acceptedPrivacy).subscribe({
      next: () => {
        this.isLoading.set(false);
        void navigateAfterAuth(this.router, this.auth.isAdmin);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMsg.set(getApiErrorMessage(err, 'Error al registrarse'));
      },
    });
  }

  /** Primer problema del formulario, con el mismo orden y texto de antes. */
  private validationMessage(): string | null {
    const c = this.form.controls;
    if (c.nombre.invalid || c.email.hasError('required') || c.newPassword.hasError('required')) {
      return 'Por favor completa todos los campos';
    }
    if (c.email.invalid) return 'Ingresa un correo electrónico válido';
    if (this.form.hasError('passwordMismatch') || c.confirmPassword.invalid) return 'Las contraseñas no coinciden';
    if (c.newPassword.invalid) return `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres`;
    if (c.acceptedPrivacy.invalid) return 'Debes aceptar la Política de Privacidad para continuar';
    return null;
  }
}
