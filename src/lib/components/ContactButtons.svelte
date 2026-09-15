<script lang="ts">
  import { profileState } from '$lib/profile.svelte.ts';
  import type { ContactAction } from '$lib/data/types';

  interface Props {
    actions: ContactAction[];
  }

  let { actions }: Props = $props();
</script>

<section class="contact">
  <h2 class="section-title">Contacting Das</h2>
  <div class="rows">
    {#each actions as action, index (action.id)}
      <button
        type="button"
        class:primary={index === 0}
        onclick={() => profileState.ping(action.id)}
      >
        {action.label}
      </button>
    {/each}
  </div>
</section>

<style>
  .contact {
    background: var(--color-panel);
    border: 1px solid var(--color-line);
    padding: 14px var(--s-4);
  }

  .rows {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--s-2);
  }

  button {
    background: var(--color-void);
    color: var(--color-ink);
    border: 1px solid var(--color-void);
    box-shadow: 1px 1px 0 var(--color-void);
    padding: 8px 6px;
    font-size: 11px;
    text-align: left;
    transition:
      transform 150ms var(--ease-out),
      box-shadow 150ms ease;
  }

  button.primary {
    background: var(--color-red);
    color: var(--color-on-red);
  }

  button:hover {
    box-shadow: 2px 2px 0 var(--color-void);
    transform: translateY(-1px);
  }

  button:active {
    transform: scale(0.96);
    box-shadow: 1px 1px 0 var(--color-void);
  }

  :global([data-theme='pro']) button {
    background: transparent;
    color: var(--color-panel-ink);
    box-shadow: none;
    border-color: var(--color-line);
  }

  :global([data-theme='pro']) button.primary {
    background: var(--color-red);
    color: var(--color-on-red);
  }
</style>
