<script lang="ts">
  import { profileState } from '$lib/profile.svelte.ts';
  import type { Tag } from '$lib/data/types';
  import { assetUrl } from '$lib/utils/urls';

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

<section class="header">
  <div class="polaroid">
    <img src={assetUrl(src)} {alt} />
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
    display: grid;
    gap: 14px;
    padding: var(--s-5) var(--s-4);
    background: var(--color-panel);
    border: 1px solid var(--color-line);
  }

  .polaroid {
    justify-self: center;
    width: min(100%, 11.25rem);
    padding: 0.5rem 0.5rem 1.4rem;
    background: var(--color-paper);
    transform: rotate(-2.4deg);
    box-shadow: 2px 3px 6px var(--color-shadow);
    transition:
      transform 220ms var(--ease-out),
      box-shadow 220ms ease;
  }

  .polaroid:hover {
    transform: rotate(-1deg) scale(1.03);
    box-shadow: 3px 5px 10px var(--color-shadow);
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
    font-size: 20px;
    letter-spacing: var(--track-display);
    text-transform: uppercase;
    color: var(--color-panel-ink);
    margin: 0 0 6px;
  }

  .mood {
    color: var(--color-red);
    font-style: italic;
    margin: 0 0 6px;
    font-size: 13px;
  }

  .dim {
    color: var(--color-panel-ink-dim);
    font-size: var(--t-meta);
  }

  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    list-style: none;
    padding: 0;
    margin: 10px 0 0;
  }

  .tags li {
    border: 1px solid var(--color-panel-ink);
    color: var(--color-panel-ink);
    padding: 2px 9px;
    font-size: 10px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    border-radius: 999px;
  }

  .mood-edit {
    display: grid;
    gap: var(--s-1);
  }

  .mood-edit input {
    background: var(--color-void);
    color: var(--color-ink);
    border: 1px solid var(--color-line-dark);
    padding: var(--s-2);
  }

  :global([data-theme='pro']) .polaroid,
  :global([data-theme='pro']) .polaroid:hover {
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
