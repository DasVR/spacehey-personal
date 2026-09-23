import type { Mode } from '$lib/data/types';

/**
 * Apply a mode to <html>. Called on navigation; the view transition around it
 * turns the swap into one crossfade. Without view transitions, transitions are
 * switched off for a frame so nothing smears.
 */
export function applyMode(mode: Mode): void {
  const root = document.documentElement;
  if (root.dataset.theme === mode) return;
  const style = document.createElement('style');
  style.textContent = '*,*::before,*::after{transition:none !important}';
  document.head.appendChild(style);
  root.dataset.theme = mode;
  void root.offsetHeight;
  requestAnimationFrame(() => style.remove());
}

export function modeFromPath(pathname: string, base: string): Mode {
  return pathname.startsWith(`${base}/pro`) ? 'pro' : 'casual';
}

/** Mirrors --color-bg per mode, for <meta name="theme-color"> in prerendered HTML. */
export const THEME_COLOR: Record<Mode, string> = {
  casual: '#070707',
  pro: '#f3f0e8',
};
