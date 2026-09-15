<script lang="ts">
  import GrainLayer from './GrainLayer.svelte';
  import type { Blinkie } from '$lib/data/types';

  interface Props {
    blinkies: Blinkie[];
  }

  let { blinkies }: Props = $props();
</script>

<section class="row">
  <GrainLayer />
  <h2 class="section-title">Blinkies</h2>
  <ul>
    {#each blinkies as blinkie (blinkie.id)}
      <li>
        {#if blinkie.href}
          <a href={blinkie.href}>{blinkie.label}</a>
        {:else}
          <span>{blinkie.label}</span>
        {/if}
      </li>
    {/each}
  </ul>
</section>

<style>
  .row {
    position: relative;
    overflow: hidden;
    background: var(--color-bg);
    border: 1px solid var(--color-line);
    padding: var(--s-3) var(--s-4);
  }

  ul {
    display: flex;
    flex-wrap: wrap;
    gap: var(--s-2);
    list-style: none;
    padding: 0;
    margin: 0;
  }

  li span,
  li a {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 88px;
    height: 31px;
    padding: 0 0.45rem;
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    text-decoration: none;
    color: var(--color-paper);
    background: var(--color-void);
    border: 1px solid var(--color-accent-bright);
    box-shadow: inset 0 0 0 1px var(--color-accent);
  }

  li:nth-child(2n) span {
    color: var(--color-void);
    background: var(--color-accent-bright);
  }

  li:nth-child(3n) span {
    color: var(--color-ink);
    background: var(--color-accent);
  }
</style>
