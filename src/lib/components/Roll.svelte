<script lang="ts">
  import DitherImage from './DitherImage.svelte';
  import type { Image } from '$lib/data/types';

  interface Props {
    photos: Image[];
  }

  let { photos }: Props = $props();
</script>

<div class="roll" role="list">
  {#each photos as photo, i (photo.src)}
    <figure role="listitem">
      <div class="frame"><DitherImage src={photo.src} alt={photo.alt} cell={3} /></div>
      <figcaption><span>{String(i + 1).padStart(2, '0')}</span>{photo.alt}</figcaption>
    </figure>
  {/each}
</div>

<style>
  .roll {
    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: min(62%, 15rem);
    gap: var(--s-3);
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    overscroll-behavior-x: contain;
    scrollbar-width: none;
    /* Bleed to the viewport edge on phones, keep the gutter as scroll padding. */
    margin-inline: calc(-1 * var(--gutter));
    padding-inline: var(--gutter);
    scroll-padding-inline: var(--gutter);
  }

  .roll::-webkit-scrollbar {
    display: none;
  }

  figure {
    scroll-snap-align: start;
    display: grid;
    gap: var(--s-2);
  }

  .frame {
    aspect-ratio: 4 / 5;
    border-radius: 14px;
    overflow: hidden;
    outline: 1px solid var(--img-outline);
    outline-offset: -1px;
  }

  figcaption {
    display: flex;
    gap: var(--s-2);
    font-size: var(--t-meta);
    color: var(--color-ink-dim);
    line-height: 1.4;
  }

  figcaption span {
    font-family: var(--font-mono);
    color: var(--color-ink-faint);
  }

  @media (min-width: 960px) {
    .roll {
      margin-inline: 0;
      padding-inline: 0;
      grid-auto-columns: calc((100% - 2 * var(--s-3)) / 3);
    }
  }
</style>
