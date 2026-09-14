<script lang="ts">
  import GrainLayer from './GrainLayer.svelte';
  import type { InterestRow } from '$lib/data/types';

  interface Props {
    rows: InterestRow[];
  }

  let { rows }: Props = $props();
</script>

<section class="interests">
  <GrainLayer />
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
    position: relative;
    overflow: hidden;
    background: var(--color-panel);
    border: 1px solid var(--color-line);
    padding: var(--s-4);
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: var(--t-body);
  }

  th,
  td {
    vertical-align: top;
    padding: 0.55rem 0.65rem;
    border: 1px solid var(--color-line);
  }

  th {
    width: 7.2rem;
    background: var(--color-accent);
    color: var(--color-ink);
    font-weight: 700;
    text-align: left;
    letter-spacing: 0.01em;
  }

  td {
    background: color-mix(in srgb, var(--color-bg) 55%, var(--color-panel));
    color: var(--color-ink-soft);
  }

  :global([data-theme='pro']) th {
    background: var(--color-raised);
    color: var(--color-ink);
  }
</style>
