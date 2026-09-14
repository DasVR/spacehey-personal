let n = 0;

export function nextId(prefix: string): string {
  n += 1;
  return `${prefix}-${n}`;
}
