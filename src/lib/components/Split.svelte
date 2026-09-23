<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    card: Snippet;
    children: Snippet;
    /** Let the content column use the full width (bento layouts). */
    wide?: boolean;
  }

  let { card, children, wide = false }: Props = $props();
</script>

<main class="split" class:wide>
  <div class="card-col">{@render card()}</div>
  <div class="content">{@render children()}</div>
</main>

<style>
  .split {
    display: grid;
    gap: var(--s-8);
    padding-top: var(--s-2);
  }

  .content {
    display: grid;
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

    .wide .content {
      max-width: none;
    }

    /* The card is sized to the viewport (see ContactCard), so it can always stick. */
    .card-col {
      position: sticky;
      top: var(--s-4);
    }
  }
</style>
