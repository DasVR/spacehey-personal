import { describe, expect, it } from 'vitest';
import { iconForUrl, parseLinks, safeHref } from './links';

describe('iconForUrl', () => {
  it('recognises the usual suspects', () => {
    expect(iconForUrl('https://www.instagram.com/arriq')).toBe('instagram');
    expect(iconForUrl('https://twitter.com/arriq')).toBe('x');
    expect(iconForUrl('https://discord.gg/abc')).toBe('discord');
    expect(iconForUrl('https://music.apple.com/us/playlist/x')).toBe('music');
    expect(iconForUrl('mailto:hi@dasdev.net')).toBe('mail');
    expect(iconForUrl('https://dasdev.net')).toBe('globe');
    expect(iconForUrl('not a url')).toBe('globe');
  });
});

describe('safeHref', () => {
  it('only allows web and mail links', () => {
    expect(safeHref('https://x.com/a')).toBe(true);
    expect(safeHref('mailto:a@b.co')).toBe(true);
    expect(safeHref('javascript:alert(1)')).toBe(false);
    expect(safeHref('data:text/html,hi')).toBe(false);
  });
});

describe('parseLinks', () => {
  it('fills icons and ids, keeps featured, drops junk', () => {
    const links = parseLinks([
      { label: 'Insta', href: 'https://instagram.com/arriq', featured: true },
      { label: 'Insta', href: 'https://instagram.com/other' },
      { label: 'Bad', href: 'javascript:alert(1)' },
      { label: '', href: 'https://x.com' },
      'nope',
    ]);
    expect(links).toEqual([
      { id: 'insta', label: 'Insta', href: 'https://instagram.com/arriq', icon: 'instagram', featured: true },
      { id: 'insta-2', label: 'Insta', href: 'https://instagram.com/other', icon: 'instagram' },
    ]);
  });
});
