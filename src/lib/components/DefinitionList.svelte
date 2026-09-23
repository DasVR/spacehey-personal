<script lang="ts">
  interface Props {
    rows: { label: string; value: string }[];
  }

  let { rows }: Props = $props();
</script>

<dl>
  {#each rows as row (row.label)}
    <div>
      <dt>{row.label}</dt>
      <dd>{row.value}</dd>
    </div>
  {/each}
</dl>

<style>
  dl {
    display: grid;
  }

  div {
    display: grid;
    grid-template-columns: 6.5rem 1fr;
    gap: var(--s-4);
    padding-block: var(--s-3);
  }

  div + div {
    border-top: 1px solid var(--color-line);
  }

  dt {
    font-family: var(--font-mono);
    font-size: var(--t-micro);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--color-ink-faint);
    padding-top: 3px;
  }

  dd {
    font-size: var(--t-body);
    line-height: 1.55;
    color: var(--color-ink);
    text-wrap: pretty;
  }
</style>
