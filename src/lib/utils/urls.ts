import { base } from '$app/paths';
import { joinBase, joinPage } from './joinBase';

export function assetUrl(path: string): string {
  // Already absolute, or a Vite-fingerprinted URL that carries the base.
  if (/^(https?:|data:|blob:)/.test(path) || (base && path.startsWith(`${base}/`))) return path;
  return joinBase(base, path);
}

export function pageHref(path: string): string {
  return joinPage(base, path);
}
