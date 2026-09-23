import { describe, expect, it } from 'vitest';
import { localTime, timeAgo } from './time';

describe('timeAgo', () => {
  const now = Date.parse('2026-09-23T12:00:00Z');

  it('rounds into the largest sensible unit', () => {
    expect(timeAgo('2026-09-23T11:59:30Z', now)).toBe('just now');
    expect(timeAgo('2026-09-23T11:48:00Z', now)).toBe('12m ago');
    expect(timeAgo('2026-09-23T09:00:00Z', now)).toBe('3h ago');
    expect(timeAgo('2026-09-21T12:00:00Z', now)).toBe('2d ago');
  });

  it('falls back to a date after a week', () => {
    expect(timeAgo('2026-09-01T12:00:00Z', now)).toBe('Sep 1');
  });
});

describe('localTime', () => {
  it('formats in the given zone', () => {
    expect(localTime('America/New_York', Date.parse('2026-09-23T19:12:00Z'))).toBe('3:12 PM');
  });
});
