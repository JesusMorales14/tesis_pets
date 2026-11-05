import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/** Longitud mínima de contraseña, igual a la que exige el backend. */
export const PASSWORD_MIN_LENGTH = 6;

/**
 * Validador de grupo: el campo `confirmKey` debe coincidir con `passwordKey`.
 * Marca el error en el grupo (`passwordMismatch`) para no pisar los errores
 * propios del campo de confirmación.
 */
export function passwordMatchValidator(passwordKey = 'newPassword', confirmKey = 'confirmPassword'): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const password = group.get(passwordKey)?.value;
    const confirm = group.get(confirmKey)?.value;
    return password && confirm && password !== confirm ? { passwordMismatch: true } : null;
  };
}
