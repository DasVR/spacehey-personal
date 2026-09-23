<script lang="ts">
  import qrcode from 'qrcode-generator';

  interface Props {
    value: string;
    label: string;
  }

  let { value, label }: Props = $props();

  const matrix = $derived.by(() => {
    const qr = qrcode(0, 'Q');
    qr.addData(value);
    qr.make();
    const n = qr.getModuleCount();
    const cells: { x: number; y: number }[] = [];
    for (let y = 0; y < n; y += 1) {
      for (let x = 0; x < n; x += 1) {
        if (!qr.isDark(y, x)) continue;
        // Finder patterns are drawn whole below.
        const inFinder = (x < 7 && y < 7) || (x >= n - 7 && y < 7) || (x < 7 && y >= n - 7);
        if (!inFinder) cells.push({ x, y });
      }
    }
    return { n, cells };
  });

  const finders = $derived([
    [0, 0],
    [matrix.n - 7, 0],
    [0, matrix.n - 7],
  ]);
</script>

<svg class="qr" viewBox="-2 -2 {matrix.n + 4} {matrix.n + 4}" role="img" aria-label={label}>
  <rect class="bg" x="-2" y="-2" width={matrix.n + 4} height={matrix.n + 4} rx="3" />
  {#each matrix.cells as c (`${c.x}-${c.y}`)}
    <rect class="m" x={c.x + 0.1} y={c.y + 0.1} width="0.8" height="0.8" rx="0.18" />
  {/each}
  {#each finders as [x, y] (`${x}-${y}`)}
    <rect class="f" x={x + 0.5} y={y + 0.5} width="6" height="6" rx="1.6" fill="none" stroke-width="1" />
    <rect class="fa" x={x + 2} y={y + 2} width="3" height="3" rx="0.8" />
  {/each}
</svg>

<style>
  .qr {
    display: block;
    width: 100%;
    height: auto;
  }

  .bg {
    fill: var(--qr-bg, var(--color-raised));
  }

  .m {
    fill: var(--qr-ink, var(--color-ink));
  }

  .f {
    stroke: var(--qr-ink, var(--color-ink));
  }

  .fa {
    fill: var(--qr-ink, var(--color-ink));
  }
</style>
