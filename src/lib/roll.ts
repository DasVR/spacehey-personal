/*
 * The roll is whatever is in src/lib/roll/. Vite fingerprints each file, so
 * adding a photo is just adding a file — see src/lib/roll/README.md.
 */

import { parseRollName } from './roll-name';

export interface RollPhoto {
  src: string;
  file: string;
  date: string;
  caption: string;
}

const files = import.meta.glob('./roll/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG,WEBP}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

export const roll: RollPhoto[] = Object.entries(files)
  .map(([path, src]) => {
    const file = path.split('/').pop() ?? path;
    return { src, file, ...parseRollName(file) };
  })
  .sort((a, b) => b.file.localeCompare(a.file));

export function formatRollDate(date: string): string {
  if (!date) return '';
  const d = new Date(`${date}T12:00:00`);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
