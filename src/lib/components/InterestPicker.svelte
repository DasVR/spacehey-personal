<script lang="ts">
  import { onMount } from 'svelte';
  import Icon from './Icon.svelte';
  import type { InterestGroup } from '$lib/data/types';

  interface Props {
    groups: InterestGroup[];
  }

  let { groups }: Props = $props();

  let active = $state(0);
  let tabs: HTMLDivElement;
  let track: HTMLDivElement;
  let pill = $state({ x: 0, w: 0 });
  let settling = 0;

  /** Slide the highlight under the active tab. */
  function measure(): void {
    const el = tabs?.children[active + 1] as HTMLElement | undefined;
    if (!el) return;
    pill = { x: el.offsetLeft, w: el.offsetWidth };
    // Scroll only the tab strip (scrollIntoView would move the page too).
    const left = el.offsetLeft - tabs.clientWidth / 2 + el.offsetWidth / 2;
    tabs.scrollTo({ left, behavior: 'smooth' });
  }

  function choose(i: number): void {
    active = i;
    track.scrollTo({ left: i * track.clientWidth, behavior: 'smooth' });
  }

  /** Swiping the cards moves the tabs too. */
  function onScroll(): void {
    window.clearTimeout(settling);
    settling = window.setTimeout(() => {
      const i = Math.round(track.scrollLeft / track.clientWidth);
      if (i !== active) active = i;
    }, 60);
  }

  function onKey(event: KeyboardEvent): void {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    event.preventDefault();
    const next = (active + (event.key === 'ArrowRight' ? 1 : -1) + groups.length) % groups.length;
    choose(next);
    (tabs.children[next + 1] as HTMLElement).focus();
  }

  $effect(() => {
    void active;
    measure();
  });

  onMount(() => {
    const ro = new ResizeObserver(measure);
    ro.observe(tabs);
    return () => ro.disconnect();
  });
</script>

<div class="picker">
  <div class="tabs" role="tablist" aria-label="Interests" bind:this={tabs} onkeydown={onKey} tabindex="-1">
    <span class="pill" aria-hidden="true" style="translate: {pill.x}px 0; width: {pill.w}px"></span>
    {#each groups as g, i (g.id)}
      <button
        type="button"
        role="tab"
        id="tab-{g.id}"
        aria-selected={i === active}
        aria-controls="panel-{g.id}"
        tabindex={i === active ? 0 : -1}
        class:on={i === active}
        onclick={() => choose(i)}
      >
        <Icon name={g.icon} size={15} stroke={i === active ? 2 : 1.5} />
        {g.label}
      </button>
    {/each}
  </div>

  <div class="track" bind:this={track} onscroll={onScroll}>
    {#each groups as g, i (g.id)}
      <div
        class="card"
        class:on={i === active}
        role="tabpanel"
        id="panel-{g.id}"
        aria-labelledby="tab-{g.id}"
        inert={i !== active}
      >
        <span class="big" aria-hidden="true"><Icon name={g.icon} size={96} /></span>
        <p class="blurb">{g.blurb}</p>
        <ul>
          {#each g.items as item, j (item)}
            <li style="--j: {j}">{item}</li>
          {/each}
        </ul>
      </div>
    {/each}
  </div>
</div>

<style>
  .picker {
    display: grid;
    gap: var(--s-3);
  }

  .tabs {
    position: relative;
    display: flex;
    gap: 4px;
    padding: 4px;
    border-radius: 14px;
    background: color-mix(in oklch, var(--color-raised) 60%, transparent);
    box-shadow: 0 0 0 1px var(--color-line);
    overflow-x: auto;
    scrollbar-width: none;
  }

  .tabs::-webkit-scrollbar {
    display: none;
  }

  .pill {
    position: absolute;
    top: 4px;
    bottom: 4px;
    left: 0;
    border-radius: 10px;
    background: var(--color-accent);
    box-shadow: 0 6px 16px -6px color-mix(in oklch, var(--color-accent) 70%, transparent);
    transition-property: translate, width;
    transition-duration: 380ms;
    transition-timing-function: cubic-bezier(0.2, 0, 0, 1);
  }

  .tabs button {
    position: relative;
    z-index: 1;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    flex: none;
    min-height: 40px;
    padding-inline: 14px;
    border-radius: 10px;
    font-size: var(--t-small);
    font-weight: 500;
    color: var(--color-ink-dim);
    white-space: nowrap;
    transition-property: color;
    transition-duration: 200ms;
  }

  .tabs button:hover {
    color: var(--color-ink);
  }

  .tabs button.on {
    color: var(--color-on-accent);
  }

  .track {
    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: 100%;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    overscroll-behavior-x: contain;
    scrollbar-width: none;
    border-radius: 18px;
  }

  .track::-webkit-scrollbar {
    display: none;
  }

  .card {
    position: relative;
    display: grid;
    align-content: start;
    gap: var(--s-4);
    min-height: 200px;
    padding: var(--s-5);
    scroll-snap-align: start;
    border-radius: 18px;
    background:
      radial-gradient(120% 90% at 100% 0%, color-mix(in oklch, var(--color-accent) 16%, transparent), transparent 60%),
      var(--color-surface);
    box-shadow: inset 0 0 0 1px var(--color-line);
    overflow: hidden;
  }

  .big {
    position: absolute;
    right: -10px;
    top: -10px;
    color: color-mix(in oklch, var(--color-accent) 22%, transparent);
    rotate: -12deg;
    pointer-events: none;
  }

  .blurb {
    position: relative;
    max-width: 30ch;
    font-size: var(--t-lead);
    line-height: 1.45;
    color: var(--color-ink);
    text-wrap: balance;
  }

  ul {
    position: relative;
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    list-style: none;
  }

  li {
    padding: 6px 12px;
    border-radius: var(--r-pill);
    font-size: var(--t-small);
    color: var(--color-ink);
    background: var(--color-raised);
    box-shadow: 0 0 0 1px var(--color-line);
  }

  /* Chips cascade in when their card becomes the active one. */
  .card.on li {
    animation: chip-in 420ms cubic-bezier(0.2, 0, 0, 1) backwards;
    animation-delay: calc(var(--j) * 40ms + 80ms);
  }

  @keyframes chip-in {
    from {
      opacity: 0;
      transform: translateY(8px) scale(0.96);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .card.on li {
      animation: none;
    }
  }
</style>
