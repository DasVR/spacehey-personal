<script lang="ts">
  import GrainLayer from './GrainLayer.svelte';
  import { profileState } from '$lib/profile.svelte.ts';
  import type { Widget, WidgetKind } from '$lib/data/types';

  interface Props {
    widgets: Widget[];
  }

  let { widgets }: Props = $props();

  function kindLabel(kind: WidgetKind): string {
    switch (kind) {
      case 'game':
        return 'game';
      case 'status':
        return 'status';
      case 'building':
        return 'now';
      case 'custom':
        return 'custom';
      default: {
        const _never: never = kind;
        return _never;
      }
    }
  }
</script>

<section class="widgets">
  <GrainLayer />
  <div class="head">
    <h2 class="section-title">Widgets</h2>
    <button class="edit-link" type="button" onclick={() => profileState.addWidget()}>
      [+ add widget]
    </button>
  </div>
  <div class="grid">
    {#each widgets as widget (widget.id)}
      <article class="card" class:wide={widget.span === 2}>
        <p class="eyebrow">{kindLabel(widget.kind)}</p>
        {#if profileState.editing}
          <input
            class="title-input"
            value={widget.title}
            oninput={(e) =>
              profileState.updateWidget(widget.id, { title: e.currentTarget.value })}
          />
          <textarea
            rows="3"
            value={widget.body}
            oninput={(e) =>
              profileState.updateWidget(widget.id, { body: e.currentTarget.value })}
          ></textarea>
        {:else}
          <h3>{widget.title}</h3>
          <p>{widget.body}</p>
        {/if}
      </article>
    {/each}
  </div>
</section>

<style>
  .widgets {
    position: relative;
    overflow: hidden;
    background: var(--color-panel);
    border: 1px solid var(--color-line);
    padding: var(--s-4);
  }

  .head {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: var(--s-3);
  }

  .edit-link {
    background: none;
    border: 0;
    padding: 0;
    color: var(--color-accent-bright);
    font-weight: 700;
    font-size: var(--t-meta);
  }

  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--s-3);
    align-items: start;
  }

  .card {
    background: color-mix(in srgb, var(--color-bg) 45%, var(--color-panel));
    border: 1px solid var(--color-line);
    padding: var(--s-3);
    min-height: 7.5rem;
  }

  .card:nth-child(3n) {
    min-height: 9.5rem;
    transform: rotate(-0.6deg);
  }

  .card:nth-child(2) {
    min-height: 8.4rem;
    transform: rotate(0.8deg);
  }

  .wide {
    grid-column: span 2;
    min-height: 6.2rem;
  }

  h3 {
    font-size: var(--t-lead);
    margin: 0.2rem 0 var(--s-2);
    text-transform: lowercase;
  }

  .card p:last-child {
    color: var(--color-ink-soft);
  }

  input,
  textarea {
    width: 100%;
    background: var(--color-bg);
    border: 1px solid var(--color-line);
    padding: var(--s-2);
    margin-top: var(--s-1);
  }

  @media (max-width: 640px) {
    .grid { grid-template-columns: 1fr; }
    .wide { grid-column: span 1; }
  }

  :global([data-theme='pro']) .card,
  :global([data-theme='pro']) .card:nth-child(2),
  :global([data-theme='pro']) .card:nth-child(3n) {
    transform: none;
    min-height: 0;
  }
</style>
