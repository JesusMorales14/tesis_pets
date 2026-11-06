import { DiagnosisLabelPipe } from './diagnosis-label.pipe';

describe('DiagnosisLabelPipe', () => {
  const pipe = new DiagnosisLabelPipe();

  it('reemplaza guiones bajos y capitaliza cada palabra', () => {
    expect(pipe.transform('parvovirus_canino')).toBe('Parvovirus Canino');
  });

  it('puede devolver el texto sin capitalizar', () => {
    expect(pipe.transform('moquillo_canino', false)).toBe('moquillo canino');
  });

  it('tolera valores vacíos', () => {
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(undefined)).toBe('');
  });
});
