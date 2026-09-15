<script lang="ts">
  import GrainLayer from './GrainLayer.svelte';
  import { rotateDeg } from '$lib/utils/randomRotate';
  import type { Photo } from '$lib/data/types';

  interface Props {
    photos: Photo[];
  }

  let { photos }: Props = $props();

  let tiltX = $state(0);
  let tiltY = $state(0);

  function onPointerMove(event: PointerEvent): void {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const node = event.currentTarget as HTMLElement;
    const box = node.getBoundingClientRect();
    const px = (event.clientX - box.left) / box.width - 0.5;
    const py = (event.clientY - box.top) / box.height - 0.5;
    tiltY = px * 5;
    tiltX = py * -5;
  }

  function onPointerLeave(): void {
    tiltX = 0;
    tiltY = 0;
  }
</script>

<section class="scatter-wrap">
  <GrainLayer />
  <h2 class="section-title">Pics</h2>
  <div
    class="stage"
    role="region"
    aria-label="Photo wall"
    onpointermove={onPointerMove}
    onpointerleave={onPointerLeave}
  >
    <div
      class="tilt"
      style:transform="rotateX({tiltX}deg) rotateY({tiltY}deg)"
    >
      {#each photos as photo, index (photo.src)}
        <figure
          class="photo-tile"
          style:left={photo.left}
          style:top={photo.top}
          style:width={photo.width}
          style:z-index={photo.z}
          style:transform={rotateDeg(photo.rotate)}
        >
          <img src={photo.src} alt={photo.alt} />
          <figcaption>{String(index + 1).padStart(2, '0')}</figcaption>
        </figure>
      {/each}
    </div>
  </div>
</section>

<style>
  .scatter-wrap {
    position: relative;
    overflow: visible;
    background: var(--color-panel);
    border: 1px solid var(--color-line);
    padding: var(--s-4);
  }

  .stage {
    position: relative;
    height: 38rem;
    perspective: 900px;
    overflow: visible;
  }

  .tilt {
    position: absolute;
    inset: 0;
    transform-style: preserve-3d;
    transition: transform var(--dur-flip) var(--ease-out);
  }

  .photo-tile {
    position: absolute;
    margin: 0;
    background: var(--color-paper);
    padding: 0.35rem 0.35rem 1.15rem;
    box-shadow: 2px 3px 6px var(--color-shadow);
  }

  .photo-tile img {
    width: 100%;
    aspect-ratio: 4 / 5;
    object-fit: cover;
    filter: contrast(var(--photo-contrast)) grayscale(var(--photo-gray)) sepia(var(--photo-sepia));
    border: 3px solid var(--color-void);
  }

  .photo-tile::after {
    content: '';
    position: absolute;
    inset: 0.35rem 0.35rem 1.15rem;
    background: radial-gradient(circle, transparent 42%, var(--color-void) 43%) 0 0 / 3px 3px;
    opacity: 0.18;
    mix-blend-mode: multiply;
    pointer-events: none;
  }

  figcaption {
    position: absolute;
    right: 0.45rem;
    bottom: 0.2rem;
    font-family: var(--font-mono);
    font-size: var(--t-micro);
    color: var(--color-void);
  }

  @media (max-width: 720px) {
    .stage {
      height: auto;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--s-3);
      perspective: none;
    }
    .tilt {
      position: relative;
      display: contents;
    }
    .photo-tile {
      position: relative;
      left: auto !important;
      top: auto !important;
      width: auto !important;
    }
  }

  :global([data-theme='pro']) .stage {
    height: auto;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--s-3);
    perspective: none;
  }

  :global([data-theme='pro']) .tilt {
    position: relative;
    display: contents;
    transform: none !important;
  }

  :global([data-theme='pro']) .photo-tile {
    position: relative;
    left: auto !important;
    top: auto !important;
    width: auto !important;
    transform: none !important;
    background: transparent;
    padding: 0;
    box-shadow: none;
  }

  :global([data-theme='pro']) .photo-tile img {
    border: 0;
    aspect-ratio: 4 / 5;
  }

  :global([data-theme='pro']) .photo-tile::after,
  :global([data-theme='pro']) figcaption {
    display: none;
  }
</style>
