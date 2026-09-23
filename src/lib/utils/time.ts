/** "just now", "12m ago", "3h ago", "2d ago", or a short date past a week. */
export function timeAgo(iso: string, now: number = Date.now()): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const s = Math.max(0, Math.round((now - then) / 1000));
  if (s < 60) return 'just now';
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/** Wall-clock time somewhere else, e.g. "3:12 PM". */
export function localTime(timeZone: string, now: number = Date.now()): string {
  return new Intl.DateTimeFormat('en-US', { timeZone, hour: 'numeric', minute: '2-digit' }).format(now);
}

/** Hours ahead (+) or behind (−) the viewer. 0 when in the same zone. */
export function hourOffset(timeZone: string, now: number = Date.now()): number {
  const there = new Date(new Date(now).toLocaleString('en-US', { timeZone })).getTime();
  const here = new Date(new Date(now).toLocaleString('en-US')).getTime();
  return Math.round((there - here) / 3_600_000);
}
