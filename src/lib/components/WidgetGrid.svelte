<script lang="ts">
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
    background: var(--color-panel);
    border: 1px solid var(--color-line);
    padding: var(--s-4);
  }

  .head {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: var(--s-3);
    margin-bottom: 10px;
  }

  .head .section-title {
    margin-bottom: 0;
  }

  .edit-link {
    background: none;
    border: 0;
    padding: 0;
    color: var(--color-red);
    font-weight: 700;
    font-size: 11px;
  }

  .edit-link:hover {
    opacity: 0.7;
  }

  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    align-items: start;
  }

  .card {
    background: var(--color-void);
    border: 1px solid var(--color-line);
    padding: 10px;
    min-height: 100px;
    animation: riseIn 320ms var(--ease-out);
    transition:
      transform 180ms var(--ease-out),
      box-shadow 180ms ease;
  }

  .card:hover {
    transform: translateY(-2px);
    box-shadow: 2px 3px 8px var(--color-shadow);
  }

  .wide {
    grid-column: span 2;
  }

  h3 {
    font-size: 14px;
    margin: 0 0 6px;
    text-transform: lowercase;
    color: var(--color-on-void);
  }

  .card p:last-child {
    color: var(--color-ink-dim);
    font-size: var(--t-meta);
    line-height: var(--lh-body);
    margin: 0;
  }

  .eyebrow {
    color: var(--color-ink-dim);
  }

  input,
  textarea {
    width: 100%;
    background: var(--color-bg);
    color: var(--color-ink);
    border: 1px solid var(--color-line-dark);
    padding: var(--s-2);
    margin-top: var(--s-1);
  }

  @media (max-width: 640px) {
    .grid { grid-template-columns: 1fr; }
    .wide { grid-column: span 1; }
  }

  :global([data-theme='pro']) .card:hover {
    transform: none;
    box-shadow: none;
  }

  @keyframes riseIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @media (prefers-reduced-motion: reduce) {
    .card { animation: none; }
  }
</style>
