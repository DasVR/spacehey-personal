import type { Handle } from '@sveltejs/kit';
import { base } from '$app/paths';

/** Prerendered pages ship with the right theme, so /pro/ never flashes dark. */
export const handle: Handle = async ({ event, resolve }) => {
  const isPro = event.url.pathname.startsWith(`${base}/pro`);
  return resolve(event, {
    transformPageChunk: ({ html }) => (isPro ? html.replace('data-theme="casual"', 'data-theme="pro"') : html),
  });
};
