<script lang="ts">
  import GrainLayer from './GrainLayer.svelte';
  import { profileState } from '$lib/profile.svelte.ts';

  interface Props {
    name: string;
  }

  let { name }: Props = $props();
</script>

<section class="title-block">
  <GrainLayer />
  <p class="eyebrow">profile name</p>
  <div class="row">
    <h1 class="glitch-name" data-text={name}>{name}</h1>
    <button
      class="edit-link"
      type="button"
      aria-pressed={profileState.editing}
      onclick={() => profileState.toggleEditing()}
    >
      [edit]
    </button>
  </div>
</section>

<style>
  .title-block {
    position: relative;
    padding: var(--s-2) 0 var(--s-4);
    overflow: hidden;
  }

  .row {
    display: flex;
    align-items: flex-start;
    gap: var(--s-3);
  }

  h1 {
    font-family: var(--font-display);
    font-size: var(--t-display);
    letter-spacing: var(--track-display);
    line-height: var(--lh-tight);
    text-transform: uppercase;
    margin: 0;
  }

  .edit-link {
    margin-top: 0.55em;
    background: none;
    border: 0;
    padding: 0;
    color: var(--color-accent-bright);
    font-weight: 700;
    font-size: var(--t-meta);
  }

  :global([data-theme='pro']) h1 {
    text-transform: none;
    letter-spacing: -0.03em;
  }
</style>
