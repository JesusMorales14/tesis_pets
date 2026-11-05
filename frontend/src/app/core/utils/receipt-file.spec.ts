import { RECEIPT_MAX_BYTES, describeReceiptFile, validateReceiptFile } from './receipt-file';

describe('receipt-file', () => {
  it('acepta imágenes PNG, JPG y WEBP de hasta 5 MB', () => {
    expect(validateReceiptFile({ type: 'image/png', size: 1000 })).toBeNull();
    expect(validateReceiptFile({ type: 'image/jpeg', size: RECEIPT_MAX_BYTES })).toBeNull();
  });

  it('rechaza otros formatos', () => {
    expect(validateReceiptFile({ type: 'application/pdf', size: 1000 })).toContain('PNG, JPG o WEBP');
  });

  it('rechaza archivos de más de 5 MB', () => {
    expect(validateReceiptFile({ type: 'image/png', size: RECEIPT_MAX_BYTES + 1 })).toContain('5 MB');
  });

  it('describe el archivo en KB o MB', () => {
    expect(describeReceiptFile({ type: 'image/png', size: 245 * 1024 })).toBe('Imagen PNG · 245 KB');
    expect(describeReceiptFile({ type: 'image/webp', size: 2.5 * 1024 * 1024 })).toBe('Imagen WEBP · 2.5 MB');
  });
});
