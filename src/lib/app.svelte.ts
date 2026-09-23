import { browser } from '$app/environment';
import { casual } from '$lib/data/profile';
import type { GuestbookEntry } from '$lib/data/types';
import type { DitherField } from '$lib/gl/field';

const GUESTBOOK_KEY = 'card-guestbook';
const VISITOR_KEY = 'card-visitors';

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
  visitors = $state(1284);
  /** Bumped to replay the tap sequence on the card. */
  replays = $state(0);
  /** The live shader, when WebGL came up. */
  field: DitherField | null = null;
  private toastTimer = 0;

  hydrate(): void {
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

  sign(author: string, body: string): void {
    const entry: GuestbookEntry = {
      id: `g-${Date.now()}`,
      author: author.trim() || 'anon',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      body: body.trim(),
    };
    this.guestbook = [entry, ...this.guestbook];
    write(GUESTBOOK_KEY, this.guestbook);
  }
}

export const app = new AppState();
