/*
 * In-browser photo prep for the roll: resize or upscale in smooth ≤2× steps,
 * optional unsharp mask, re-encode (which also drops EXIF/GPS).
 */

export type Upscale = 1 | 2 | 4;

export interface PrepOptions {
  upscale: Upscale;
  /** Longest edge after scaling, in pixels. */
  maxEdge: number;
  sharpen: boolean;
  format: 'image/webp' | 'image/jpeg';
  quality: number;
}

/** Output size: upscale first, then cap the long edge. Never below 1px. */
export function targetSize(w: number, h: number, upscale: Upscale, maxEdge: number): { width: number; height: number } {
  let s = upscale;
  const long = Math.max(w, h) * s;
  if (long > maxEdge) s *= maxEdge / long;
  return { width: Math.max(1, Math.round(w * s)), height: Math.max(1, Math.round(h * s)) };
}

/** Intermediate sizes so no single resample jumps more than 2×. */
export function resizeSteps(from: number, to: number): number[] {
  const steps: number[] = [];
  let cur = from;
  while (to > cur * 2) {
    cur *= 2;
    steps.push(Math.round(cur));
  }
  while (to < cur / 2) {
    cur /= 2;
    steps.push(Math.round(cur));
  }
  steps.push(to);
  return steps;
}

function canvas(w: number, h: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

/** Light unsharp mask: 3×3 blur subtracted from the original. */
function unsharp(ctx: CanvasRenderingContext2D, w: number, h: number, amount = 0.45): void {
  const src = ctx.getImageData(0, 0, w, h);
  const out = ctx.createImageData(w, h);
  const s = src.data;
  const d = out.data;
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      const i = (y * w + x) * 4;
      for (let c = 0; c < 3; c += 1) {
        let sum = 0;
        for (let dy = -1; dy <= 1; dy += 1) {
          const yy = Math.min(h - 1, Math.max(0, y + dy));
          for (let dx = -1; dx <= 1; dx += 1) {
            const xx = Math.min(w - 1, Math.max(0, x + dx));
            sum += s[(yy * w + xx) * 4 + c];
          }
        }
        const v = s[i + c] + (s[i + c] - sum / 9) * amount;
        d[i + c] = v < 0 ? 0 : v > 255 ? 255 : v;
      }
      d[i + 3] = s[i + 3];
    }
  }
  ctx.putImageData(out, 0, 0);
}

export async function prepPhoto(file: Blob, opts: PrepOptions): Promise<{ blob: Blob; width: number; height: number }> {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  const { width, height } = targetSize(bitmap.width, bitmap.height, opts.upscale, opts.maxEdge);

  let source: CanvasImageSource = bitmap;
  let sw = bitmap.width;
  let sh = bitmap.height;
  for (const stepW of resizeSteps(bitmap.width, width)) {
    const stepH = stepW === width ? height : Math.round((stepW / bitmap.width) * bitmap.height);
    const c = canvas(stepW, stepH);
    const ctx = c.getContext('2d');
    if (!ctx) throw new Error('canvas unavailable');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(source, 0, 0, sw, sh, 0, 0, stepW, stepH);
    source = c;
    sw = stepW;
    sh = stepH;
  }
  bitmap.close();

  const final = source as HTMLCanvasElement;
  // Upscaling softens edges; a light unsharp brings them back. Skip huge images.
  if (opts.sharpen && width * height <= 16_000_000) {
    const ctx = final.getContext('2d');
    if (ctx) unsharp(ctx, width, height);
  }

  const blob = await new Promise<Blob | null>((resolve) => final.toBlob(resolve, opts.format, opts.quality));
  if (!blob) throw new Error('encode failed');
  return { blob, width, height };
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}
