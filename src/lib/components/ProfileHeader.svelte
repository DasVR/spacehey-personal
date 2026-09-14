<script lang="ts">
  import GrainLayer from './GrainLayer.svelte';
  import { profileState } from '$lib/profile.svelte.ts';
  import type { Tag } from '$lib/data/types';

  interface Props {
    src: string;
    alt: string;
    mood: string;
    lastLogin: string;
    location: string;
    username: string;
    tags: Tag[];
  }

  let { src, alt, mood, lastLogin, location, username, tags }: Props = $props();
</script>

<section class="header torn-edge">
  <GrainLayer />
  <div class="polaroid">
    <img {src} {alt} />
  </div>
  <div class="meta">
    <p class="handle">:{username}:</p>
    {#if profileState.editing}
      <label class="mood-edit">
        <span class="eyebrow">mood</span>
        <input
          value={mood}
          oninput={(e) => profileState.setMood(e.currentTarget.value)}
        />
      </label>
    {:else}
      <p class="mood">{mood}</p>
    {/if}
    <p class="dim">{location}</p>
    <p class="dim">last login: {lastLogin}</p>
    <ul class="tags">
      {#each tags as tag (tag.label)}
        <li>{tag.label}</li>
      {/each}
    </ul>
  </div>
</section>

<style>
  .header {
    position: relative;
    display: grid;
    gap: var(--s-4);
    padding: var(--s-5) var(--s-4);
    background: var(--color-panel);
    border: 1px solid var(--color-line);
  }

  .polaroid {
    justify-self: center;
    width: min(100%, 13rem);
    padding: 0.45rem 0.45rem 1.4rem;
    background: var(--color-paper);
    transform: rotate(-2.4deg);
    box-shadow: 2px 3px 6px var(--color-shadow);
  }

  .polaroid img {
    width: 100%;
    aspect-ratio: 4 / 5;
    object-fit: cover;
    filter: contrast(var(--photo-contrast)) grayscale(var(--photo-gray)) sepia(var(--photo-sepia));
    border: 3px solid var(--color-void);
  }

  .handle {
    font-family: var(--font-display);
    font-size: var(--t-head);
    letter-spacing: var(--track-display);
    text-transform: uppercase;
  }

  .mood {
    color: var(--color-accent-bright);
    font-style: italic;
  }

  .dim {
    color: var(--color-ink-dim);
    font-size: var(--t-meta);
  }

  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: var(--s-2);
    list-style: none;
    padding: 0;
    margin: var(--s-3) 0 0;
  }

  .tags li {
    border: 1px solid var(--color-accent);
    color: var(--color-ink);
    padding: 0.1rem 0.45rem;
    font-size: var(--t-micro);
    letter-spacing: var(--track-tick);
    text-transform: uppercase;
    border-radius: 999px;
  }

  .mood-edit {
    display: grid;
    gap: var(--s-1);
  }

  .mood-edit input {
    background: var(--color-bg);
    border: 1px solid var(--color-line-hot);
    padding: var(--s-2);
  }

  :global([data-theme='pro']) .polaroid {
    transform: none;
    transform: none;
    background: var(--color-panel);
    padding: 0;
    box-shadow: none;
  }

  :global([data-theme='pro']) .polaroid img {
    border-width: 0;
  }

  :global([data-theme='pro']) .mood {
    font-style: normal;
  }
</style>
