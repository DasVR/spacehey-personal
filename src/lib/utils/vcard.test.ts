import { describe, expect, it } from 'vitest';
import { buildVCard, escapeText, foldLine } from './vcard';

describe('escapeText', () => {
  it('escapes separators and newlines', () => {
    expect(escapeText('a, b; c\nd\\e')).toBe('a\\, b\; c\\nd\\\\e');
  });
});

describe('foldLine', () => {
  it('folds long lines into 75-octet chunks', () => {
    const folded = foldLine(`NOTE:${'x'.repeat(200)}`);
    const parts = folded.split('\r\n');
    expect(parts.length).toBeGreaterThan(2);
    for (const part of parts) expect(part.length).toBeLessThanOrEqual(75);
    expect(parts.slice(1).every((p) => p.startsWith(' '))).toBe(true);
    expect(folded.replace(/\r\n /g, '')).toBe(`NOTE:${'x'.repeat(200)}`);
  });
});

describe('buildVCard', () => {
  it('produces a CRLF vCard 3.0 with the essentials', () => {
    const text = buildVCard({
      mode: 'pro',
      name: 'Das',
      nickname: 'das',
      title: 'Web developer',
      org: 'dasdev.net',
      email: 'hello@dasdev.net',
      url: 'https://p.dasdev.net/pro/',
      note: 'Met via tap',
      location: 'Florida',
      socials: [{ type: 'github', url: 'https://github.com/DasVR' }],
    });
    expect(text.startsWith('BEGIN:VCARD\r\nVERSION:3.0\r\n')).toBe(true);
    expect(text).toContain('FN:Das\r\n');
    expect(text).toContain('TITLE:Web developer\r\n');
    expect(text).toContain('X-SOCIALPROFILE;TYPE=github:https://github.com/DasVR\r\n');
    expect(text.endsWith('END:VCARD\r\n')).toBe(true);
  });
});
