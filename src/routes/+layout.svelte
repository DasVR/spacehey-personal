<script lang="ts">
  import '$lib/styles/tokens.css';
  import '$lib/styles/motion.css';
  import '$lib/styles/app.css';
  import { browser } from '$app/environment';
  import ProfileNav from '$lib/components/ProfileNav.svelte';
  import { profile } from '$lib/data/profile';
  import { profileState } from '$lib/profile.svelte.ts';
  import { theme } from '$lib/theme.svelte.ts';
  import type { Snippet } from 'svelte';

  let { children }: { children: Snippet } = $props();

  $effect(() => {
    if (!browser) return;
    theme.hydrate();
    profileState.hydrate();
  });
</script>

<svelte:head>
  <title>{profile.displayName} · {profile.brand}</title>
</svelte:head>

<div class="page-shell">
  <div class="page-well">
    <ProfileNav brand={profile.brand} links={profile.nav} />
    {@render children()}
  </div>
  {#if profileState.toast}
    <p class="toast" role="status" aria-live="polite">{profileState.toast}</p>
  {/if}
</div>

<style>
  .toast {
    position: fixed;
    right: var(--s-4);
    bottom: var(--s-4);
    z-index: var(--z-nav);
    max-width: 22rem;
    background: var(--color-panel);
    color: var(--color-ink);
    border: 1px solid var(--color-accent-bright);
    padding: var(--s-3);
    box-shadow: 2px 3px 6px var(--color-shadow);
  }
</style>
