import { describe, expect, it } from 'vitest';
import { resizeSteps, targetSize } from './photo';

describe('targetSize', () => {
  it('upscales, then caps the long edge', () => {
    expect(targetSize(800, 600, 2, 2400)).toEqual({ width: 1600, height: 1200 });
    expect(targetSize(800, 600, 4, 2400)).toEqual({ width: 2400, height: 1800 });
  });

  it('shrinks big originals to the cap', () => {
    expect(targetSize(4032, 3024, 1, 2400)).toEqual({ width: 2400, height: 1800 });
  });
});

describe('resizeSteps', () => {
  it('never jumps more than 2× at once', () => {
    expect(resizeSteps(500, 2000)).toEqual([1000, 2000]);
    expect(resizeSteps(4000, 900)).toEqual([2000, 1000, 900]);
    expect(resizeSteps(1000, 1500)).toEqual([1500]);
  });
});
