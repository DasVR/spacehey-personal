<script lang="ts">
  import GrainLayer from './GrainLayer.svelte';
  import type { Snippet } from 'svelte';

  interface Props {
    title: string;
    children: Snippet;
  }

  let { title, children }: Props = $props();
</script>

<section class="inner">
  <GrainLayer />
  <h1 class="section-title">{title}</h1>
  {@render children()}
</section>

<style>
  .inner {
    position: relative;
    overflow: hidden;
    background: var(--color-panel);
    border: 1px solid var(--color-line);
    padding: var(--s-5) var(--s-4);
    min-height: 18rem;
  }

  h1 {
    font-size: clamp(2rem, 6vw, 3.4rem);
  }

  .inner :global(p) {
    color: var(--color-panel-ink-dim);
    max-width: 38rem;
    margin: 0 0 var(--s-3);
  }
</style>
