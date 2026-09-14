export type ThemeMode = 'casual' | 'pro';

const STORAGE_KEY = 'profile-theme';

function isThemeMode(value: string | null): value is ThemeMode {
  return value === 'casual' || value === 'pro';
}

function readStored(): ThemeMode {
  if (typeof localStorage === 'undefined') return 'casual';
  const value = localStorage.getItem(STORAGE_KEY);
  return isThemeMode(value) ? value : 'casual';
}

function applyTheme(mode: ThemeMode): void {
  if (typeof document === 'undefined') return;
  document.documentElement.dataset.theme = mode;
  document.documentElement.style.colorScheme = mode === 'pro' ? 'light' : 'dark';
}

class ThemeController {
  mode = $state<ThemeMode>('casual');

  hydrate(): void {
    this.mode = readStored();
    applyTheme(this.mode);
  }

  set(next: ThemeMode): void {
    this.mode = next;
    applyTheme(next);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, next);
    }
  }

  toggle(): void {
    this.set(this.mode === 'casual' ? 'pro' : 'casual');
  }

  label(mode: ThemeMode = this.mode): string {
    switch (mode) {
      case 'casual':
        return 'casual';
      case 'pro':
        return 'pro';
      default: {
        const _never: never = mode;
        return _never;
      }
    }
  }
}

export const theme = new ThemeController();
