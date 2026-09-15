/** Prefix a root-relative path with a SvelteKit `paths.base` value. */
export function joinBase(base: string, path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  if (!base) return normalized;
  return `${base}${normalized}`;
}

/** Build a page href that matches `trailingSlash: 'always'`. */
export function joinPage(base: string, path: string): string {
  const normalized = path === '/' ? '/' : `${path.replace(/\/$/, '')}/`;
  if (!base) return normalized;
  if (normalized === '/') return `${base}/`;
  return `${base}${normalized}`;
}
