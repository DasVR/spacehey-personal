<script lang="ts">
  import DitherImage from './DitherImage.svelte';
  import Icon from './Icon.svelte';
  import { formatRollDate, type RollPhoto } from '$lib/roll';
  import { PALETTES } from '$lib/roll-name';

  interface Props {
    photos: RollPhoto[];
    index: number | null;
    onclose: () => void;
    onnavigate: (i: number) => void;
  }

  let { photos, index, onclose, onnavigate }: Props = $props();

  let dialog: HTMLDialogElement;
  let view = $state<'dither' | 'photo'>('dither');
  let cell = $state(3);
  let tones = $state<2 | 3>(3);
  let palette = $state<string | [string, string, string]>('theme');
  let startX = 0;

  const photo = $derived(index === null ? null : photos[index]);
  const custom = $derived(Array.isArray(photo?.look.palette) ? photo.look.palette : null);

  // Each photo opens with its own look (from its sidecar); the controls are yours to play with after.
  $effect(() => {
    const look = photo?.look;
    if (!look) return;
    view = look.dither === false ? 'photo' : 'dither';
    cell = look.grain ?? 3;
    tones = look.tones ?? 3;
    palette = look.palette ?? 'theme';
  });

  $effect(() => {
    if (!dialog) return;
    if (index !== null && !dialog.open) {
      dialog.showModal();
      // Focus the viewer itself, not the close button (iOS draws a ring on it).
      dialog.focus();
      // Freeze the page underneath so it can't scroll behind the viewer.
      document.documentElement.classList.add('locked');
    }
    if (index === null && dialog.open) dialog.close();
  });

  function go(dir: 1 | -1): void {
    if (index === null) return;
    onnavigate((index + dir + photos.length) % photos.length);
  }

  function onKey(event: KeyboardEvent): void {
    if (event.key === 'ArrowRight') go(1);
    else if (event.key === 'ArrowLeft') go(-1);
    else if (event.key === 'd') view = view === 'dither' ? 'photo' : 'dither';
  }
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<dialog
  bind:this={dialog}
  class="lightbox"
  aria-label={photo?.caption ?? 'Photo'}
  tabindex="-1"
  onclose={() => {
    document.documentElement.classList.remove('locked');
    onclose();
  }}
  onkeydown={onKey}
>
  {#if photo}
    <div class="top">
      <div class="title">
        <strong>{photo.caption}</strong>
        {#if photo.date}<span>{formatRollDate(photo.date)}</span>{/if}
        {#if photo.look.note}<em>{photo.look.note}</em>{/if}
      </div>
      <button type="button" class="round press" onclick={onclose} aria-label="Close">
        <Icon name="close" size={18} />
      </button>
    </div>

    <!-- Swipe left/right on the photo to move through the roll. -->
    <div
      class="stage"
      role="presentation"
      onpointerdown={(e) => (startX = e.clientX)}
      onpointerup={(e) => {
        const dx = e.clientX - startX;
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
      }}
    >
      {#key photo.file}
        <div class="shot">
          <DitherImage src={photo.src} alt={photo.caption} {cell} levels={tones} {palette} fit="contain" develop={false} developed={view === 'photo'} eager />
        </div>
      {/key}
      <button type="button" class="round side prev press" onclick={() => go(-1)} aria-label="Previous photo">
        <Icon name="chevron-left" size={20} stroke={2} />
      </button>
      <button type="button" class="round side next press" onclick={() => go(1)} aria-label="Next photo">
        <Icon name="chevron-right" size={20} stroke={2} />
      </button>
    </div>

    <div class="tools">
      <div class="seg" role="radiogroup" aria-label="View">
        <button type="button" role="radio" aria-checked={view === 'dither'} class:on={view === 'dither'} onclick={() => (view = 'dither')}>
          <Icon name="sparkle" size={15} /> Dither
        </button>
        <button type="button" role="radio" aria-checked={view === 'photo'} class:on={view === 'photo'} onclick={() => (view = 'photo')}>
          <Icon name="image" size={15} /> Photo
        </button>
      </div>
      <label class="slider" class:off={view === 'photo'}>
        <span>Grain</span>
        <input type="range" min="1" max="8" step="1" bind:value={cell} disabled={view === 'photo'} />
        <output>{cell}px</output>
      </label>
      <div class="seg small" role="radiogroup" aria-label="Tones" class:off={view === 'photo'}>
        <button type="button" role="radio" aria-checked={tones === 2} class:on={tones === 2} onclick={() => (tones = 2)} disabled={view === 'photo'}>1-bit</button>
        <button type="button" role="radio" aria-checked={tones === 3} class:on={tones === 3} onclick={() => (tones = 3)} disabled={view === 'photo'}>3-tone</button>
      </div>
      <div class="swatches" role="radiogroup" aria-label="Palette" class:off={view === 'photo'}>
        {#each PALETTES as p (p)}
          <button
            type="button"
            role="radio"
            aria-checked={palette === p}
            aria-label={p}
            class="sw"
            class:on={palette === p}
            style="--a: var(--{p === 'theme' ? 'dither' : `pal-${p}`}-dark); --b: var(--{p === 'theme' ? 'dither' : `pal-${p}`}-mid); --c: var(--{p === 'theme' ? 'dither' : `pal-${p}`}-light)"
            disabled={view === 'photo'}
            onclick={() => (palette = p)}
          ></button>
        {/each}
        {#if custom}
          <button
            type="button"
            role="radio"
            aria-checked={palette === custom}
            aria-label="This photo's own palette"
            class="sw"
            class:on={palette === custom}
            style="--a: {custom[0]}; --b: {custom[1]}; --c: {custom[2]}"
            disabled={view === 'photo'}
            onclick={() => (palette = custom)}
          ></button>
        {/if}
      </div>
      <span class="count">{(index ?? 0) + 1} / {photos.length}</span>
    </div>
  {/if}
</dialog>

<style>
  .lightbox {
    width: 100vw;
    height: 100dvh;
    max-width: none;
    max-height: none;
    margin: 0;
    /* Clear of the status bar, where iOS blurs whatever sits underneath. */
    padding: calc(env(safe-area-inset-top) + 28px) 12px max(12px, env(safe-area-inset-bottom));
    outline: none;
    overscroll-behavior: contain;
    border: 0;
    color: var(--dither-light);
    background: oklch(0.06 0 0);
  }

  .lightbox[open] {
    display: grid;
    grid-template-rows: auto 1fr auto;
    gap: 12px;
    animation: fade 250ms var(--ease-out);
  }

  .lightbox::backdrop {
    background: oklch(0 0 0 / 0.6);
  }

  .top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--s-4);
    padding-inline: 4px;
  }

  .title {
    display: grid;
    min-width: 0;
  }

  .title strong {
    font-size: var(--t-lead);
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .title span {
    font-family: var(--font-mono);
    font-size: var(--t-micro);
    opacity: 0.6;
  }

  .round {
    display: grid;
    place-items: center;
    flex: none;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    color: inherit;
    background: oklch(1 0 0 / 0.1);
    transition-property: background-color, scale;
    transition-duration: 150ms;
  }

  .round:hover {
    background: oklch(1 0 0 / 0.18);
  }

  .stage {
    position: relative;
    min-height: 0;
    touch-action: pan-y;
  }

  .shot {
    position: absolute;
    inset: 0;
    animation: shot-in 360ms cubic-bezier(0.2, 0, 0, 1);
  }

  .side {
    position: absolute;
    top: 50%;
    translate: 0 -50%;
  }

  .prev {
    left: 4px;
  }

  .next {
    right: 4px;
  }

  @media (hover: none) {
    .side {
      display: none;
    }
  }

  .tools {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 10px 16px;
    font-size: var(--t-small);
  }

  .seg {
    display: flex;
    padding: 3px;
    border-radius: 12px;
    background: oklch(1 0 0 / 0.08);
  }

  .seg button {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-height: 36px;
    padding-inline: 12px;
    border-radius: 9px;
    color: oklch(1 0 0 / 0.6);
    transition-property: background-color, color;
    transition-duration: 200ms;
  }

  .seg button.on {
    color: var(--dither-dark);
    background: var(--dither-light);
  }

  .slider {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .slider input {
    width: 120px;
    accent-color: var(--color-accent);
  }

  .slider output {
    min-width: 3ch;
    font-family: var(--font-mono);
    font-size: var(--t-micro);
    opacity: 0.7;
  }

  .title em {
    font-size: var(--t-small);
    font-style: normal;
    opacity: 0.75;
  }

  .swatches {
    display: flex;
    gap: 6px;
  }

  .sw {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: conic-gradient(var(--a) 0 33%, var(--b) 0 66%, var(--c) 0);
    box-shadow: 0 0 0 1px oklch(1 0 0 / 0.2);
    transition-property: scale, box-shadow;
    transition-duration: 200ms;
    transition-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .sw.on {
    scale: 1.15;
    box-shadow: 0 0 0 2px var(--dither-light);
  }

  .off {
    opacity: 0.35;
  }

  .count {
    font-family: var(--font-mono);
    font-size: var(--t-micro);
    opacity: 0.6;
  }

  @keyframes fade {
    from {
      opacity: 0;
    }
  }

  @keyframes shot-in {
    from {
      opacity: 0;
      scale: 0.97;
      filter: blur(6px);
    }
  }
</style>
