/** `2026-09-14--crowd-under-lights.jpg` → date + "crowd under lights". */
export function parseRollName(file: string): { date: string; caption: string } {
  const stem = file.replace(/\.[^.]+$/, '');
  const m = stem.match(/^(\d{4}-\d{2}-\d{2})(?:--?(.*))?$/);
  const date = m?.[1] ?? '';
  const words = (m ? (m[2] ?? '') : stem).replace(/[-_]+/g, ' ').trim();
  return { date, caption: words ? words[0].toUpperCase() + words.slice(1) : 'Untitled' };
}

/** Build the file name the roll expects from a date and a free-text caption. */
export function rollFileName(date: string, caption: string, ext: string): string {
  const slug = caption
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  return `${date}--${slug || 'untitled'}.${ext}`;
}

/** Named palettes; colours live in tokens.css as --pal-{name}-{dark,mid,light}. */
export const PALETTES = ['theme', 'mono', 'ember', 'ocean', 'mint', 'sepia', 'rose'] as const;
export type PaletteName = (typeof PALETTES)[number];

/**
 * Per-photo look, from an optional sidecar next to the photo:
 * `2026-09-14--crowd.jpg` + `2026-09-14--crowd.json`.
 */
export interface RollLook {
  caption?: string;
  /** A line under the caption in the viewer. */
  note?: string;
  /** false shows the plain photo instead of the dither. */
  dither?: boolean;
  /** CSS pixels per dither cell, 1–8. */
  grain?: number;
  tones?: 2 | 3;
  /** A named palette, or three hex colours dark → light. */
  palette?: PaletteName | [string, string, string];
  /** Crop focus in percent, [x, y]. */
  focus?: [number, number];
}

const HEX = /^#[0-9a-f]{6}$/i;
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));
const isNum = (n: unknown): n is number => typeof n === 'number' && Number.isFinite(n);

/** Validate a sidecar: anything malformed is dropped rather than breaking the page. */
export function parseRollLook(raw: unknown): RollLook {
  if (!raw || typeof raw !== 'object') return {};
  const r = raw as Record<string, unknown>;
  const look: RollLook = {};
  if (typeof r.caption === 'string' && r.caption.trim()) look.caption = r.caption.trim().slice(0, 80);
  if (typeof r.note === 'string' && r.note.trim()) look.note = r.note.trim().slice(0, 200);
  if (typeof r.dither === 'boolean') look.dither = r.dither;
  if (isNum(r.grain)) look.grain = clamp(Math.round(r.grain), 1, 8);
  if (r.tones === 2 || r.tones === 3) look.tones = r.tones;
  if (typeof r.palette === 'string' && (PALETTES as readonly string[]).includes(r.palette)) {
    look.palette = r.palette as PaletteName;
  } else if (Array.isArray(r.palette) && r.palette.length === 3 && r.palette.every((c) => typeof c === 'string' && HEX.test(c))) {
    look.palette = r.palette as [string, string, string];
  }
  if (Array.isArray(r.focus) && r.focus.length === 2 && r.focus.every(isNum)) {
    look.focus = [clamp(r.focus[0], 0, 100), clamp(r.focus[1], 0, 100)];
  }
  return look;
}
