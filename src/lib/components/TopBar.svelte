<script lang="ts">
  import Logo from './Logo.svelte';
  import type { Mode } from '$lib/data/types';
  import { goto } from '$app/navigation';
  import { app } from '$lib/app.svelte.ts';
  import { page } from '$app/state';
  import { pageHref } from '$lib/utils/urls';

  interface Props {
    mode: Mode;
    host: string;
  }

  let { mode, host }: Props = $props();

  let spins = $state(0);

  /*
   * Drag the thumb across the switch to change pages, like a native toggle.
   * A plain tap still works through the links underneath.
   */
  let nav: HTMLElement;
  let slide = $state<number | null>(null);
  let from = 0;
  let moved = false;

  function thumbDown(event: PointerEvent): void {
    from = event.clientX;
    moved = false;
    slide = mode === 'pro' ? 1 : 0;
    nav.setPointerCapture(event.pointerId);
  }

  function thumbMove(event: PointerEvent): void {
    if (slide === null) return;
    const half = nav.offsetWidth / 2;
    const dx = event.clientX - from;
    if (Math.abs(dx) > 4) moved = true;
    const base = mode === 'pro' ? 1 : 0;
    const raw = base + dx / half;
    // Rubber-band past either end.
    slide = raw < 0 ? raw * 0.2 : raw > 1 ? 1 + (raw - 1) * 0.2 : raw;
  }

  function thumbUp(event: PointerEvent): void {
    if (slide === null) return;
    const target = slide > 0.5 ? 'pro' : 'casual';
    slide = null;
    if (!moved) {
      // A tap: whichever half was touched.
      const r = nav.getBoundingClientRect();
      const tapped = event.clientX > r.left + r.width / 2 ? 'pro' : 'casual';
      if (tapped !== mode) goto(pageHref(tapped === 'pro' ? '/pro' : '/'), { noScroll: true });
      return;
    }
    navigator.vibrate?.(6);
    if (target !== mode) goto(pageHref(target === 'pro' ? '/pro' : '/'), { noScroll: true });
  }

  /** On its own page the mark doesn't navigate: it spins and replays the tap. */
  function onBrand(event: MouseEvent): void {
    const home = pageHref(mode === 'pro' ? '/pro' : '/');
    if (page.url.pathname !== home) return;
    event.preventDefault();
    spins += 1;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    app.replay();
  }
</script>

<header class="bar">
  <a class="brand" href={pageHref(mode === 'pro' ? '/pro' : '/')} onclick={onBrand}>
    {#key spins}<span class="mark" class:spin={spins > 0}><Logo size={16} /></span>{/key}
    <span>{host}</span>
  </a>

  <nav
    class="switch"
    class:sliding={slide !== null}
    aria-label="Profile mode"
    data-mode={mode}
    bind:this={nav}
    onpointerdown={thumbDown}
    onpointermove={thumbMove}
    onpointerup={thumbUp}
    onpointercancel={() => (slide = null)}
  >
    <span class="thumb" aria-hidden="true" style={slide !== null ? `translate: ${slide * 100}% 0; scale: 1.06 1.1` : undefined}></span>
    <a href={pageHref('/')} aria-current={mode === 'casual' ? 'page' : undefined} data-sveltekit-noscroll>Casual</a>
    <a href={pageHref('/pro')} aria-current={mode === 'pro' ? 'page' : undefined} data-sveltekit-noscroll>Pro</a>
  </nav>
</header>

<style>
  .bar {
    view-transition-name: topbar;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--s-4);
    padding-block: var(--s-4);
    transition-property: opacity;
    transition-duration: 400ms;
    transition-timing-function: var(--ease-out);
  }

  /* The island owns the top edge while a tap plays. */
  :global(html.arrive) .bar,
  :global(html.arriving) .bar {
    opacity: 0;
  }

  .brand {
    display: inline-flex;
    align-items: center;
    gap: var(--s-2);
    font-family: var(--font-mono);
    font-size: var(--t-meta);
    letter-spacing: 0.02em;
    color: var(--color-ink-dim);
    text-decoration: none;
    min-height: 44px;
    transition-property: color;
    transition-duration: 150ms;
  }

  .brand:hover {
    color: var(--color-ink);
  }

  .mark {
    display: inline-flex;
    color: var(--color-accent);
  }

  .mark.spin {
    animation: spin 900ms cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  @keyframes spin {
    40% {
      scale: 1.5;
    }
    to {
      rotate: 360deg;
    }
  }

  .switch {
    --pad: 3px;
    position: relative;
    display: grid;
    grid-template-columns: 1fr 1fr;
    padding: var(--pad);
    border-radius: var(--r-pill);
    background: color-mix(in oklch, var(--color-surface) 80%, transparent);
    box-shadow: var(--shadow-float);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
  }

  .switch a {
    position: relative;
    z-index: 1;
    display: grid;
    place-items: center;
    min-width: 4.25rem;
    min-height: 34px;
    padding-inline: var(--s-3);
    font-size: var(--t-small);
    font-weight: 500;
    color: var(--color-ink-dim);
    text-decoration: none;
    border-radius: var(--r-pill);
    transition-property: color;
    transition-duration: 150ms;
  }

  /* 44px hit area without growing the pill. */
  .switch a::after {
    content: '';
    position: absolute;
    inset: -5px 0;
  }

  .switch a[aria-current='page'] {
    color: var(--color-on-accent);
  }

  .thumb {
    position: absolute;
    top: var(--pad);
    bottom: var(--pad);
    left: var(--pad);
    width: calc(50% - var(--pad));
    border-radius: var(--r-pill);
    background: var(--color-accent);
    transition-property: translate;
    transition-duration: 300ms;
    transition-timing-function: var(--ease-out);
  }

  .switch {
    touch-action: pan-y;
    user-select: none;
  }

  .switch a {
    pointer-events: none;
  }

  .sliding .thumb {
    transition: scale 200ms;
  }

  .thumb {
    transition:
      translate 420ms cubic-bezier(0.34, 1.35, 0.5, 1),
      scale 300ms cubic-bezier(0.34, 1.56, 0.64, 1) !important;
  }

  [data-mode='pro'] .thumb {
    translate: 100% 0;
  }
</style>
