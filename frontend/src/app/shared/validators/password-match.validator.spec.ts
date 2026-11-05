import { FormControl, FormGroup } from '@angular/forms';
import { passwordMatchValidator } from './password-match.validator';

describe('passwordMatchValidator', () => {
  const build = (a: string, b: string) =>
    new FormGroup(
      { newPassword: new FormControl(a), confirmPassword: new FormControl(b) },
      { validators: passwordMatchValidator() },
    );

  it('es válido cuando coinciden', () => {
    expect(build('secreto1', 'secreto1').errors).toBeNull();
  });

  it('marca passwordMismatch cuando no coinciden', () => {
    expect(build('secreto1', 'secreto2').errors).toEqual({ passwordMismatch: true });
  });

  it('no marca error mientras falte alguno de los campos', () => {
    expect(build('secreto1', '').errors).toBeNull();
  });
});
