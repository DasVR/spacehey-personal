<script lang="ts">
  import { onMount } from 'svelte';
  import DitherImage from './DitherImage.svelte';
  import Icon from './Icon.svelte';
  import Lightbox from './Lightbox.svelte';
  import { dev } from '$app/environment';
  import { formatRollDate, type RollPhoto } from '$lib/roll';
  import { pageHref } from '$lib/utils/urls';

  interface Props {
    photos: RollPhoto[];
  }

  let { photos }: Props = $props();

  let open = $state<number | null>(null);
  /** The "add" tile only shows for the owner (set by visiting /roll/add). */
  let owner = $state(dev);

  onMount(() => {
    try {
      owner ||= localStorage.getItem('roll-owner') === '1';
    } catch {
      /* storage blocked: stay a visitor */
    }
  });
</script>

<div class="roll" role="list">
  {#each photos as photo, i (photo.file)}
    <figure role="listitem">
      <button type="button" class="frame press" onclick={() => (open = i)} aria-label="Open {photo.caption}">
        <DitherImage
          src={photo.src}
          alt={photo.caption}
          cell={photo.look.grain ?? 3}
          levels={photo.look.tones ?? 3}
          palette={photo.look.palette ?? 'theme'}
          focus={photo.look.focus}
          developed={photo.look.dither === false ? true : undefined}
        />
        <span class="zoom" aria-hidden="true"><Icon name="plus" size={14} stroke={2} /></span>
      </button>
      <figcaption>
        <span class="num">{String(i + 1).padStart(2, '0')}</span>
        <span class="cap">{photo.caption}</span>
        {#if photo.date}<span class="date">{formatRollDate(photo.date)}</span>{/if}
      </figcaption>
    </figure>
  {/each}

  {#if owner}
    <div class="add-slot" role="listitem">
      <a class="add press" href={pageHref('/roll/add')}>
        <Icon name="upload" size={22} />
        <span>Add to the roll</span>
      </a>
    </div>
  {/if}
</div>

<Lightbox {photos} index={open} onclose={() => (open = null)} onnavigate={(i) => (open = i)} />

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
    align-content: start;
  }

  .frame {
    position: relative;
    display: block;
    width: 100%;
    aspect-ratio: 4 / 5;
    border-radius: 14px;
    overflow: hidden;
    outline: 1px solid var(--img-outline);
    outline-offset: -1px;
    transition-property: scale;
    transition-duration: 150ms;
  }

  .zoom {
    position: absolute;
    right: 8px;
    bottom: 8px;
    display: grid;
    place-items: center;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    color: var(--dither-light);
    background: oklch(0 0 0 / 0.5);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
    opacity: 0;
    transition-property: opacity;
    transition-duration: 200ms;
  }

  .frame:hover .zoom,
  .frame:focus-visible .zoom {
    opacity: 1;
  }

  @media (hover: none) {
    .zoom {
      opacity: 1;
    }
  }

  figcaption {
    display: grid;
    grid-template-columns: auto 1fr;
    column-gap: var(--s-2);
    font-size: var(--t-meta);
    line-height: 1.4;
    color: var(--color-ink-dim);
  }

  .num {
    grid-row: span 2;
    font-family: var(--font-mono);
    color: var(--color-ink-faint);
  }

  .date {
    font-family: var(--font-mono);
    font-size: var(--t-micro);
    color: var(--color-ink-faint);
  }

  .add-slot {
    scroll-snap-align: start;
  }

  .add {
    display: grid;
    place-content: center;
    justify-items: center;
    gap: var(--s-2);
    aspect-ratio: 4 / 5;
    border-radius: 14px;
    font-size: var(--t-small);
    font-weight: 500;
    color: var(--color-ink-dim);
    text-decoration: none;
    border: 1.5px dashed var(--color-line-strong);
    transition-property: color, border-color, background-color, scale;
    transition-duration: 150ms;
  }

  .add:hover {
    color: var(--color-ink);
    border-color: var(--color-accent);
    background: var(--color-hover);
  }

  @media (min-width: 960px) {
    .roll {
      margin-inline: 0;
      padding-inline: 0;
      grid-auto-columns: calc((100% - 2 * var(--s-3)) / 3);
    }
  }
</style>
