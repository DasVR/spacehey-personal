<script lang="ts">
  import { barsFor, type BarcodeKind } from '$lib/utils/barcode';

  interface Props {
    kind?: BarcodeKind;
    caption?: string;
  }

  let { kind = 'title', caption }: Props = $props();
  const bars = $derived(barsFor(kind));
</script>

<div class="barcode" class:compact={kind !== 'title'} aria-hidden={caption ? undefined : true}>
  <div class="bars">
    {#each bars as bar, i (`${bar.width}-${bar.height}-${i}`)}
      <span style:width="{bar.width}px" style:height="{bar.height}%"></span>
    {/each}
  </div>
  {#if caption}
    <p>{caption}</p>
  {/if}
</div>

<style>
  .barcode {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 2px;
    opacity: 0.8;
  }

  .bars {
    display: flex;
    align-items: flex-end;
    gap: 1px;
    height: 22px;
  }

  .compact .bars {
    height: 16px;
  }

  span {
    background: var(--color-ink-dim);
  }

  .compact span {
    background: var(--color-panel-ink-dim);
  }

  p {
    font-family: var(--font-mono);
    font-size: 8px;
    letter-spacing: 0.1em;
    color: var(--color-ink-dim);
    margin: 0;
  }
</style>
