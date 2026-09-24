import { describe, expect, it } from 'vitest';
import { parseRollLook, parseRollName, rollFileName } from './roll-name';

describe('parseRollName', () => {
  it('splits the date and turns the slug into a caption', () => {
    expect(parseRollName('2026-09-14--crowd-under-orange-lights.jpg')).toEqual({
      date: '2026-09-14',
      caption: 'Crowd under orange lights',
    });
  });

  it('copes with files that skip the convention', () => {
    expect(parseRollName('IMG_2041.JPG')).toEqual({ date: '', caption: 'IMG 2041' });
    expect(parseRollName('2026-01-02.png')).toEqual({ date: '2026-01-02', caption: 'Untitled' });
  });
});

describe('rollFileName', () => {
  it('round-trips through parseRollName', () => {
    const name = rollFileName('2026-09-23', 'Soundcheck at The Social!', 'webp');
    expect(name).toBe('2026-09-23--soundcheck-at-the-social.webp');
    expect(parseRollName(name)).toEqual({ date: '2026-09-23', caption: 'Soundcheck at the social' });
  });
});

describe('parseRollLook', () => {
  it('keeps valid settings and clamps numbers', () => {
    expect(parseRollLook({ grain: 12, tones: 2, palette: 'ember', focus: [120, 30], dither: false })).toEqual({
      grain: 8,
      tones: 2,
      palette: 'ember',
      focus: [100, 30],
      dither: false,
    });
  });

  it('accepts a custom three-colour palette', () => {
    expect(parseRollLook({ palette: ['#000000', '#ff0000', '#ffffff'] }).palette).toEqual(['#000000', '#ff0000', '#ffffff']);
  });

  it('drops junk instead of throwing', () => {
    expect(parseRollLook({ palette: 'neon', tones: 4, focus: 'center', caption: '  ' })).toEqual({});
    expect(parseRollLook(null)).toEqual({});
  });
});
