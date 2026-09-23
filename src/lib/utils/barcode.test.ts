import { describe, expect, it } from 'vitest';
import { barsFor, COMPACT_BARS, FRIEND_BARS, TITLE_BARS } from './barcode';

describe('barsFor', () => {
  it('returns the title barcode pattern', () => {
    expect(barsFor('title')).toEqual(TITLE_BARS);
    expect(TITLE_BARS).toHaveLength(12);
  });

  it('returns compact and friend patterns', () => {
    expect(barsFor('compact')).toEqual(COMPACT_BARS);
    expect(barsFor('friend')).toEqual(FRIEND_BARS);
  });
});
