<script lang="ts">
  import Icon from './Icon.svelte';
  import type { Work, WorkStatus } from '$lib/data/types';

  interface Props {
    items: Work[];
  }

  let { items }: Props = $props();

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
    <li>
      <svelte:element
        this={item.href ? 'a' : 'div'}
        class="row"
        href={item.href}
        target={item.href ? '_blank' : undefined}
        rel={item.href ? 'noopener' : undefined}
      >
        <span class="name">{item.name}</span>
        <span class="summary">{item.summary}</span>
        <span class="meta">
          <span class="status {item.status}"><span class="dot"></span>{statusLabel(item.status)}</span>
          <span class="kind">{item.meta}</span>
          {#if item.href}<span class="arrow"><Icon name="arrow" size={14} /></span>{/if}
        </span>
      </svelte:element>
    </li>
  {/each}
</ul>

<style>
  .work {
    list-style: none;
    display: grid;
  }

  li + li {
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
    color: inherit;
    text-decoration: none;
    transition-property: background-color;
    transition-duration: 150ms;
  }

  a.row:hover {
    background: var(--color-hover);
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

  .arrow {
    color: var(--color-ink-faint);
    transition-property: translate, color;
    transition-duration: 150ms;
  }

  a.row:hover .arrow {
    color: var(--color-ink);
    translate: 1px -1px;
  }

  @media (max-width: 480px) {
    .kind {
      display: none;
    }
  }
</style>
