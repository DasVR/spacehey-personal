<script lang="ts">
  import GrainLayer from './GrainLayer.svelte';
  import { profileState } from '$lib/profile.svelte.ts';
  import type { ContactAction } from '$lib/data/types';

  interface Props {
    actions: ContactAction[];
  }

  let { actions }: Props = $props();
</script>

<section class="contact">
  <GrainLayer />
  <h2 class="section-title">Contacting Das</h2>
  <div class="rows">
    {#each actions as action (action.id)}
      <button type="button" onclick={() => profileState.ping(action.id)}>
        {action.label}
      </button>
    {/each}
  </div>
</section>

<style>
  .contact {
    position: relative;
    overflow: hidden;
    background: var(--color-panel);
    border: 1px solid var(--color-line);
    padding: var(--s-4);
  }

  .rows {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--s-2);
  }

  button {
    background: var(--color-accent);
    color: var(--color-ink);
    border: 1px solid var(--color-void);
    box-shadow: 1px 1px 0 var(--color-void);
    padding: 0.4rem 0.55rem;
    font-size: var(--t-meta);
    text-align: left;
  }

  button:hover {
    background: var(--color-accent-bright);
  }

  button:active {
    transform: translate(1px, 1px);
    box-shadow: none;
  }

  :global([data-theme='pro']) button {
    background: transparent;
    color: var(--color-ink);
    box-shadow: none;
    border-color: var(--color-line);
  }
</style>
