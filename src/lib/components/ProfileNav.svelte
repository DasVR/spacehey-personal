<script lang="ts">
  import { page } from '$app/state';
  import type { NavLink } from '$lib/data/types';
  import { theme } from '$lib/theme.svelte.ts';
  import { pageHref } from '$lib/utils/urls';

  interface Props {
    brand: string;
    links: NavLink[];
  }

  let { brand, links }: Props = $props();
</script>

<header class="nav">
  <a class="brand" href={pageHref('/')}>{brand} <span class="slash">/ p</span></a>
  <nav aria-label="Profile">
    {#each links as link (link.href)}
      <a
        href={pageHref(link.href)}
        aria-current={page.route.id === link.href ? 'page' : undefined}
      >
        {link.label}
      </a>
    {/each}
  </nav>
  <div class="mode" role="group" aria-label="Profile mode">
    <span class="indicator" class:pro={theme.mode === 'pro'}></span>
    <button
      type="button"
      class:on={theme.mode === 'casual'}
      aria-pressed={theme.mode === 'casual'}
      onclick={() => theme.set('casual')}
    >
      casual
    </button>
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
    display: flex;
    align-items: center;
    gap: var(--s-4);
    padding: 14px 0;
    flex-wrap: wrap;
    border-bottom: 1px solid var(--color-line-dark);
  }

  .brand {
    font-family: var(--font-display);
    font-size: 15px;
    letter-spacing: 0.04em;
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
    gap: 14px;
    margin-right: auto;
    font-size: var(--t-meta);
  }

  nav a {
    color: var(--color-red);
    text-decoration: none;
  }

  nav a:hover,
  nav a[aria-current='page'] {
    color: var(--color-ink);
  }

  .mode {
    position: relative;
    display: flex;
    align-items: center;
    background: var(--color-void);
    border: 1px solid var(--color-line-dark);
    border-radius: 999px;
    padding: 2px;
    font-size: 10px;
  }

  .indicator {
    position: absolute;
    top: 2px;
    bottom: 2px;
    left: 2px;
    width: calc(50% - 2px);
    background: var(--color-red);
    border-radius: 999px;
    z-index: 0;
    transition: left 280ms var(--ease-out);
  }

  .indicator.pro {
    left: 50%;
  }

  @media (prefers-reduced-motion: reduce) {
    .indicator {
      transition: none;
    }
  }

  .mode button {
    position: relative;
    z-index: 1;
    background: none;
    border: 0;
    padding: 4px 10px;
    border-radius: 999px;
    color: var(--color-ink-dim);
    font: inherit;
    transition: color 200ms ease;
  }

  .mode button.on {
    color: var(--color-on-red);
  }
</style>
