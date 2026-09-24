<script lang="ts">
  import '$lib/styles/tokens.css';
  import '$lib/styles/app.css';
  import { onMount, type Snippet } from 'svelte';
  import { onNavigate } from '$app/navigation';
  import { base } from '$app/paths';
  import { page } from '$app/state';
  import DitherField from '$lib/components/DitherField.svelte';
  import Toast from '$lib/components/Toast.svelte';
  import TopBar from '$lib/components/TopBar.svelte';
  import { app } from '$lib/app.svelte.ts';
  import { identity } from '$lib/data/profile';
  import { THEME_COLOR, applyMode, modeFromPath } from '$lib/theme';

  let { children }: { children: Snippet } = $props();

  const mode = $derived(modeFromPath(page.url.pathname, base));

  onMount(() => app.hydrate());

  $effect(() => applyMode(mode));

  /** Rough left-to-right order of the pages, so transitions know which way to slide. */
  const ORDER = ['/', '/links', '/pro', '/tags', '/roll'];
  function rank(pathname: string): number {
    const path = pathname.slice(base.length).replace(/\/$/, '') || '/';
    const i = ORDER.findIndex((p) => p !== '/' && path.startsWith(p));
    return i === -1 ? 0 : i;
  }

  onNavigate((navigation) => {
    if (!document.startViewTransition || !navigation.from || !navigation.to) return;
    if (navigation.from.url.pathname === navigation.to.url.pathname) return;
    const dir = rank(navigation.to.url.pathname) >= rank(navigation.from.url.pathname) ? 'forward' : 'back';
    document.documentElement.dataset.nav = dir;
    return new Promise((resolve) => {
      const vt = document.startViewTransition(async () => {
        resolve();
        await navigation.complete;
      });
      vt.finished.finally(() => delete document.documentElement.dataset.nav);
    });
  });
</script>

<svelte:head>
  <meta name="theme-color" content={THEME_COLOR[mode]} />
</svelte:head>

<DitherField />

<div class="shell">
  <TopBar {mode} host={identity.host} />
  {@render children()}
</div>

<Toast />

<style>
  .shell {
    position: relative;
    z-index: var(--z-page);
    width: 100%;
    max-width: calc(var(--page-max) + 2 * var(--gutter));
    margin-inline: auto;
    padding-inline: max(var(--gutter), env(safe-area-inset-left)) max(var(--gutter), env(safe-area-inset-right));
    padding-top: env(safe-area-inset-top);
  }
</style>
