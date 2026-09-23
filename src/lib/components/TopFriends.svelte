<script lang="ts">
  import type { Friend } from '$lib/data/types';
  import { assetUrl } from '$lib/utils/urls';

  interface Props {
    friends: Friend[];
  }

  let { friends }: Props = $props();
</script>

<ul class="grid">
  {#each friends as friend (friend.id)}
    <li>
      <div class="face"><img src={assetUrl(friend.src)} alt={friend.name} loading="lazy" decoding="async" /></div>
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

  .face img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
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
