<script lang="ts">
  import '$lib/styles/tokens.css';
  import '$lib/styles/motion.css';
  import '$lib/styles/app.css';
  import { browser } from '$app/environment';
  import GrainLayer from '$lib/components/GrainLayer.svelte';
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
  <div class="atmosphere" aria-hidden="true">
    <div class="stars"></div>
    <GrainLayer />
  </div>
  <div class="page-well">
    <ProfileNav brand={profile.brand} links={profile.nav} />
    {@render children()}
  </div>
  {#if profileState.toast}
    <p class="toast" role="status" aria-live="polite">{profileState.toast}</p>
  {/if}
</div>

<style>
  .atmosphere {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 0;
  }

  .stars {
    position: absolute;
    inset: 0;
    opacity: var(--stars-opacity);
    background-image:
      radial-gradient(1px 1px at 20px 30px, var(--color-star-a) 50%, transparent 51%),
      radial-gradient(1px 1px at 90px 60px, var(--color-star-b) 50%, transparent 51%),
      radial-gradient(1.5px 1.5px at 150px 20px, var(--color-star-c) 50%, transparent 51%),
      radial-gradient(1px 1px at 60px 110px, var(--color-star-d) 50%, transparent 51%);
    background-size: 340px 200px;
  }

  .toast {
    position: fixed;
    right: var(--s-4);
    bottom: var(--s-4);
    z-index: var(--z-nav);
    max-width: 22rem;
    background: var(--color-void);
    color: var(--color-ink);
    border: 1px solid var(--color-red);
    padding: var(--s-3);
    box-shadow: 2px 3px 6px var(--color-shadow);
  }
</style>
