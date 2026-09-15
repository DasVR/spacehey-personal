import { describe, expect, it } from 'vitest';
import { randomRotate } from './randomRotate';

describe('randomRotate', () => {
  it('maps a seed onto a small signed degree range', () => {
    expect(randomRotate(0)).toBe('rotate(-3deg)');
    expect(randomRotate(3)).toBe('rotate(0deg)');
    expect(randomRotate(6)).toBe('rotate(3deg)');
    expect(randomRotate(10)).toBe('rotate(0deg)');
  });
});
