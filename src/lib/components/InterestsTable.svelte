<script lang="ts">
  import type { InterestRow } from '$lib/data/types';

  interface Props {
    rows: InterestRow[];
  }

  let { rows }: Props = $props();
</script>

<section class="interests">
  <h2 class="section-title">Das's Interests</h2>
  <table>
    <tbody>
      {#each rows as row (row.label)}
        <tr>
          <th scope="row">{row.label}</th>
          <td>{row.value}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</section>

<style>
  .interests {
    background: var(--color-panel);
    border: 1px solid var(--color-line);
    padding: var(--s-4);
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: var(--t-meta);
  }

  th,
  td {
    vertical-align: top;
    padding: 8px 10px;
    border: 1px solid var(--color-line);
  }

  th {
    width: 8rem;
    background: var(--color-void);
    color: var(--color-on-void);
    font-weight: 700;
    text-align: left;
  }

  td {
    color: var(--color-panel-ink-dim);
  }

  :global([data-theme='pro']) th {
    background: var(--color-panel-ink);
    color: var(--color-panel);
  }
</style>
