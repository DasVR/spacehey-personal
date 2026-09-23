<script lang="ts">
  import DitherImage from './DitherImage.svelte';
  import type { Friend } from '$lib/data/types';

  interface Props {
    friends: Friend[];
  }

  let { friends }: Props = $props();
</script>

<ul class="grid">
  {#each friends as friend (friend.id)}
    <li>
      <div class="face"><DitherImage src={friend.src} alt={friend.name} cell={2} levels={2} /></div>
      <p class="name">{friend.name}</p>
      <p class="cap">{friend.caption}</p>
    </li>
  {/each}
</ul>

<style>
  .grid {
    list-style: none;
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: var(--s-4) var(--s-3);
  }

  .face {
    aspect-ratio: 1;
    border-radius: 12px;
    overflow: hidden;
    outline: 1px solid var(--img-outline);
    outline-offset: -1px;
  }

  .name {
    margin-top: var(--s-2);
    font-size: var(--t-small);
    font-weight: 500;
    color: var(--color-ink);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .cap {
    font-size: var(--t-micro);
    color: var(--color-ink-faint);
  }
</style>
