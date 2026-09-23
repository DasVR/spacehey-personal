<script lang="ts">
  import type { Blinkie } from '$lib/data/types';

  interface Props {
    blinkies: Blinkie[];
  }

  let { blinkies }: Props = $props();
</script>

<section class="row">
  <h2 class="section-title on-void">Blinkies</h2>
  <ul>
    {#each blinkies as blinkie, index (blinkie.id)}
      {@const variant = index % 3}
      <li>
        {#if blinkie.href}
          <a class="chip" class:paper={variant === 0} class:cream={variant === 1} class:hot={variant === 2} href={blinkie.href}>{blinkie.label}</a>
        {:else}
          <span class="chip" class:paper={variant === 0} class:cream={variant === 1} class:hot={variant === 2}>{blinkie.label}</span>
        {/if}
      </li>
    {/each}
  </ul>
</section>

<style>
  .row {
    background: var(--color-void);
    border: 1px solid var(--color-line);
    padding: 14px var(--s-4);
  }

  ul {
    display: flex;
    flex-wrap: wrap;
    gap: var(--s-2);
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .chip {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 88px;
    height: 31px;
    padding: 0 8px;
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    text-decoration: none;
  }

  .paper {
    color: var(--color-paper);
    background: var(--color-void);
    border: 1px solid var(--color-red);
  }

  .cream {
    color: var(--color-void);
    background: var(--color-ink);
    border: 1px solid var(--color-red);
  }

  .hot {
    color: var(--color-ink);
    background: var(--color-red);
    border: 1px solid var(--color-ink);
  }
</style>
