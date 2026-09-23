<script lang="ts">
  interface Props {
    value: string;
    /** Show the digits under the bars. */
    digits?: boolean;
  }

  let { value, digits = true }: Props = $props();

  /** Deterministic bar widths from the string, so each panel gets its own code. */
  const bars = $derived.by(() => {
    let h = 2166136261;
    for (const ch of value) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
    const out: { x: number; w: number }[] = [];
    let x = 0;
    for (let i = 0; i < 28; i += 1) {
      h = Math.imul(h ^ (h >>> 13), 1274126177);
      const w = 1 + ((h >>> 3) & 1) + ((h >>> 7) & 1 ? 1 : 0);
      if (i % 2 === 0) out.push({ x, w });
      x += w + 1;
    }
    return { out, width: x };
  });
</script>

<span class="barcode" aria-hidden="true">
  <svg viewBox="0 0 {bars.width} 20" preserveAspectRatio="none">
    {#each bars.out as bar (bar.x)}
      <rect x={bar.x} y="0" width={bar.w} height="20" />
    {/each}
  </svg>
  {#if digits}<span class="digits">{value}</span>{/if}
</span>

<style>
  .barcode {
    display: inline-grid;
    gap: 2px;
    justify-items: center;
    padding: 4px 6px 3px;
    background: var(--panel);
    color: var(--panel-ink);
  }

  svg {
    width: 72px;
    height: 16px;
    fill: currentColor;
  }

  .digits {
    font-family: var(--font-mono);
    font-size: 8px;
    letter-spacing: 0.12em;
  }
</style>
