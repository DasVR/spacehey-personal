/*
 * The card's links live in src/lib/data/links.json so they can be edited
 * without touching code (or with the editor at /links/edit/). Everything is
 * validated here; a bad row is dropped rather than breaking the page.
 */

import type { IconName, Link } from '$lib/data/types';

/** Icons the editor offers, in picker order. */
export const LINK_ICONS: IconName[] = [
  'instagram',
  'x',
  'tiktok',
  'discord',
  'youtube',
  'twitch',
  'bluesky',
  'github',
  'music',
  'spotify',
  'mail',
  'globe',
  'code',
  'camera',
  'game',
  'film',
  'star',
  'coffee',
];

const HOSTS: [RegExp, IconName][] = [
  [/(^|\.)instagram\.com$/, 'instagram'],
  [/(^|\.)(x|twitter)\.com$/, 'x'],
  [/(^|\.)tiktok\.com$/, 'tiktok'],
  [/(^|\.)(discord\.com|discord\.gg)$/, 'discord'],
  [/(^|\.)(youtube\.com|youtu\.be)$/, 'youtube'],
  [/(^|\.)twitch\.tv$/, 'twitch'],
  [/(^|\.)(bsky\.app|bsky\.social)$/, 'bluesky'],
  [/(^|\.)github\.(com|io)$/, 'github'],
  [/(^|\.)music\.apple\.com$/, 'music'],
  [/(^|\.)open\.spotify\.com$|(^|\.)spotify\.com$/, 'spotify'],
];

/** Guess an icon from a URL: instagram.com → instagram, mailto: → mail, else globe. */
export function iconForUrl(href: string): IconName {
  if (href.startsWith('mailto:')) return 'mail';
  try {
    const host = new URL(href).hostname.replace(/^www\./, '');
    return HOSTS.find(([re]) => re.test(host))?.[1] ?? 'globe';
  } catch {
    return 'globe';
  }
}

/** Only web and mail links; no javascript: or data: surprises. */
export function safeHref(href: string): boolean {
  return /^(https?:\/\/[^\s]+|mailto:[^\s@]+@[^\s@]+)$/i.test(href.trim());
}

export function slugId(label: string, taken: Set<string>): string {
  const base =
    label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 24) || 'link';
  let id = base;
  for (let n = 2; taken.has(id); n += 1) id = `${base}-${n}`;
  return id;
}

export function parseLinks(raw: unknown): Link[] {
  if (!Array.isArray(raw)) return [];
  const taken = new Set<string>();
  const out: Link[] = [];
  for (const r of raw) {
    if (!r || typeof r !== 'object') continue;
    const row = r as Record<string, unknown>;
    const label = typeof row.label === 'string' ? row.label.trim().slice(0, 40) : '';
    const href = typeof row.href === 'string' ? row.href.trim() : '';
    if (!label || !safeHref(href)) continue;
    const wanted = typeof row.id === 'string' && row.id.trim() ? row.id.trim() : slugId(label, taken);
    const id = taken.has(wanted) ? slugId(wanted, taken) : wanted;
    taken.add(id);
    const icon = typeof row.icon === 'string' && (LINK_ICONS as string[]).includes(row.icon) ? (row.icon as IconName) : iconForUrl(href);
    const link: Link = { id, label, href, icon };
    if (typeof row.detail === 'string' && row.detail.trim()) link.detail = row.detail.trim().slice(0, 60);
    if (row.featured === true) link.featured = true;
    out.push(link);
  }
  return out;
}
