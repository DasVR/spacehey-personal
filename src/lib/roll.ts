/*
 * The roll is whatever is in src/lib/roll/. Vite fingerprints each file, so
 * adding a photo is just adding a file — see src/lib/roll/README.md.
 */

import { parseRollLook, parseRollName, type RollLook } from './roll-name';

export interface RollPhoto {
  src: string;
  file: string;
  date: string;
  caption: string;
  look: RollLook;
}

const files = import.meta.glob('./roll/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG,WEBP}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

/** Optional sidecars: same name as the photo, .json. */
const looks = import.meta.glob('./roll/*.json', { eager: true, import: 'default' }) as Record<string, unknown>;
const stemOf = (path: string) => (path.split('/').pop() ?? path).replace(/\.[^.]+$/, '');
const lookByStem = new Map(Object.entries(looks).map(([path, raw]) => [stemOf(path), parseRollLook(raw)]));

export const roll: RollPhoto[] = Object.entries(files)
  .map(([path, src]) => {
    const file = path.split('/').pop() ?? path;
    const named = parseRollName(file);
    const look = lookByStem.get(stemOf(file)) ?? {};
    return { src, file, ...named, caption: look.caption ?? named.caption, look };
  })
  .sort((a, b) => b.file.localeCompare(a.file));

export function formatRollDate(date: string): string {
  if (!date) return '';
  const d = new Date(`${date}T12:00:00`);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
