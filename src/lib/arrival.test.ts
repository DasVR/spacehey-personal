import { describe, expect, it } from 'vitest';
import { arrivalSource } from './arrival';

describe('arrivalSource', () => {
  it('reads the via param written to tags and QR codes', () => {
    expect(arrivalSource('?via=nfc')).toBe('nfc');
    expect(arrivalSource('?via=tap')).toBe('nfc');
    expect(arrivalSource('?via=qr&x=1')).toBe('qr');
  });

  it('ignores ordinary visits', () => {
    expect(arrivalSource('')).toBeNull();
    expect(arrivalSource('?via=elsewhere')).toBeNull();
  });
});
