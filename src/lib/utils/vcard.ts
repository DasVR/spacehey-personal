import type { ContactCard } from '$lib/data/types';

/** Escape a vCard 3.0 text value. */
export function escapeText(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\;');
}

/** Fold a content line at 75 octets, continuation lines start with a space. */
export function foldLine(line: string): string {
  const bytes = new TextEncoder().encode(line);
  if (bytes.length <= 75) return line;
  const out: string[] = [];
  let current = '';
  let size = 0;
  const limit = () => (out.length === 0 ? 75 : 74);
  for (const ch of line) {
    const n = new TextEncoder().encode(ch).length;
    if (size + n > limit()) {
      out.push(current);
      current = '';
      size = 0;
    }
    current += ch;
    size += n;
  }
  out.push(current);
  return out.join('\r\n ');
}

export function buildVCard(card: ContactCard): string {
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:;${escapeText(card.name)};;;`,
    `FN:${escapeText(card.name)}`,
    `NICKNAME:${escapeText(card.nickname)}`,
  ];
  if (card.org) lines.push(`ORG:${escapeText(card.org)}`);
  if (card.title) lines.push(`TITLE:${escapeText(card.title)}`);
  lines.push(`EMAIL;TYPE=INTERNET,PREF:${card.email}`);
  lines.push(`URL:${card.url}`);
  lines.push(`ADR;TYPE=HOME:;;;;${escapeText(card.location)};;`);
  for (const social of card.socials) {
    lines.push(`X-SOCIALPROFILE;TYPE=${social.type}:${social.url}`);
  }
  lines.push(`NOTE:${escapeText(card.note)}`);
  if (card.photo) lines.push(`PHOTO;ENCODING=b;TYPE=${card.photo.mime}:${card.photo.base64}`);
  lines.push('END:VCARD');
  return lines.map(foldLine).join('\r\n') + '\r\n';
}
