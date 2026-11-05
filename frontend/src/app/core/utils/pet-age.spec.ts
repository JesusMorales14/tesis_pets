import { formatPetAge } from './pet-age';

describe('formatPetAge', () => {
  it('combina años y meses', () => expect(formatPetAge(27)).toBe('2 años y 3 meses'));
  it('usa singular', () => expect(formatPetAge(13)).toBe('1 año y 1 mes'));
  it('omite los meses en años exactos', () => expect(formatPetAge(24)).toBe('2 años'));
  it('muestra meses para cachorros', () => expect(formatPetAge(0)).toBe('0 meses'));
  it('sin dato', () => expect(formatPetAge(null)).toBe('Sin dato'));
});
