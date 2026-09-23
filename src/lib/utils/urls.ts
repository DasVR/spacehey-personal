import { base } from '$app/paths';
import { joinBase, joinPage } from './joinBase';

export function assetUrl(path: string): string {
  // Already absolute, relative, or a Vite-fingerprinted asset (which already
  // carries the right base for the current page — `base` is relative during
  // prerender, so it can't be matched here).
  if (/^(https?:|data:|blob:|\.)/.test(path) || path.includes('/_app/immutable/')) return path;
  return joinBase(base, path);
}

export function pageHref(path: string): string {
  return joinPage(base, path);
}
