<script lang="ts">
  import Barcode from './Barcode.svelte';
  import { randomRotate } from '$lib/utils/randomRotate';
  import type { Friend } from '$lib/data/types';
  import { assetUrl } from '$lib/utils/urls';

  interface Props {
    friends: Friend[];
    title?: string;
  }

  let { friends, title = "Das's Friend Space" }: Props = $props();
</script>

<section class="friends">
  <div class="head">
    <h2 class="section-title">{title}</h2>
    <Barcode kind="friend" />
  </div>
  <ul>
    {#each friends as friend, index (friend.id)}
      <li style:transform={randomRotate(index + 2)}>
        <img src={assetUrl(friend.src)} alt="" />
        <p class="name">{friend.name}</p>
        <p class="cap">{friend.caption}</p>
      </li>
    {/each}
  </ul>
</section>

<style>
  .friends {
    background: var(--color-panel);
    border: 1px solid var(--color-line);
    padding: var(--s-4);
  }

  .head {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: var(--s-3);
  }

  .head .section-title {
    margin-bottom: 0;
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
    transition: transform 180ms var(--ease-out);
  }

  li:hover {
    scale: 1.06;
  }

  img {
    width: 100%;
    aspect-ratio: 1;
    object-fit: cover;
    filter: contrast(var(--photo-contrast)) grayscale(var(--photo-gray)) sepia(var(--photo-sepia));
    border: 3px solid var(--color-void);
    margin-bottom: 6px;
  }

  .name {
    font-size: 11px;
    font-weight: 700;
    color: var(--color-panel-ink);
    margin: 0;
  }

  .cap {
    font-size: 9px;
    color: var(--color-panel-ink-dim);
    margin: 0;
  }

  @media (max-width: 640px) {
    ul { grid-template-columns: repeat(2, 1fr); }
  }

  :global([data-theme='pro']) li,
  :global([data-theme='pro']) li:hover {
    transform: none !important;
    scale: 1;
  }

  :global([data-theme='pro']) img {
    border: 0;
  }
</style>
