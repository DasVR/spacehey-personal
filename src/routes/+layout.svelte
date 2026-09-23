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

  onNavigate((navigation) => {
    if (!document.startViewTransition) return;
    const from = navigation.from ? modeFromPath(navigation.from.url.pathname, base) : mode;
    const to = navigation.to ? modeFromPath(navigation.to.url.pathname, base) : mode;
    if (from === to) return;
    return new Promise((resolve) => {
      document.startViewTransition(async () => {
        resolve();
        await navigation.complete;
      });
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
