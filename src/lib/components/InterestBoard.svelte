<script lang="ts">
  import { onMount } from 'svelte';
  import Icon from './Icon.svelte';
  import type { InterestGroup } from '$lib/data/types';

  interface Props {
    groups: InterestGroup[];
  }

  let { groups }: Props = $props();

  /** -1 = everything floats evenly; otherwise that group gathers in the middle. */
  let active = $state(-1);
  let board: HTMLUListElement;
  const stickers = $derived(groups.flatMap((g, gi) => g.items.map((label, i) => ({ id: `${g.id}-${i}`, label, gi, icon: g.icon }))));
  const group = $derived(active >= 0 ? groups[active] : null);

  interface Body {
    el: HTMLElement;
    gi: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    w: number;
    h: number;
    r: number;
    rot: number;
  }

  let bodies: Body[] = [];
  let raf = 0;
  let visible = false;
  let still = false;
  let drag: { b: Body; dx: number; dy: number; lx: number; ly: number; lt: number; moved: number } | null = null;

  function measure(): void {
    const W = board.clientWidth;
    const H = board.clientHeight;
    const els = board.querySelectorAll<HTMLElement>('.sticker');
    const prev = new Map(bodies.map((b) => [b.el, b]));
    bodies = [...els].map((el, i) => {
      const old = prev.get(el);
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      return {
        el,
        gi: Number(el.dataset.g),
        x: old ? Math.min(old.x, W - w) : Math.random() * Math.max(1, W - w),
        y: old ? Math.min(old.y, H - h) : Math.random() * Math.max(1, H - h),
        vx: old?.vx ?? (Math.random() - 0.5) * 2,
        vy: old?.vy ?? (Math.random() - 0.5) * 2,
        w,
        h,
        r: h / 2,
        rot: old?.rot ?? ((i * 37) % 11) - 5,
      };
    });
    wake();
  }

  function wake(): void {
    still = false;
    if (!raf && visible) raf = requestAnimationFrame(tick);
  }

  function tick(): void {
    raf = 0;
    const W = board.clientWidth;
    const H = board.clientHeight;
    let energy = 0;

    for (const b of bodies) {
      if (drag?.b === b) continue;
      // The chosen group drifts to the middle; everything else relaxes outward.
      if (active >= 0) {
        const cx = W / 2 - b.w / 2;
        const cy = H / 2 - b.h / 2;
        const k = b.gi === active ? 0.0025 : -0.0006;
        b.vx += (cx - b.x) * k;
        b.vy += (cy - b.y) * k;
      }
      b.vx *= 0.96;
      b.vy *= 0.96;
      b.x += b.vx;
      b.y += b.vy;
      // Rubber-band walls.
      if (b.x < 0) (b.x = 0), (b.vx = Math.abs(b.vx) * 0.7);
      if (b.y < 0) (b.y = 0), (b.vy = Math.abs(b.vy) * 0.7);
      if (b.x > W - b.w) (b.x = W - b.w), (b.vx = -Math.abs(b.vx) * 0.7);
      if (b.y > H - b.h) (b.y = H - b.h), (b.vy = -Math.abs(b.vy) * 0.7);
    }

    // Soft separation so stickers nudge each other instead of stacking.
    for (let i = 0; i < bodies.length; i += 1) {
      const a = bodies[i];
      for (let j = i + 1; j < bodies.length; j += 1) {
        const b = bodies[j];
        const dx = b.x + b.w / 2 - (a.x + a.w / 2);
        const dy = b.y + b.h / 2 - (a.y + a.h / 2);
        const ox = (a.w + b.w) / 2 + 4 - Math.abs(dx);
        const oy = (a.h + b.h) / 2 + 4 - Math.abs(dy);
        if (ox <= 0 || oy <= 0) continue;
        // Push along the axis with less overlap (boxes, not circles).
        const s = 0.18;
        if (ox < oy * 2.2) {
          const p = Math.sign(dx || 1) * ox * s;
          if (drag?.b !== a) a.vx -= p;
          if (drag?.b !== b) b.vx += p;
        } else {
          const p = Math.sign(dy || 1) * oy * s;
          if (drag?.b !== a) a.vy -= p;
          if (drag?.b !== b) b.vy += p;
        }
      }
    }

    for (const b of bodies) {
      energy += Math.abs(b.vx) + Math.abs(b.vy);
      const tilt = b.rot + Math.max(-12, Math.min(12, b.vx * 1.6));
      b.el.style.transform = `translate3d(${b.x}px, ${b.y}px, 0) rotate(${tilt}deg)`;
    }

    still = energy < 0.05 * bodies.length && !drag;
    if (!still && visible) raf = requestAnimationFrame(tick);
  }

  function down(event: PointerEvent, el: HTMLElement): void {
    const b = bodies.find((x) => x.el === el);
    if (!b) return;
    el.setPointerCapture(event.pointerId);
    drag = { b, dx: event.clientX - b.x, dy: event.clientY - b.y, lx: event.clientX, ly: event.clientY, lt: performance.now(), moved: 0 };
    b.vx = 0;
    b.vy = 0;
    el.classList.add('held');
    wake();
  }

  function move(event: PointerEvent): void {
    if (!drag) return;
    const now = performance.now();
    const dt = Math.max(8, now - drag.lt);
    const b = drag.b;
    // Velocity in px/frame so the fling carries on after release.
    b.vx = ((event.clientX - drag.lx) / dt) * 16;
    b.vy = ((event.clientY - drag.ly) / dt) * 16;
    drag.moved += Math.abs(event.clientX - drag.lx) + Math.abs(event.clientY - drag.ly);
    drag.lx = event.clientX;
    drag.ly = event.clientY;
    drag.lt = now;
    b.x = event.clientX - drag.dx;
    b.y = event.clientY - drag.dy;
    wake();
  }

  function up(): void {
    if (!drag) return;
    const { b, moved } = drag;
    b.el.classList.remove('held');
    drag = null;
    // A tap (not a drag) picks that sticker's group.
    if (moved < 6) {
      choose(b.gi === active ? -1 : b.gi);
      b.vy -= 4;
    } else navigator.vibrate?.(4);
    wake();
  }

  function choose(i: number): void {
    active = i;
    navigator.vibrate?.(6);
    wake();
  }

  function shake(): void {
    for (const b of bodies) {
      b.vx += (Math.random() - 0.5) * 22;
      b.vy += (Math.random() - 0.5) * 22;
    }
    navigator.vibrate?.([8, 40, 8]);
    wake();
  }

  onMount(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Wait a frame so fonts/layout have sizes.
    requestAnimationFrame(() => {
      measure();
      if (reduce) {
        // Scatter once and stay put.
        for (let n = 0; n < 200; n += 1) tick();
      }
    });
    const ro = new ResizeObserver(() => measure());
    ro.observe(board);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting && !reduce;
      if (visible) wake();
    });
    io.observe(board);
    return () => {
      ro.disconnect();
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  });
</script>

<div class="wrap">
  <div class="chips" role="radiogroup" aria-label="Interest groups">
    <button type="button" role="radio" aria-checked={active === -1} class:on={active === -1} onclick={() => choose(-1)}>All</button>
    {#each groups as g, i (g.id)}
      <button type="button" role="radio" aria-checked={active === i} class:on={active === i} style="--g: {i}" onclick={() => choose(i)}>
        <Icon name={g.icon} size={14} stroke={active === i ? 2 : 1.5} />
        {g.label}
      </button>
    {/each}
  </div>

  <!-- Drag, fling, tap. The list is still a list for screen readers. -->
  <div class="stage">
  <ul class="board" class:focus={active >= 0} bind:this={board} aria-label="Interests">
    {#each stickers as s (s.id)}
      <li
        class="sticker"
        class:lit={s.gi === active}
        data-g={s.gi}
        style="--g: {s.gi}"
        onpointerdown={(e) => down(e, e.currentTarget)}
        onpointermove={move}
        onpointerup={up}
        onpointercancel={up}
      >
        {s.label}
      </li>
    {/each}
  </ul>
  <button type="button" class="shake press" onclick={shake} aria-label="Shake the board">
    <Icon name="sparkle" size={14} stroke={2} /> shake
  </button>
  </div>

  <div class="blurb" aria-live="polite">
    {#if group}
      {#key group.id}
        <p><strong><Icon name={group.icon} size={14} stroke={2} /> {group.label}</strong> {group.blurb}</p>
      {/key}
    {:else}
      <p class="hint">Drag them around, fling them, tap one to pull its whole group in.</p>
    {/if}
  </div>
</div>

<style>
  .wrap {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: var(--s-3);
  }

  .chips {
    display: flex;
    gap: 6px;
    overflow-x: auto;
    scrollbar-width: none;
    margin-inline: calc(-1 * var(--gutter));
    padding-inline: var(--gutter);
  }

  .chips::-webkit-scrollbar {
    display: none;
  }

  .chips button {
    flex: none;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-height: 36px;
    padding-inline: 12px;
    border-radius: var(--r-pill);
    font-size: var(--t-small);
    font-weight: 500;
    color: var(--color-ink-dim);
    box-shadow: 0 0 0 1px var(--color-line);
    transition-property: color, background-color, box-shadow, scale;
    transition-duration: 250ms;
    transition-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .chips button:active {
    scale: 0.94;
  }

  .chips button.on {
    color: var(--color-on-accent);
    background: var(--color-accent);
    box-shadow: none;
  }

  .stage {
    position: relative;
  }

  .board {
    position: relative;
    list-style: none;
    height: clamp(380px, 118vw, 460px);
    border-radius: var(--r-card);
    overflow: hidden;
    touch-action: pan-y;
    background:
      radial-gradient(circle at 50% 50%, color-mix(in oklch, var(--color-accent) 10%, transparent), transparent 70%),
      var(--color-surface);
    box-shadow: 0 0 0 1px var(--color-line);
    user-select: none;
    -webkit-user-select: none;
  }

  .sticker {
    /* Six hues walked around the accent so groups read as families. */
    --tint: oklch(0.72 0.14 calc(20 + var(--g) * 55));
    position: absolute;
    top: 0;
    left: 0;
    padding: 6px 11px;
    border-radius: 999px;
    font-size: var(--t-meta);
    font-weight: 600;
    line-height: 1.25;
    max-width: min(170px, 62%);
    text-align: center;
    color: var(--color-ink);
    background: color-mix(in oklch, var(--tint) 22%, var(--color-raised));
    box-shadow:
      0 0 0 1px color-mix(in oklch, var(--tint) 40%, transparent),
      0 8px 18px -10px oklch(0 0 0 / 0.6);
    cursor: grab;
    touch-action: none;
    will-change: transform;
    transition-property: opacity, background-color, color, filter;
    transition-duration: 300ms;
  }

  .sticker:global(.held) {
    cursor: grabbing;
    filter: brightness(1.15);
    z-index: 2;
  }

  .focus .sticker:not(.lit) {
    opacity: 0.35;
  }

  .sticker.lit {
    color: var(--color-on-accent);
    background: var(--color-accent);
    z-index: 1;
  }

  .shake {
    position: absolute;
    right: 10px;
    bottom: 10px;
    z-index: 3;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 32px;
    padding-inline: 12px;
    border-radius: 999px;
    font-family: var(--font-mono);
    font-size: var(--t-micro);
    color: var(--color-ink-dim);
    background: color-mix(in oklch, var(--color-bg) 70%, transparent);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    box-shadow: 0 0 0 1px var(--color-line);
  }

  .blurb {
    min-height: 3em;
    font-size: var(--t-small);
    color: var(--color-ink-dim);
    line-height: 1.5;
  }

  .blurb p {
    animation: blurb-in 400ms cubic-bezier(0.2, 0, 0, 1);
  }

  .blurb strong {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    margin-right: 4px;
    color: var(--color-ink);
  }

  .hint {
    font-family: var(--font-mono);
    font-size: var(--t-micro);
    color: var(--color-ink-faint);
  }

  @keyframes blurb-in {
    from {
      opacity: 0;
      translate: 0 6px;
    }
  }
</style>
