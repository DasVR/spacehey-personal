import { describe, expect, it } from 'vitest';
import { BAYER_8, bayerAt, ditherLevel } from './bayer';

describe('BAYER_8', () => {
  it('holds each of the 64 thresholds once', () => {
    const ranks = BAYER_8.map((v) => Math.round(v * 64 - 0.5)).sort((a, b) => a - b);
    expect(ranks).toEqual(Array.from({ length: 64 }, (_, i) => i));
  });

  it('wraps every 8 pixels', () => {
    expect(bayerAt(9, 17)).toBe(bayerAt(1, 1));
  });
});

describe('ditherLevel', () => {
  it('keeps pure black and pure white solid', () => {
    for (let i = 0; i < 64; i += 1) {
      expect(ditherLevel(0, i % 8, i >> 3, 3)).toBe(0);
      expect(ditherLevel(1, i % 8, i >> 3, 3)).toBe(2);
    }
  });

  it('turns mid grey into roughly half-on in a 2-level dither', () => {
    let on = 0;
    for (let i = 0; i < 64; i += 1) on += ditherLevel(0.5, i % 8, i >> 3, 2);
    expect(on).toBe(32);
  });
});
