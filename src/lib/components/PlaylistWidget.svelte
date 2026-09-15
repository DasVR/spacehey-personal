<script lang="ts">
  import Barcode from './Barcode.svelte';
  import type { Track } from '$lib/data/types';
  import { assetUrl } from '$lib/utils/urls';

  interface Props {
    title: string;
    artist: string;
    art: string;
    tracks: Track[];
  }

  let { title, artist, art, tracks }: Props = $props();

  let selectedId = $state<string | null>(null);
  const activeId = $derived(
    selectedId ?? tracks.find((track) => track.playing)?.id ?? tracks[0]?.id,
  );
  const active = $derived(tracks.find((track) => track.id === activeId) ?? tracks[0]);

  function select(id: string): void {
    selectedId = id;
  }
</script>

<section class="player">
  <div class="head">
    <h2 class="section-title">Now Playing</h2>
    <Barcode kind="compact" />
  </div>
  <div class="body">
    <div class="art">
      <img src={assetUrl(art)} alt="{title} cover art" />
    </div>
    <div class="list">
      <p class="eyebrow">{artist}</p>
      <h3>{title}</h3>
      <ol>
        {#each tracks as track (track.id)}
          <li class:on={track.id === activeId}>
            <button type="button" onclick={() => select(track.id)}>
              <span class="playing-dot" class:live={track.id === activeId} aria-hidden="true"></span>
              <span class="name">{track.title}</span>
              <span class="who">{track.artist}</span>
              <span class="dur">{track.duration}</span>
            </button>
          </li>
        {/each}
      </ol>
      <p class="hint">
        {active.title} — audio hookup later (Spotify link above). The row is live; the speakers are not.
      </p>
    </div>
  </div>
</section>

<style>
  .player {
    position: relative;
    z-index: 6;
    background: var(--color-panel);
    border: 1px solid var(--color-line);
    padding: var(--s-5) var(--s-4);
  }

  .head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }

  .head .section-title {
    margin-bottom: 0;
  }

  .body {
    display: grid;
    grid-template-columns: 150px 1fr;
    gap: var(--s-5);
    align-items: start;
  }

  .art {
    transform: rotate(-1.5deg);
    box-shadow: 2px 3px 6px var(--color-shadow);
    transition: transform 220ms var(--ease-out);
  }

  .art:hover {
    transform: rotate(-0.5deg) scale(1.03);
  }

  .art img {
    width: 100%;
    aspect-ratio: 1;
    object-fit: cover;
    filter: contrast(var(--photo-contrast)) grayscale(var(--photo-gray)) sepia(var(--photo-sepia));
    border: 3px solid var(--color-void);
  }

  h3 {
    font-family: var(--font-display);
    letter-spacing: var(--track-display);
    text-transform: uppercase;
    margin: 2px 0 10px;
    color: var(--color-panel-ink);
    font-size: 15px;
  }

  ol {
    list-style: none;
    padding: 0;
    margin: 0 0 10px;
  }

  li {
    border-bottom: 1px solid var(--color-line);
  }

  button {
    width: 100%;
    display: grid;
    grid-template-columns: 12px 1fr auto auto;
    gap: var(--s-2);
    align-items: baseline;
    background: none;
    border: 0;
    padding: 5px 4px;
    text-align: left;
    color: var(--color-panel-ink-dim);
    border-radius: 2px;
    transition:
      color 200ms ease,
      background-color 150ms ease;
  }

  button:hover {
    background: var(--color-red-wash);
  }

  li.on button {
    color: var(--color-panel-ink);
  }

  .who {
    font-size: 10px;
    color: var(--color-panel-ink-dim);
  }

  .dur {
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--color-panel-ink-dim);
  }

  .playing-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--color-red);
    opacity: 0;
    align-self: center;
    transition: opacity 250ms ease;
  }

  .playing-dot.live {
    opacity: 1;
    animation: playing-pulse 1.8s ease-in-out infinite;
  }

  .hint {
    margin: 0;
    font-size: 11px;
    color: var(--color-panel-ink-dim);
  }

  @media (max-width: 640px) {
    .body { grid-template-columns: 1fr; }
    .art { width: 12rem; }
  }

  :global([data-theme='pro']) .art,
  :global([data-theme='pro']) .art:hover {
    transform: none;
    box-shadow: none;
  }

  :global([data-theme='pro']) .art img {
    border: 0;
  }
</style>
