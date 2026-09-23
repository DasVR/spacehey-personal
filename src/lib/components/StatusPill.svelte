<script lang="ts">
  import { onMount } from 'svelte';
  import Icon from './Icon.svelte';
  import type { Status } from '$lib/data/types';
  import { timeAgo } from '$lib/utils/time';

  interface Props {
    statuses: Status[];
  }

  let { statuses }: Props = $props();

  let index = $state(0);
  let now = $state(Date.now());
  const current = $derived(statuses[index]);
  const label = $derived(index === 0 ? 'Now' : `${index} back`);

  onMount(() => {
    const t = window.setInterval(() => (now = Date.now()), 60_000);
    return () => window.clearInterval(t);
  });

  function next(): void {
    index = (index + 1) % statuses.length;
  }
</script>

<!-- Tap to flip back through recent statuses, like an away message history. -->
<button type="button" class="status press" onclick={next} aria-label="Status: {current.text}. Tap for earlier statuses.">
  <span class="glyph" aria-hidden="true">
    {#key current.glyph}
      <span class="glyph-in"><Icon name={current.glyph} size={16} stroke={2} /></span>
    {/key}
    {#if index === 0}<span class="pulse"></span>{/if}
  </span>
  <span class="text">
    {#key index}
      <span class="line">
        <strong>{current.text}</strong>
        <span class="meta">{label} · {timeAgo(current.since, now)}</span>
      </span>
    {/key}
  </span>
  {#if statuses.length > 1}
    <span class="dots" aria-hidden="true">
      {#each statuses as s, i (s.since)}
        <i class:on={i === index}></i>
      {/each}
    </span>
  {/if}
</button>

<style>
  .status {
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    gap: var(--s-3);
    width: 100%;
    min-height: 56px;
    padding: 8px 14px 8px 8px;
    border-radius: 16px;
    text-align: left;
    background: color-mix(in oklch, var(--color-raised) 70%, transparent);
    box-shadow: 0 0 0 1px var(--color-line);
    transition-property: background-color, scale;
    transition-duration: 150ms;
  }

  .status:hover {
    background: var(--color-raised);
  }

  .glyph {
    position: relative;
    display: grid;
    place-items: center;
    width: 40px;
    height: 40px;
    border-radius: 12px;
    color: var(--color-on-accent);
    background: var(--color-accent);
    box-shadow: 0 1px 0 oklch(1 0 0 / 0.2) inset;
  }

  .glyph-in {
    display: grid;
    animation: swap-in 280ms cubic-bezier(0.2, 0, 0, 1) both;
  }

  .pulse {
    position: absolute;
    top: -3px;
    right: -3px;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--color-live);
    box-shadow: 0 0 0 2px var(--color-surface);
  }

  .pulse::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: var(--color-live);
    animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
  }

  .text {
    display: grid;
    min-width: 0;
  }

  .line {
    display: grid;
    gap: 1px;
    grid-area: 1 / 1;
    animation: swap-in 280ms cubic-bezier(0.2, 0, 0, 1) both;
  }

  strong {
    font-size: var(--t-body);
    font-weight: 600;
    color: var(--color-ink);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .meta {
    font-family: var(--font-mono);
    font-size: var(--t-micro);
    letter-spacing: 0.02em;
    color: var(--color-ink-faint);
  }

  .dots {
    display: flex;
    gap: 4px;
  }

  .dots i {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: var(--color-line-strong);
    transition-property: background-color, scale;
    transition-duration: 200ms;
  }

  .dots i.on {
    background: var(--color-ink);
    scale: 1.2;
  }

  @keyframes swap-in {
    from {
      opacity: 0;
      transform: translateY(6px);
      filter: blur(4px);
    }
  }

  @keyframes ping {
    75%,
    100% {
      transform: scale(2.4);
      opacity: 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .pulse::after,
    .glyph-in,
    .line {
      animation: none;
    }
  }
</style>
