<script lang="ts">
  import { onMount } from 'svelte';
  import Icon from './Icon.svelte';
  import type { Crate } from '$lib/data/types';

  interface Props {
    crate: Crate;
  }

  let { crate }: Props = $props();

  let rack: HTMLDivElement;
  let audio: HTMLAudioElement;
  let active = $state(0);
  let playing = $state(false);
  let progress = $state(0);
  let raf = 0;

  const record = $derived(crate.tracks[active]);
  const sleeve = (art: string, size: number) => art.replace(/\d+x\d+bb/, `${size}x${size}bb`);
  /** "White Pony (20th Anniversary Deluxe Edition)" → "White Pony". */
  const albumName = (album: string) => album.replace(/\s*[([][^)\]]*(edition|remaster|deluxe|anniversary|version)[^)\]]*[)\]]/gi, '').trim();

  /*
   * Crate digging: every sleeve leans away from the one you're looking at,
   * and the one in the middle stands up straight. Transforms are recomputed
   * from the scroll position each frame, so the flip follows your finger.
   */
  function layout(): void {
    raf = 0;
    if (!rack) return;
    const mid = rack.scrollLeft + rack.clientWidth / 2;
    let nearest = active;
    let best = Infinity;
    const items = rack.children as HTMLCollectionOf<HTMLElement>;
    for (let i = 0; i < items.length; i += 1) {
      const el = items[i];
      const center = el.offsetLeft + el.offsetWidth / 2;
      const d = (center - mid) / el.offsetWidth;
      const ad = Math.abs(d);
      const lean = Math.max(-1, Math.min(1, d));
      el.style.setProperty('--rot', `${lean * -58}deg`);
      el.style.setProperty('--z', `${-Math.min(ad, 1) * 140 - Math.max(ad - 1, 0) * 30}px`);
      el.style.setProperty('--shift', `${lean * -22}%`);
      el.style.setProperty('--dim', `${Math.min(ad, 2.5) * 0.22}`);
      el.style.zIndex = String(100 - Math.round(ad * 10));
      if (ad < best) {
        best = ad;
        nearest = i;
      }
    }
    if (nearest !== active) pick(nearest, false);
  }

  function schedule(): void {
    if (!raf) raf = requestAnimationFrame(layout);
  }

  function pick(i: number, scroll = true): void {
    const wasPlaying = playing;
    if (i !== active) {
      active = i;
      progress = 0;
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
      playing = false;
      // Keep the music going as you flip, like dropping the needle on the next one.
      if (wasPlaying) queueMicrotask(() => toggle());
    }
    if (scroll) {
      const el = rack.children[i] as HTMLElement | undefined;
      if (el) rack.scrollTo({ left: el.offsetLeft + el.offsetWidth / 2 - rack.clientWidth / 2, behavior: 'smooth' });
    }
  }

  function step(dir: 1 | -1): void {
    pick(Math.max(0, Math.min(crate.tracks.length - 1, active + dir)));
  }

  async function toggle(): Promise<void> {
    if (!audio || !record.preview) return;
    if (audio.src !== record.preview) audio.src = record.preview;
    if (audio.paused) {
      try {
        await audio.play();
        playing = true;
      } catch {
        playing = false;
      }
    } else {
      audio.pause();
      playing = false;
    }
  }

  function onKey(event: KeyboardEvent): void {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      step(1);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      step(-1);
    } else if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      void toggle();
    }
  }

  onMount(() => {
    layout();
    const ro = new ResizeObserver(schedule);
    ro.observe(rack);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf);
      audio?.pause();
    };
  });
</script>

<div class="crate">
  <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
  <div
    class="rack"
    bind:this={rack}
    onscroll={schedule}
    onkeydown={onKey}
    tabindex="0"
    role="listbox"
    aria-label="Records in {crate.title}. Use arrow keys to flip, space to play."
    aria-activedescendant="rec-{record.id}"
  >
    {#each crate.tracks as t, i (t.id)}
      <button
        type="button"
        id="rec-{t.id}"
        class="sleeve"
        class:on={i === active}
        role="option"
        aria-selected={i === active}
        tabindex="-1"
        onclick={() => (i === active ? toggle() : pick(i))}
      >
        <img src={sleeve(t.artwork, 600)} alt="{t.album} by {t.artist}" loading="eager" decoding="async" />
        <span class="shine" aria-hidden="true"></span>
      </button>
    {/each}
  </div>

  <div class="deck">
    <div class="player" class:playing>
      <!-- The record slides out of its sleeve and spins while the preview plays. -->
      <div class="disc" style="--p: {progress}">
        <span class="grooves"></span>
        <img class="label" src={sleeve(record.artwork, 300)} alt="" />
        <span class="spindle"></span>
      </div>
      <img class="cover" src={sleeve(record.artwork, 600)} alt="" />
    </div>

    <div class="info">
      <p class="kicker"><span class="bars" class:live={playing} aria-hidden="true"><i></i><i></i><i></i></span>{String(active + 1).padStart(2, '0')} / {String(crate.tracks.length).padStart(2, '0')}</p>
      <h3>{record.title}</h3>
      <p class="by">{record.artist}</p>
      <p class="meta">{albumName(record.album)} · {record.year} · {record.genre}</p>

      <div class="controls">
        <button type="button" class="nav press" onclick={() => step(-1)} disabled={active === 0} aria-label="Previous record">
          <Icon name="chevron-left" size={18} stroke={2} />
        </button>
        <button type="button" class="play press" onclick={toggle} aria-label={playing ? 'Pause preview' : 'Play preview'} disabled={!record.preview}>
          <svg class="ring" viewBox="0 0 44 44" aria-hidden="true">
            <circle cx="22" cy="22" r="20" pathLength="1" style="stroke-dashoffset: {1 - progress}" />
          </svg>
          <Icon name={playing ? 'pause' : 'play'} size={18} stroke={2} />
        </button>
        <button type="button" class="nav press" onclick={() => step(1)} disabled={active === crate.tracks.length - 1} aria-label="Next record">
          <Icon name="chevron-right" size={18} stroke={2} />
        </button>
        <a class="apple press" href={record.url} target="_blank" rel="noopener">
          <Icon name="music" size={16} stroke={2} />
          <span>Apple Music</span>
        </a>
      </div>
      <p class="hint">30-second preview · swipe the crate to dig</p>
    </div>
  </div>

  {#if crate.appleMusicUrl}
    <a class="playlist" href={crate.appleMusicUrl} target="_blank" rel="noopener">
      Open the whole playlist on Apple Music <Icon name="arrow" size={14} />
    </a>
  {/if}

  <audio
    bind:this={audio}
    preload="none"
    ontimeupdate={() => (progress = audio.duration ? audio.currentTime / audio.duration : 0)}
    onended={() => {
      playing = false;
      progress = 0;
      if (active < crate.tracks.length - 1) {
        playing = true;
        pick(active + 1);
      }
    }}
    onpause={() => (playing = false)}
    onplay={() => (playing = true)}
  ></audio>
</div>

<style>
  .crate {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: var(--s-4);
  }

  /* ---------- the crate ---------- */

  .rack {
    --size: clamp(132px, 42vw, 220px);
    display: flex;
    min-width: 0;
    align-items: center;
    height: calc(var(--size) + 48px);
    padding-inline: calc(50% - var(--size) / 2);
    overflow-x: auto;
    overflow-y: hidden;
    scroll-snap-type: x mandatory;
    scrollbar-width: none;
    perspective: 900px;
    perspective-origin: 50% 40%;
    outline: none;
    -webkit-mask-image: linear-gradient(to right, transparent, black 12%, black 88%, transparent);
    mask-image: linear-gradient(to right, transparent, black 12%, black 88%, transparent);
  }

  .rack::-webkit-scrollbar {
    display: none;
  }

  .rack:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 4px;
    border-radius: 12px;
  }

  .sleeve {
    --rot: 0deg;
    --z: 0px;
    --shift: 0%;
    --dim: 0;
    position: relative;
    flex: none;
    width: var(--size);
    aspect-ratio: 1;
    /* Records tuck behind each other like they would in a crate. */
    margin-inline: calc(var(--size) * -0.18);
    scroll-snap-align: center;
    border-radius: 4px;
    transform: translateX(var(--shift)) translateZ(var(--z)) rotateY(var(--rot));
    transform-style: preserve-3d;
    will-change: transform;
    box-shadow:
      0 0 0 1px oklch(1 0 0 / 0.06),
      0 18px 30px -12px oklch(0 0 0 / 0.8);
  }

  .sleeve img {
    display: block;
    width: 100%;
    height: 100%;
    border-radius: inherit;
    object-fit: cover;
    filter: brightness(calc(1 - var(--dim)));
  }

  /* A little sheen across the cardboard. */
  .shine {
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: linear-gradient(115deg, oklch(1 0 0 / 0.14), transparent 40%, transparent 70%, oklch(1 0 0 / 0.05));
    pointer-events: none;
  }

  .sleeve.on {
    box-shadow:
      0 0 0 1px oklch(1 0 0 / 0.12),
      0 28px 50px -14px oklch(0 0 0 / 0.9);
  }

  /* ---------- the deck ---------- */

  .deck {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: var(--s-4);
    align-items: center;
  }

  .player {
    position: relative;
    width: 152px;
    height: 104px;
  }

  .cover,
  .disc {
    position: absolute;
    top: 0;
    width: 104px;
    height: 104px;
  }

  .cover {
    left: 0;
    border-radius: 4px;
    object-fit: cover;
    box-shadow: 0 10px 24px -8px oklch(0 0 0 / 0.8);
  }

  .disc {
    left: 0;
    border-radius: 50%;
    background: radial-gradient(circle, oklch(0.18 0 0) 0 30%, oklch(0.1 0 0) 31% 100%);
    box-shadow: 0 6px 18px -6px oklch(0 0 0 / 0.8);
    transition-property: translate;
    transition-duration: 600ms;
    transition-timing-function: cubic-bezier(0.2, 0, 0, 1);
    translate: 18px 0;
    animation: spin 1.8s linear infinite paused;
  }

  .playing .disc {
    translate: 46px 0;
    animation-play-state: running;
  }

  .grooves {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background:
      conic-gradient(from 30deg, transparent 0 10%, oklch(1 0 0 / 0.1) 14%, transparent 20% 60%, oklch(1 0 0 / 0.08) 64%, transparent 70%),
      repeating-radial-gradient(circle, oklch(1 0 0 / 0.05) 0 1px, transparent 1px 3px);
  }

  .label {
    position: absolute;
    inset: 32%;
    width: 36%;
    height: 36%;
    border-radius: 50%;
    object-fit: cover;
  }

  .spindle {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 5px;
    height: 5px;
    translate: -50% -50%;
    border-radius: 50%;
    background: var(--color-bg);
  }

  .info {
    display: grid;
    gap: 2px;
    min-width: 0;
  }

  .kicker {
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: var(--font-mono);
    font-size: var(--t-micro);
    color: var(--color-ink-faint);
  }

  .bars {
    display: inline-flex;
    align-items: end;
    gap: 2px;
    height: 10px;
    color: var(--color-accent);
  }

  .bars i {
    width: 2px;
    height: 30%;
    background: currentColor;
    transition-property: height;
    transition-duration: 200ms;
  }

  .bars.live i {
    height: 100%;
    transform-origin: bottom;
    animation: eq 900ms ease-in-out infinite alternate;
  }

  .bars.live i:nth-child(2) {
    animation-delay: -300ms;
  }

  .bars.live i:nth-child(3) {
    animation-delay: -600ms;
  }

  h3 {
    margin-top: 4px;
    font-size: var(--t-title);
    font-weight: 600;
    line-height: 1.15;
    letter-spacing: -0.01em;
    text-wrap: balance;
  }

  .by {
    font-size: var(--t-body);
    color: var(--color-ink);
  }

  .meta {
    font-size: var(--t-small);
    color: var(--color-ink-dim);
  }

  .controls {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--s-2);
    margin-top: var(--s-3);
  }

  .nav,
  .play {
    display: grid;
    place-items: center;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    color: var(--color-ink);
    background: var(--color-raised);
    box-shadow: 0 0 0 1px var(--color-line);
    transition-property: background-color, scale, opacity;
    transition-duration: 150ms;
  }

  .nav:disabled {
    opacity: 0.35;
  }

  .play {
    position: relative;
    color: var(--color-on-accent);
    background: var(--color-accent);
    box-shadow: none;
  }

  .ring {
    position: absolute;
    inset: -4px;
    width: calc(100% + 8px);
    height: calc(100% + 8px);
    rotate: -90deg;
    fill: none;
    stroke: var(--color-accent);
    stroke-width: 2;
    stroke-dasharray: 1;
    stroke-linecap: round;
    transition: stroke-dashoffset 250ms linear;
  }

  .apple {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 44px;
    padding-inline: var(--s-4);
    border-radius: var(--r-pill);
    font-size: var(--t-small);
    font-weight: 600;
    color: var(--color-ink);
    background: var(--color-raised);
    box-shadow: 0 0 0 1px var(--color-line);
    text-decoration: none;
    transition-property: background-color, scale;
    transition-duration: 150ms;
  }

  .apple:hover,
  .nav:hover:not(:disabled) {
    background: color-mix(in oklch, var(--color-raised) 85%, var(--color-ink));
  }

  .hint {
    margin-top: 6px;
    font-family: var(--font-mono);
    font-size: var(--t-micro);
    color: var(--color-ink-faint);
  }

  .playlist {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    justify-self: start;
    font-size: var(--t-small);
    color: var(--color-ink-dim);
  }

  @media (max-width: 420px) {
    .deck {
      grid-template-columns: 1fr;
      justify-items: start;
    }
  }

  @keyframes spin {
    to {
      rotate: 1turn;
    }
  }

  @keyframes eq {
    from {
      transform: scaleY(0.3);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .disc,
    .bars.live i {
      animation: none;
    }
  }
</style>
