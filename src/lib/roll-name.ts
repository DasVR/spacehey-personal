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
