import { ChangeDetectionStrategy, Component, inject, model, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AuthService } from '@core/services/auth';
import { getApiErrorMessage } from '@core/utils/http-error';
import { CollapsibleSectionComponent } from '@shared/components/collapsible-section/collapsible-section';
import { PASSWORD_MIN_LENGTH, passwordMatchValidator } from '@shared/validators/password-match.validator';

/** Cambio de contraseña (formulario reactivo con validación en cliente). */
@Component({
  selector: 'app-password-form',
  templateUrl: './password-form.html',
  styleUrls: ['./password-form.scss'],
  standalone: true,
  imports: [IonicModule, ReactiveFormsModule, CollapsibleSectionComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PasswordFormComponent {
  private readonly auth = inject(AuthService);
  private readonly fb = inject(NonNullableFormBuilder);

  readonly expanded = model(false);
  protected readonly minLength = PASSWORD_MIN_LENGTH;
  protected readonly isSubmitting = signal(false);
  protected readonly error = signal('');
  protected readonly success = signal('');

  protected readonly form = this.fb.group(
    {
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(PASSWORD_MIN_LENGTH)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordMatchValidator() },
  );

  protected onExpandedChange(open: boolean): void {
    this.expanded.set(open);
    this.error.set('');
    this.success.set('');
  }

  protected showError(control: 'currentPassword' | 'newPassword' | 'confirmPassword'): boolean {
    const c = this.form.controls[control];
    if (control === 'confirmPassword') return c.touched && this.form.hasError('passwordMismatch');
    return c.touched && c.invalid;
  }

  protected submit(): void {
    this.error.set('');
    this.success.set('');
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { currentPassword, newPassword } = this.form.getRawValue();
    this.isSubmitting.set(true);
    this.auth.changePassword(currentPassword, newPassword).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.success.set('Contraseña actualizada correctamente.');
        this.form.reset();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.error.set(getApiErrorMessage(err, 'No se pudo actualizar la contraseña.'));
      },
    });
  }
}
