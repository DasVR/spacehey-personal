<script lang="ts">
  import GrainLayer from './GrainLayer.svelte';
  import { randomRotate } from '$lib/utils/randomRotate';
  import type { Friend } from '$lib/data/types';

  interface Props {
    friends: Friend[];
    title?: string;
  }

  let { friends, title = "Das's Friend Space" }: Props = $props();
</script>

<section class="friends">
  <GrainLayer />
  <h2 class="section-title">{title}</h2>
  <ul>
    {#each friends as friend, index (friend.id)}
      <li style:transform={randomRotate(index + 2)}>
        <img src={friend.src} alt="" />
        <p class="name">{friend.name}</p>
        <p class="cap">{friend.caption}</p>
      </li>
    {/each}
  </ul>
</section>

<style>
  .friends {
    position: relative;
    overflow: hidden;
    background: var(--color-panel);
    border: 1px solid var(--color-line);
    padding: var(--s-4);
  }

  ul {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--s-4) var(--s-3);
    list-style: none;
    padding: 0;
    margin: 0;
  }

  li {
    text-align: center;
  }

  img {
    width: 100%;
    aspect-ratio: 1;
    object-fit: cover;
    filter: contrast(var(--photo-contrast)) grayscale(var(--photo-gray)) sepia(var(--photo-sepia));
    border: 3px solid var(--color-void);
    box-shadow: 2px 3px 6px var(--color-shadow);
    margin-bottom: var(--s-2);
  }

  .name {
    font-size: var(--t-meta);
    font-weight: 700;
  }

  .cap {
    font-size: var(--t-micro);
    color: var(--color-ink-dim);
  }

  @media (max-width: 640px) {
    ul { grid-template-columns: repeat(2, 1fr); }
  }

  :global([data-theme='pro']) li {
    transform: none !important;
  }

  :global([data-theme='pro']) img {
    border: 0;
    box-shadow: none;
  }
</style>
