<script lang="ts">
  import Icon from './Icon.svelte';
  import type { Work, WorkStatus } from '$lib/data/types';

  interface Props {
    items: Work[];
  }

  let { items }: Props = $props();

  let open = $state<string | null>(null);

  function toggle(id: string): void {
    open = open === id ? null : id;
    navigator.vibrate?.(5);
  }

  function statusLabel(status: WorkStatus): string {
    switch (status) {
      case 'live':
        return 'Live';
      case 'building':
        return 'Building';
      case 'running':
        return 'Running';
      default: {
        const _never: never = status;
        return _never;
      }
    }
  }
</script>

<ul class="work">
  {#each items as item (item.id)}
    {@const expanded = open === item.id}
    <li class:open={expanded}>
      <button type="button" class="row" aria-expanded={expanded} aria-controls="work-{item.id}" onclick={() => toggle(item.id)}>
        <span class="name">{item.name}</span>
        <span class="summary">{item.summary}</span>
        <span class="meta">
          <span class="status {item.status}"><span class="dot"></span>{statusLabel(item.status)}</span>
          <span class="kind">{item.meta}</span>
          <span class="chev" aria-hidden="true"><Icon name="plus" size={14} stroke={2} /></span>
        </span>
      </button>
      <div class="more" id="work-{item.id}" inert={!expanded}>
        <div class="more-inner">
          {#if item.details}<p>{item.details}</p>{/if}
          {#if item.tags?.length}
            <ul class="tags">
              {#each item.tags as tag (tag)}<li>{tag}</li>{/each}
            </ul>
          {/if}
          {#if item.href}
            <a class="visit press" href={item.href} target="_blank" rel="noopener">Visit {item.name} <Icon name="arrow" size={14} /></a>
          {/if}
        </div>
      </div>
    </li>
  {/each}
</ul>

<style>
  .work {
    list-style: none;
    display: grid;
  }

  .work > li + li {
    border-top: 1px solid var(--color-line);
  }

  .row {
    display: grid;
    grid-template-columns: 1fr auto;
    grid-template-areas: 'name meta' 'summary summary';
    gap: 4px var(--s-4);
    padding: var(--s-4) var(--s-2);
    margin-inline: calc(-1 * var(--s-2));
    border-radius: 12px;
    width: calc(100% + 2 * var(--s-2));
    text-align: left;
    color: inherit;
    transition-property: background-color;
    transition-duration: 150ms;
  }

  .row:hover {
    background: var(--color-hover);
  }

  /* Height animates via grid rows: 0fr → 1fr, with a springy settle. */
  .more {
    display: grid;
    grid-template-rows: 0fr;
    opacity: 0;
    transition-property: grid-template-rows, opacity;
    transition-duration: 450ms, 250ms;
    transition-timing-function: cubic-bezier(0.34, 1.2, 0.5, 1), ease;
  }

  .open .more {
    grid-template-rows: 1fr;
    opacity: 1;
  }

  .more-inner {
    display: grid;
    gap: var(--s-3);
    min-height: 0;
    overflow: hidden;
  }

  .open .more-inner {
    padding-bottom: var(--s-4);
  }

  .more p {
    font-size: var(--t-small);
    line-height: 1.6;
    color: var(--color-ink);
    text-wrap: pretty;
  }

  .tags {
    list-style: none;
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .tags li {
    padding: 3px 10px;
    border-radius: var(--r-pill);
    font-family: var(--font-mono);
    font-size: var(--t-micro);
    color: var(--color-ink-dim);
    box-shadow: 0 0 0 1px var(--color-line);
  }

  .visit {
    justify-self: start;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-height: 40px;
    padding-inline: var(--s-4);
    border-radius: var(--r-control);
    font-size: var(--t-small);
    font-weight: 600;
    color: var(--color-on-accent);
    background: var(--color-accent);
    text-decoration: none;
  }

  .chev {
    display: inline-flex;
    color: var(--color-ink-faint);
    transition: rotate 400ms cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .open .chev {
    rotate: 135deg;
    color: var(--color-accent);
  }

  .name {
    grid-area: name;
    font-size: var(--t-body);
    font-weight: 600;
    color: var(--color-ink);
  }

  .summary {
    grid-area: summary;
    font-size: var(--t-small);
    line-height: 1.5;
    color: var(--color-ink-dim);
    text-wrap: pretty;
  }

  .meta {
    grid-area: meta;
    display: flex;
    align-items: center;
    gap: var(--s-3);
    font-size: var(--t-meta);
    color: var(--color-ink-faint);
  }

  .status {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: var(--color-ink-dim);
  }

  .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--color-ink-faint);
  }

  .live .dot,
  .running .dot {
    background: var(--color-live);
  }

  .building .dot {
    background: var(--color-accent);
  }

  .kind {
    font-family: var(--font-mono);
    font-size: var(--t-micro);
  }


  @media (max-width: 480px) {
    .kind {
      display: none;
    }
  }
</style>
