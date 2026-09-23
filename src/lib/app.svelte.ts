import { browser } from '$app/environment';
import { casual } from '$lib/data/profile';
import type { GuestbookEntry } from '$lib/data/types';
import type { DitherField } from '$lib/gl/field';

const GUESTBOOK_KEY = 'card-guestbook';
const VISITOR_KEY = 'card-visitors';
const REACT_KEY = 'card-reactions';
const SIGNED_KEY = 'card-last-signed';

export const REACTIONS = ['♥', '🔥', '🤘', '👀'] as const;
export type Reaction = (typeof REACTIONS)[number];

/** Strip control characters and collapse runs of blank lines. */
export function clean(text: string, max: number): string {
  return text
    .replace(/[\u0000-\u0008\u000B-\u001F\u007F\u200B-\u200F\u202A-\u202E]/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, max);
}

function read<T>(key: string, fallback: T): T {
  if (!browser) return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): void {
  if (!browser) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* private mode or full: the page still works, it just forgets */
  }
}

class AppState {
  toast = $state<{ id: number; text: string } | null>(null);
  guestbook = $state<GuestbookEntry[]>(structuredClone(casual.guestbook));
  /** This visitor's own reactions, keyed by entry id. */
  reacted = $state<Record<string, Reaction[]>>({});
  visitors = $state(1284);
  /** Bumped to replay the tap sequence on the card. */
  replays = $state(0);
  /** The live shader, when WebGL came up. */
  field: DitherField | null = null;
  private toastTimer = 0;

  hydrate(): void {
    this.reacted = read<Record<string, Reaction[]>>(REACT_KEY, {});
    const stored = read<GuestbookEntry[] | null>(GUESTBOOK_KEY, null);
    if (stored?.length) this.guestbook = stored;
    const count = read<number>(VISITOR_KEY, 1284) + 1;
    this.visitors = count;
    write(VISITOR_KEY, count);
  }

  say(text: string): void {
    this.toast = { id: Date.now(), text };
    if (!browser) return;
    window.clearTimeout(this.toastTimer);
    this.toastTimer = window.setTimeout(() => (this.toast = null), 2600);
  }

  tap(): void {
    this.field?.tap();
    if (browser) navigator.vibrate?.([10, 60, 16]);
  }

  replay(): void {
    this.replays += 1;
  }

  /** Returns an error message, or null when signed. */
  sign(author: string, body: string): string | null {
    const text = clean(body, 400);
    if (text.length < 2) return 'Say a little more';
    const last = read<number>(SIGNED_KEY, 0);
    if (Date.now() - last < 30_000) return 'Easy — one entry every 30 seconds';
    const entry: GuestbookEntry = {
      id: `g-${Date.now()}`,
      author: clean(author, 32) || 'anon',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      body: text,
    };
    this.guestbook = [entry, ...this.guestbook];
    write(GUESTBOOK_KEY, this.guestbook);
    write(SIGNED_KEY, Date.now());
    return null;
  }

  react(id: string, r: Reaction): void {
    const mine = this.reacted[id] ?? [];
    const next = mine.includes(r) ? mine.filter((x) => x !== r) : [...mine, r];
    this.reacted = { ...this.reacted, [id]: next };
    write(REACT_KEY, this.reacted);
  }
}

export const app = new AppState();
