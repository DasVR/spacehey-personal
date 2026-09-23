export interface BarcodeBar {
  width: 1 | 2;
  height: number;
}

export const TITLE_BARS: BarcodeBar[] = [
  { width: 1, height: 100 },
  { width: 2, height: 70 },
  { width: 1, height: 100 },
  { width: 1, height: 60 },
  { width: 2, height: 100 },
  { width: 1, height: 80 },
  { width: 1, height: 100 },
  { width: 2, height: 55 },
  { width: 1, height: 100 },
  { width: 1, height: 90 },
  { width: 2, height: 100 },
  { width: 1, height: 65 },
];

export const COMPACT_BARS: BarcodeBar[] = [
  { width: 1, height: 100 },
  { width: 2, height: 60 },
  { width: 1, height: 100 },
];

export const FRIEND_BARS: BarcodeBar[] = [
  { width: 1, height: 100 },
  { width: 2, height: 70 },
  { width: 1, height: 100 },
  { width: 1, height: 50 },
];

export type BarcodeKind = 'title' | 'compact' | 'friend';

export function barsFor(kind: BarcodeKind): BarcodeBar[] {
  switch (kind) {
    case 'title':
      return TITLE_BARS;
    case 'compact':
      return COMPACT_BARS;
    case 'friend':
      return FRIEND_BARS;
    default: {
      const _never: never = kind;
      return _never;
    }
  }
}
