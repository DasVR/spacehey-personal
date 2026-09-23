export type ArrivalSource = 'nfc' | 'qr' | 'link';

/**
 * How the visitor got here. NFC tags and QR codes carry `?via=nfc` / `?via=qr`
 * so the page can play the tap sequence only when someone actually tapped.
 */
export function arrivalSource(search: string): ArrivalSource | null {
  const via = new URLSearchParams(search).get('via');
  switch (via) {
    case 'nfc':
    case 'tap':
      return 'nfc';
    case 'qr':
      return 'qr';
    case 'link':
      return 'link';
    default:
      return null;
  }
}

export function arrivalLabel(source: ArrivalSource): string {
  switch (source) {
    case 'nfc':
      return 'Tapped';
    case 'qr':
      return 'Scanned';
    case 'link':
      return 'Shared';
    default: {
      const _never: never = source;
      return _never;
    }
  }
}
