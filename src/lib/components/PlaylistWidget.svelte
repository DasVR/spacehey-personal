<script lang="ts">
  import GrainLayer from './GrainLayer.svelte';
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

<section class="player torn-edge">
  <GrainLayer />
  <h2 class="section-title">Now Playing</h2>
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
        {active.title} — audio hookup later (Spotify / Apple Music / a real file). The row is live; the speakers are not.
      </p>
    </div>
  </div>
</section>

<style>
  .player {
    position: relative;
    z-index: 6;
    overflow: hidden;
    background: var(--color-panel);
    border: 1px solid var(--color-line);
    padding: var(--s-5) var(--s-4);
  }

  .body {
    display: grid;
    grid-template-columns: 10.5rem 1fr;
    gap: var(--s-5);
    align-items: start;
  }

  .art img {
    width: 100%;
    aspect-ratio: 1;
    object-fit: cover;
    filter: contrast(var(--photo-contrast)) grayscale(var(--photo-gray)) sepia(var(--photo-sepia));
    border: 3px solid var(--color-void);
    box-shadow: 2px 3px 6px var(--color-shadow);
    transform: rotate(-1.5deg);
  }

  h3 {
    font-family: var(--font-display);
    letter-spacing: var(--track-display);
    text-transform: uppercase;
    margin: 0.15rem 0 var(--s-3);
  }

  ol {
    list-style: none;
    padding: 0;
    margin: 0 0 var(--s-3);
  }

  button {
    width: 100%;
    display: grid;
    grid-template-columns: 0.7rem 1fr auto auto;
    gap: var(--s-2);
    align-items: baseline;
    background: none;
    border: 0;
    padding: 0.28rem 0;
    text-align: left;
    color: var(--color-ink-dim);
    border-bottom: 1px solid var(--color-line);
  }

  li.on button {
    color: var(--color-ink);
  }

  .who {
    font-size: var(--t-micro);
    color: var(--color-ink-dim);
  }

  .dur {
    font-family: var(--font-mono);
    font-size: var(--t-micro);
  }

  .playing-dot {
    width: 0.45rem;
    height: 0.45rem;
    border-radius: 50%;
    background: var(--color-accent-bright);
    opacity: 0;
    align-self: center;
  }

  .playing-dot.live {
    opacity: 1;
    animation: playing-pulse 2.8s ease-in-out infinite;
  }

  .hint {
    margin-top: var(--s-2);
    font-size: var(--t-meta);
    color: var(--color-ink-dim);
  }

  @media (max-width: 640px) {
    .body { grid-template-columns: 1fr; }
    .art { width: 12rem; }
  }

  :global([data-theme='pro']) .art img {
    transform: none;
    border: 0;
    box-shadow: none;
  }
</style>
