<script lang="ts">
  import { page } from '$app/state';
  import type { NavLink } from '$lib/data/types';
  import { theme } from '$lib/theme.svelte.ts';

  interface Props {
    brand: string;
    links: NavLink[];
  }

  let { brand, links }: Props = $props();
</script>

<header class="nav">
  <a class="brand" href="/">{brand} <span class="slash">/ p</span></a>
  <nav aria-label="Profile">
    {#each links as link (link.href)}
      <a
        href={link.href}
        aria-current={page.url.pathname === link.href ? 'page' : undefined}
      >
        {link.label}
      </a>
    {/each}
  </nav>
  <div class="mode" role="group" aria-label="Profile mode">
    <button
      type="button"
      class:on={theme.mode === 'casual'}
      aria-pressed={theme.mode === 'casual'}
      onclick={() => theme.set('casual')}
    >
      casual
    </button>
    <span class="sep" aria-hidden="true">/</span>
    <button
      type="button"
      class:on={theme.mode === 'pro'}
      aria-pressed={theme.mode === 'pro'}
      onclick={() => theme.set('pro')}
    >
      pro
    </button>
  </div>
</header>

<style>
  .nav {
    position: sticky;
    top: 0;
    z-index: var(--z-nav);
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    gap: var(--s-3);
    padding: var(--s-3) 0 var(--s-4);
    background: color-mix(in srgb, var(--color-bg) 88%, transparent);
    backdrop-filter: blur(6px);
  }

  .brand {
    font-family: var(--font-display);
    font-size: var(--t-lead);
    letter-spacing: var(--track-display);
    text-transform: uppercase;
    color: var(--color-ink);
    text-decoration: none;
  }

  .slash {
    color: var(--color-ink-dim);
    font-family: var(--font-body);
    font-size: var(--t-meta);
    letter-spacing: 0;
    text-transform: none;
  }

  nav {
    display: flex;
    gap: var(--s-3);
    justify-content: center;
    font-size: var(--t-meta);
  }

  nav a {
    color: var(--color-ink-dim);
    text-decoration: none;
  }

  nav a:hover,
  nav a[aria-current='page'] {
    color: var(--color-ink);
  }

  .mode {
    justify-self: end;
    display: flex;
    align-items: center;
    gap: var(--s-1);
    font-size: var(--t-meta);
  }

  .mode button {
    background: none;
    border: 0;
    padding: 0.15rem 0.2rem;
    color: var(--color-ink-dim);
  }

  .mode button.on {
    color: var(--color-ink);
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  .sep {
    color: var(--color-ink-dim);
  }

  @media (max-width: 640px) {
    .nav {
      grid-template-columns: 1fr auto;
      grid-template-areas:
        'brand mode'
        'links links';
    }
    .brand { grid-area: brand; }
    nav { grid-area: links; justify-content: start; }
    .mode { grid-area: mode; }
  }
</style>
