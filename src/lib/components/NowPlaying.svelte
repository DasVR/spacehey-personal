<script lang="ts">
  import DitherImage from './DitherImage.svelte';
  import Icon from './Icon.svelte';
  import type { Image, Track } from '$lib/data/types';

  interface Props {
    title: string;
    artist: string;
    art: Image;
    tracks: Track[];
  }

  let { title, artist, art, tracks }: Props = $props();
  let current = $state(0);
  const active = $derived(tracks[current]);
</script>

<div class="player">
  <div class="art"><DitherImage src={art.src} alt={art.alt} cell={3} /></div>
  <div class="meta">
    <p class="kicker"><span class="bars" aria-hidden="true"><i></i><i></i><i></i></span> now playing</p>
    <p class="track">{active.title}</p>
    <p class="by">{active.artist} · from {title}, {artist}</p>
  </div>
</div>

<ol class="list">
  {#each tracks as track, i (track.id)}
    <li>
      <button type="button" class:on={i === current} aria-pressed={i === current} onclick={() => (current = i)}>
        <span class="n">
          <span class="num">{String(i + 1).padStart(2, '0')}</span>
          <span class="play"><Icon name="play" size={12} /></span>
        </span>
        <span class="t">{track.title}</span>
        <span class="a">{track.artist}</span>
        <span class="d">{track.duration}</span>
      </button>
    </li>
  {/each}
</ol>

<style>
  .player {
    display: grid;
    grid-template-columns: 88px 1fr;
    gap: var(--s-4);
    align-items: center;
  }

  .art {
    width: 88px;
    height: 88px;
    border-radius: 10px;
    overflow: hidden;
    outline: 1px solid var(--img-outline);
    outline-offset: -1px;
  }

  .kicker {
    display: flex;
    align-items: center;
    gap: var(--s-2);
    font-family: var(--font-mono);
    font-size: var(--t-micro);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--color-accent);
  }

  .bars {
    display: inline-flex;
    align-items: end;
    gap: 2px;
    height: 10px;
  }

  .bars i {
    width: 2px;
    height: 100%;
    background: currentColor;
    transform-origin: bottom;
    animation: eq 900ms ease-in-out infinite alternate;
  }

  .bars i:nth-child(2) {
    animation-delay: -300ms;
  }

  .bars i:nth-child(3) {
    animation-delay: -600ms;
  }

  .track {
    margin-top: 6px;
    font-size: var(--t-lead);
    font-weight: 600;
    color: var(--color-ink);
    text-wrap: balance;
  }

  .by {
    font-size: var(--t-small);
    color: var(--color-ink-dim);
  }

  .list {
    list-style: none;
    display: grid;
  }

  .list button {
    display: grid;
    grid-template-columns: 28px minmax(0, 1fr) auto;
    grid-template-areas: 'n t d' 'n a d';
    column-gap: var(--s-3);
    width: 100%;
    min-height: 52px;
    padding: 6px var(--s-2);
    border-radius: 10px;
    text-align: left;
    transition-property: background-color;
    transition-duration: 150ms;
  }

  .list button:hover {
    background: var(--color-hover);
  }

  .n {
    grid-area: n;
    display: grid;
    place-items: center;
    align-self: center;
  }

  .num,
  .play {
    grid-area: 1 / 1;
    transition-property: opacity, scale, filter;
    transition-duration: 200ms;
    transition-timing-function: cubic-bezier(0.2, 0, 0, 1);
  }

  .num {
    font-family: var(--font-mono);
    font-size: var(--t-micro);
    color: var(--color-ink-faint);
  }

  .play {
    color: var(--color-accent);
    opacity: 0;
    scale: 0.25;
    filter: blur(4px);
  }

  .on .num {
    opacity: 0;
    scale: 0.25;
    filter: blur(4px);
  }

  .on .play {
    opacity: 1;
    scale: 1;
    filter: blur(0);
  }

  .t {
    grid-area: t;
    font-size: var(--t-body);
    color: var(--color-ink);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .on .t {
    color: var(--color-accent);
  }

  .a {
    grid-area: a;
    font-size: var(--t-meta);
    color: var(--color-ink-dim);
  }

  .d {
    grid-area: d;
    align-self: center;
    font-family: var(--font-mono);
    font-size: var(--t-micro);
    color: var(--color-ink-faint);
    font-variant-numeric: tabular-nums;
  }

  @keyframes eq {
    from {
      transform: scaleY(0.3);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .bars i {
      animation: none;
    }
  }
</style>
