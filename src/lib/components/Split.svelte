<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    card: Snippet;
    children: Snippet;
  }

  let { card, children }: Props = $props();
</script>

<main class="split">
  <div class="card-col">{@render card()}</div>
  <div class="content">{@render children()}</div>
</main>

<style>
  .split {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: var(--s-8);
    padding-top: var(--s-2);
  }

  .content {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    min-width: 0;
    gap: var(--s-8);
    width: 100%;
    max-width: var(--col-w);
    margin-inline: auto;
  }

  /* Desktop: the card stays put while the rest scrolls past it. */
  @media (min-width: 960px) {
    .split {
      grid-template-columns: var(--card-w) minmax(0, 1fr);
      gap: var(--s-8);
      align-items: start;
      padding-top: var(--s-5);
    }

    .content {
      padding-top: var(--s-2);
      margin-inline: 0;
    }
  }

  @media (min-width: 960px) and (min-height: 940px) {
    .card-col {
      position: sticky;
      top: var(--s-5);
    }
  }
</style>
