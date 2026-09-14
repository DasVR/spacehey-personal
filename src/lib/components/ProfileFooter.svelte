<script lang="ts">
  import GrainLayer from './GrainLayer.svelte';

  interface Props {
    count: number;
    memberSince: string;
  }

  let { count, memberSince }: Props = $props();

  const padded = $derived(String(count).padStart(7, '0'));
</script>

<footer class="foot">
  <GrainLayer />
  <p class="counter" aria-label="Visitor count {padded}">
    {#each padded.split('') as digit, i (`${digit}-${i}`)}
      <span>{digit}</span>
    {/each}
  </p>
  <p>member since {memberSince}</p>
  <p class="fine">p.dasdev.net · not a template · grain is a feature</p>
</footer>

<style>
  .foot {
    position: relative;
    overflow: hidden;
    text-align: center;
    padding: var(--s-6) var(--s-4) var(--s-5);
    color: var(--color-ink-dim);
    font-size: var(--t-meta);
  }

  .counter {
    display: inline-flex;
    gap: 2px;
    margin-bottom: var(--s-3);
    background: var(--color-void);
    padding: 0.35rem 0.4rem;
    border: 1px solid var(--color-accent);
  }

  .counter span {
    display: inline-flex;
    width: 1.05rem;
    justify-content: center;
    font-family: var(--font-mono);
    color: var(--color-accent-bright);
    background: color-mix(in srgb, var(--color-bg) 70%, var(--color-void));
  }

  .fine {
    margin-top: var(--s-2);
    font-size: var(--t-micro);
    letter-spacing: var(--track-tick);
    text-transform: uppercase;
  }
</style>
