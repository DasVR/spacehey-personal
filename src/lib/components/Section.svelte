<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    index: string;
    title: string;
    aside?: Snippet;
    children: Snippet;
  }

  let { index, title, aside, children }: Props = $props();
</script>

<section class="section" aria-labelledby="s-{index}">
  <header>
    <h2 id="s-{index}"><span class="index">{index}</span>{title}</h2>
    {#if aside}<div class="aside">{@render aside()}</div>{/if}
  </header>
  {@render children()}
</section>

<style>
  .section {
    display: grid;
    /* minmax(0, …) so wide scrollers (the crate, the roll) can't stretch the page. */
    grid-template-columns: minmax(0, 1fr);
    gap: var(--s-4);
  }

  header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--s-4);
    padding-bottom: var(--s-3);
    border-bottom: 1px solid var(--color-line);
  }

  h2 {
    display: flex;
    align-items: baseline;
    gap: var(--s-3);
    font-size: var(--t-small);
    font-weight: 500;
    color: var(--color-ink);
  }

  .index {
    font-family: var(--font-mono);
    font-size: var(--t-micro);
    color: var(--color-ink-faint);
    font-variant-numeric: tabular-nums;
  }

  .aside {
    font-family: var(--font-mono);
    font-size: var(--t-micro);
    color: var(--color-ink-faint);
  }
</style>
