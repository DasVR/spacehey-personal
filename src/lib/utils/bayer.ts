/** Classic 8×8 ordered-dither matrix, normalised to [0, 1). */
export const BAYER_8: readonly number[] = (() => {
  const base = [
    [0, 2],
    [3, 1],
  ];
  let m = base;
  while (m.length < 8) {
    const n = m.length;
    const next: number[][] = Array.from({ length: n * 2 }, () => new Array<number>(n * 2).fill(0));
    for (let y = 0; y < n; y += 1) {
      for (let x = 0; x < n; x += 1) {
        const v = m[y][x] * 4;
        next[y][x] = v;
        next[y][x + n] = v + 2;
        next[y + n][x] = v + 3;
        next[y + n][x + n] = v + 1;
      }
    }
    m = next;
  }
  return m.flat().map((v) => (v + 0.5) / 64);
})();

export function bayerAt(x: number, y: number): number {
  return BAYER_8[(y & 7) * 8 + (x & 7)];
}

/**
 * Quantise a 0–1 luminance to one of `levels` bands with ordered dithering.
 * Returns the band index, 0 (darkest) … levels - 1.
 */
export function ditherLevel(lum: number, x: number, y: number, levels: number): number {
  const steps = levels - 1;
  const v = Math.min(1, Math.max(0, lum)) * steps;
  const band = Math.floor(v + bayerAt(x, y));
  return Math.min(steps, Math.max(0, band));
}

/** Rec. 709 luma, 0–255 inputs, 0–1 out. */
export function luma(r: number, g: number, b: number): number {
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}
