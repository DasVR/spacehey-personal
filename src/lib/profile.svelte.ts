import { browser } from '$app/environment';
import { profile as defaults } from '$lib/data/profile';
import type { ContactId, GuestbookEntry, Profile, Widget } from '$lib/data/types';

const VISITOR_KEY = 'profile-visitor-count';
const GUESTBOOK_KEY = 'profile-guestbook';
const WIDGET_KEY = 'profile-widgets';

function cloneProfile(): Profile {
  return structuredClone(defaults);
}

function readJson<T>(key: string, fallback: T): T {
  if (!browser) return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

class ProfileState {
  data = $state<Profile>(cloneProfile());
  editing = $state(false);
  visitorCount = $state(1284);
  toast = $state<string | null>(null);

  hydrate(): void {
    const storedWidgets = readJson<Widget[] | null>(WIDGET_KEY, null);
    const storedBook = readJson<GuestbookEntry[] | null>(GUESTBOOK_KEY, null);
    if (storedWidgets?.length) this.data.widgets = storedWidgets;
    if (storedBook?.length) this.data.guestbook = storedBook;

    if (!browser) return;
    const existing = Number(localStorage.getItem(VISITOR_KEY) ?? '1284');
    const next = Number.isFinite(existing) ? existing + 1 : 1285;
    localStorage.setItem(VISITOR_KEY, String(next));
    this.visitorCount = next;
  }

  toggleEditing(): void {
    this.editing = !this.editing;
  }

  setAbout(value: string): void {
    this.data.about = value;
  }

  setMeet(value: string): void {
    this.data.meet = value;
  }

  setMood(value: string): void {
    this.data.mood = value;
  }

  updateWidget(id: string, patch: Partial<Widget>): void {
    this.data.widgets = this.data.widgets.map((widget) =>
      widget.id === id ? { ...widget, ...patch } : widget,
    );
    this.persistWidgets();
  }

  addWidget(): void {
    const id = `w-${Date.now()}`;
    this.data.widgets = [
      ...this.data.widgets,
      {
        id,
        kind: 'custom',
        title: 'new widget',
        body: 'click [edit] and write something that belongs here.',
      },
    ];
    this.persistWidgets();
  }

  signGuestbook(author: string, body: string): void {
    const entry: GuestbookEntry = {
      id: `g-${Date.now()}`,
      author: author.trim() || 'anon',
      date: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      body: body.trim(),
    };
    this.data.guestbook = [entry, ...this.data.guestbook];
    this.persistGuestbook();
  }

  ping(action: ContactId): void {
    switch (action) {
      case 'friend':
        this.toast = 'friend request queued. they still use AIM.';
        break;
      case 'message':
        this.toast = 'message window opened in 2007. try email: hello@dasdev.net';
        break;
      case 'im':
        this.toast = 'das is idle. leave a guestbook instead.';
        break;
      case 'forward':
        this.toast = 'forwarded to the group chat that still says "lol myspace".';
        break;
      default: {
        const _never: never = action;
        void _never;
      }
    }
    if (!browser) return;
    window.setTimeout(() => {
      if (this.toast) this.toast = null;
    }, 3200);
  }

  private persistWidgets(): void {
    if (!browser) return;
    localStorage.setItem(WIDGET_KEY, JSON.stringify(this.data.widgets));
  }

  private persistGuestbook(): void {
    if (!browser) return;
    localStorage.setItem(GUESTBOOK_KEY, JSON.stringify(this.data.guestbook));
  }
}

export const profileState = new ProfileState();
