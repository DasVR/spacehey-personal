<script lang="ts">
  import type { Snippet } from 'svelte';
  import Barcode from './Barcode.svelte';

  interface Props {
    title: string;
    area: string;
    /** Serial printed on the panel's barcode sticker. */
    code?: string;
    aside?: Snippet;
    children: Snippet;
  }

  let { title, area, code, aside, children }: Props = $props();
</script>

<!--
  A MySpace box, rebuilt: paper panel, black title bar, a barcode sticker.
  Tokens are re-pointed inside so any component placed here reads as ink on paper.
-->
<section class="panel" style="grid-area: {area}" aria-label={title}>
  <header class="bar">
    <h2>{title}</h2>
    {#if aside}<div class="aside">{@render aside()}</div>{/if}
  </header>
  <div class="body">{@render children()}</div>
  {#if code}<span class="sticker"><Barcode value={code} /></span>{/if}
</section>

<style>
  .panel {
    --color-ink: var(--panel-ink);
    --color-ink-dim: var(--panel-dim);
    --color-ink-faint: var(--panel-faint);
    --color-line: var(--panel-line);
    --color-line-strong: var(--panel-line);
    --color-surface: var(--panel-raised);
    --color-raised: var(--panel-raised);
    --color-hover: var(--panel-hover);
    --img-outline: oklch(0 0 0 / 0.1);
    position: relative;
    display: flex;
    flex-direction: column;
    min-width: 0;
    border-radius: 18px;
    background: var(--panel);
    color: var(--panel-ink);
    box-shadow:
      0 0 0 1px oklch(0 0 0 / 0.5),
      0 24px 48px -20px oklch(0 0 0 / 0.7);
    overflow: hidden;
  }

  .bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--s-3);
    min-height: 40px;
    padding: 0 var(--s-2) 0 var(--s-4);
    background: var(--panel-bar);
    color: var(--panel-bar-ink);
  }

  h2 {
    font-size: var(--t-body);
    font-weight: 600;
    letter-spacing: -0.005em;
  }

  .aside {
    display: flex;
    align-items: center;
    gap: var(--s-2);
    font-family: var(--font-mono);
    font-size: var(--t-micro);
    color: color-mix(in oklch, var(--panel-bar-ink) 60%, transparent);
  }

  .body {
    flex: 1;
    display: grid;
    align-content: start;
    gap: var(--s-4);
    padding: var(--s-4);
  }

  .sticker {
    position: absolute;
    right: var(--s-3);
    bottom: var(--s-3);
    rotate: -2deg;
    box-shadow: 0 1px 0 oklch(0 0 0 / 0.15);
    pointer-events: none;
  }
</style>
