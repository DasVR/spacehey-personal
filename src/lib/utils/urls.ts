import { base } from '$app/paths';
import { joinBase, joinPage } from './joinBase';

export function assetUrl(path: string): string {
  return joinBase(base, path);
}

export function pageHref(path: string): string {
  return joinPage(base, path);
}
