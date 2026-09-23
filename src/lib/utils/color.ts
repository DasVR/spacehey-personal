/** Parse `#rgb` / `#rrggbb` into 0–1 floats. Returns null for anything else. */
export function parseHex(input: string): [number, number, number] | null {
  const value = input.trim().replace(/^#/, '');
  const full =
    value.length === 3
      ? value
          .split('')
          .map((c) => c + c)
          .join('')
      : value;
  if (!/^[0-9a-f]{6}$/i.test(full)) return null;
  const n = Number.parseInt(full, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

/** Read a hex custom property off an element, with a fallback colour. */
export function readTokenColor(el: Element, name: string, fallback: [number, number, number]): [number, number, number] {
  return parseHex(getComputedStyle(el).getPropertyValue(name)) ?? fallback;
}

export function readTokenNumber(el: Element, name: string, fallback: number): number {
  const n = Number.parseFloat(getComputedStyle(el).getPropertyValue(name));
  return Number.isFinite(n) ? n : fallback;
}
