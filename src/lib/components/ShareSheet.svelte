<script lang="ts">
  import CopyButton from './CopyButton.svelte';
  import Icon from './Icon.svelte';
  import Logo from './Logo.svelte';
  import QrCode from './QrCode.svelte';
  import { app } from '$lib/app.svelte.ts';
  import type { Link } from '$lib/data/types';
  import { pageHref } from '$lib/utils/urls';

  interface Props {
    open: boolean;
    url: string;
    name: string;
    links: Link[];
    onshare: () => void;
    onclose: () => void;
  }

  let { open, url, name, links, onshare, onclose }: Props = $props();

  /** Two snap heights, like an iOS sheet: medium (default) and large. */
  let expanded = $state(false);
  /** The sheet slides sideways between the link list and a big QR code. */
  let view = $state<'list' | 'qr'>('list');
  let qrFor = $state('card');

  let dialog: HTMLDialogElement;

  /*
   * Native-feeling sheet: drag it down to dismiss (rubber-bands if you pull
   * up), and it slides away instead of vanishing when closed any other way.
   */
  let dragY = $state(0);
  let dragging = $state(false);
  let leaving = $state(false);
  let start = { y: 0, t: 0 };

  function dismiss(): void {
    if (leaving) return;
    leaving = true;
    navigator.vibrate?.(4);
    window.setTimeout(() => {
      onclose();
      leaving = false;
      dragY = 0;
      expanded = false;
      view = 'list';
    }, 260);
  }

  function grab(event: PointerEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.grab-zone') || target.closest('button, a')) return;
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    dragging = true;
    start = { y: event.clientY, t: performance.now() };
  }

  function pull(event: PointerEvent): void {
    if (!dragging) return;
    const dy = event.clientY - start.y;
    // Pulling up grows toward the large detent; past it, rubber-band.
    dragY = dy > 0 ? dy : expanded ? dy * 0.15 : Math.max(dy, -140) + Math.min(0, dy + 140) * 0.15;
  }

  function release(event: PointerEvent): void {
    if (!dragging) return;
    dragging = false;
    const velocity = (event.clientY - start.y) / Math.max(1, performance.now() - start.t);
    if (dragY < -60 || velocity < -0.6) {
      if (!expanded) navigator.vibrate?.(5);
      expanded = true;
    } else if (dragY > 120 || velocity > 0.7) {
      if (expanded) {
        expanded = false;
        navigator.vibrate?.(5);
      } else dismiss();
    }
    dragY = 0;
  }

  /** Both cards, then every profile link — everything worth handing someone. */
  const rows = $derived.by(() => {
    const origin = url ? new URL(url).origin : '';
    const casual = origin ? new URL(pageHref('/'), origin).href : url;
    const pro = origin ? new URL(pageHref('/pro'), origin).href : url;
    return [
      { id: 'card', label: 'Card', icon: 'contact' as const, href: casual },
      { id: 'pro', label: 'Pro card', icon: 'code' as const, href: pro },
      { id: 'links', label: 'Link page', icon: 'globe' as const, href: origin ? new URL(pageHref('/links'), origin).href : url },
      ...links.filter((l) => !l.href.startsWith('mailto:')).map((l) => ({ id: l.id, label: l.label, icon: l.icon, href: l.href })),
    ];
  });

  const qrRow = $derived(rows.find((r) => r.id === qrFor) ?? rows[0]);
  const qrValue = $derived(qrRow ? (['card', 'pro', 'links'].includes(qrRow.id) ? `${qrRow.href}?via=qr` : qrRow.href) : '');

  /* ---------- swipe a row right to copy it ---------- */

  let slide = $state<{ id: string; dx: number } | null>(null);
  let slideFrom = { x: 0, y: 0 };
  let slid = false;

  function rowDown(event: PointerEvent, id: string): void {
    slideFrom = { x: event.clientX, y: event.clientY };
    slide = { id, dx: 0 };
    if (event.pointerType === 'mouse') (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    slid = false;
  }

  function rowMove(event: PointerEvent): void {
    if (!slide) return;
    const dx = event.clientX - slideFrom.x;
    const dy = event.clientY - slideFrom.y;
    if (!slid && Math.abs(dy) > Math.abs(dx)) {
      slide = null;
      return;
    }
    if (Math.abs(dx) > 6) slid = true;
    const pulled = Math.max(0, dx);
    // Past the threshold it resists, so you feel it "catch".
    slide.dx = pulled < 90 ? pulled : 90 + (pulled - 90) * 0.25;
    if (pulled >= 90 && slide.dx - 90 < 1) navigator.vibrate?.(4);
  }

  async function rowUp(row: { label: string; href: string }): Promise<void> {
    if (!slide) return;
    const done = slide.dx >= 90;
    slide = null;
    if (!done) return;
    try {
      await navigator.clipboard.writeText(row.href);
      app.say(`${row.label} link copied`);
      navigator.vibrate?.([6, 40, 10]);
    } catch {
      app.say(row.href);
    }
  }

  const pretty = (href: string) => href.replace(/^https?:\/\//, '').replace(/\/$/, '');

  $effect(() => {
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      dialog.focus();
      document.documentElement.classList.add('locked');
    }
    if (!open && dialog.open) dialog.close();
  });
</script>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
<dialog
  bind:this={dialog}
  class="sheet"
  aria-labelledby="share-title"
  tabindex="-1"
  onclose={() => {
    document.documentElement.classList.remove('locked');
    onclose();
  }}
  oncancel={(e) => {
    e.preventDefault();
    dismiss();
  }}
  onclick={(e) => {
    if (e.target === dialog) dismiss();
  }}
>
  <!-- Drag handling is a gesture on top of the Close button and Esc. -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="panel"
    class:dragging
    class:leaving
    class:expanded
    style="translate: 0 {dragY}px"
    onpointerdown={grab}
    onpointermove={pull}
    onpointerup={release}
    onpointercancel={release}
  >
    <div class="grab-zone">
    <span class="grabber" aria-hidden="true"></span>
    <header>
      <h2 id="share-title">Share {name}</h2>
      <button type="button" class="close press" onclick={dismiss} aria-label="Close">
        <Icon name="close" size={18} />
      </button>
    </header>
    </div>

    <div class="panes" class:qr={view === 'qr'}>
      <div class="pane" inert={view !== 'list'}>
        <div class="quick">
          <button type="button" class="big press" onclick={onshare}>
            <Icon name="share" size={20} stroke={2} />
            <span>Share…</span>
          </button>
          <button type="button" class="big press" onclick={() => (view = 'qr')}>
            <Icon name="qr" size={20} stroke={2} />
            <span>QR code</span>
          </button>
        </div>

        <p class="tip">Swipe a link right to copy it · drag the sheet up for more</p>

        <ul class="rows">
          {#each rows as row, i (row.id)}
            <li style="--i: {i}">
              <span class="copy-bg" aria-hidden="true" style="opacity: {slide?.id === row.id ? Math.min(1, slide.dx / 90) : 0}">
                <Icon name={slide?.id === row.id && slide.dx >= 90 ? 'check' : 'copy'} size={16} stroke={2} /> Copy
              </span>
              <a
                href={row.href}
                target="_blank"
                rel="noopener me"
                draggable="false"
                class:sliding={slide?.id === row.id}
                style="translate: {slide?.id === row.id ? slide.dx : 0}px 0"
                onpointerdown={(e) => rowDown(e, row.id)}
                onpointermove={rowMove}
                onpointerup={() => rowUp(row)}
                onpointercancel={() => (slide = null)}
                onclick={(e) => {
                  if (slid) {
                    e.preventDefault();
                    slid = false;
                  }
                }}
              >
                <span class="ico"><Icon name={row.icon} size={16} /></span>
                <span class="txt">
                  <strong>{row.label}</strong>
                  <span>{pretty(row.href)}</span>
                </span>
              </a>
              <button type="button" class="mini-qr press" aria-label="QR for {row.label}" onclick={() => ((qrFor = row.id), (view = 'qr'))}>
                <Icon name="qr" size={15} />
              </button>
              <CopyButton value={row.href} label="Copy {row.label} link" done="{row.label} link copied" />
            </li>
          {/each}
        </ul>
      </div>

      <div class="pane qr-pane" inert={view !== 'qr'}>
        <button type="button" class="back press" onclick={() => (view = 'list')}>
          <Icon name="chevron-left" size={16} /> Links
        </button>
        {#key qrValue}
          <div class="code">
            <QrCode value={qrValue} label="QR code for {qrRow?.label}" />
            <span class="badge" aria-hidden="true"><Logo size={24} /></span>
          </div>
        {/key}
        <div class="qr-pick" role="radiogroup" aria-label="QR for">
          {#each rows.slice(0, 3) as row (row.id)}
            <button type="button" role="radio" aria-checked={qrFor === row.id} class:on={qrFor === row.id} onclick={() => (qrFor = row.id)}>
              {row.label}
            </button>
          {/each}
        </div>
        <p class="tip">Hold your phone up — they scan, the card opens with the tap sequence.</p>
      </div>
    </div>
  </div>
</dialog>

<style>
  .sheet {
    position: fixed;
    inset: auto 0 0;
    width: 100%;
    max-width: 460px;
    max-height: 96dvh;
    margin: 0 auto;
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--color-ink);
    overflow: visible;
    outline: none;
  }

  .sheet::backdrop {
    background: oklch(0 0 0 / 0.55);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
  }

  .panel {
    display: grid;
    gap: var(--s-4);
    max-height: 64dvh;
    overflow-x: hidden;
    overflow-y: auto;
    overscroll-behavior: contain;
    padding: 10px var(--s-5) calc(var(--s-5) + env(safe-area-inset-bottom));
    border-radius: 28px 28px 0 0;
    background: var(--color-surface);
    box-shadow: var(--shadow-card);
    animation: rise 520ms cubic-bezier(0.34, 1.3, 0.5, 1);
    transition:
      translate 480ms cubic-bezier(0.34, 1.3, 0.5, 1),
      max-height 520ms cubic-bezier(0.34, 1.2, 0.5, 1),
      border-radius 300ms;
  }

  /* Large detent: nearly full screen, squarer corners like iOS. */
  .panel.expanded {
    max-height: 94dvh;
    border-radius: 20px 20px 0 0;
  }

  .panel.dragging {
    transition: none;
  }

  .panel.leaving {
    translate: 0 110% !important;
    transition: translate 260ms cubic-bezier(0.4, 0, 1, 1);
  }

  .sheet:has(.leaving)::backdrop {
    opacity: 0;
    transition: opacity 260ms;
  }

  @media (min-width: 560px) {
    .sheet {
      inset: 0;
      margin: auto;
      height: fit-content;
    }

    .panel {
      border-radius: 28px;
    }
  }

  .grab-zone {
    display: grid;
    gap: var(--s-4);
    margin: -10px calc(-1 * var(--s-5)) 0;
    padding: 10px var(--s-5) 0;
    touch-action: none;
    cursor: grab;
  }

  .grabber {
    justify-self: center;
    width: 36px;
    height: 5px;
    border-radius: 3px;
    background: var(--color-line-strong);
  }

  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  h2 {
    font-size: var(--t-title);
    font-weight: 600;
  }

  .close {
    display: grid;
    place-items: center;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: var(--color-raised);
    color: var(--color-ink-dim);
  }

  .quick {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--s-2);
  }

  .big {
    display: grid;
    justify-items: center;
    gap: 6px;
    padding: var(--s-3);
    border-radius: 16px;
    font-size: var(--t-small);
    font-weight: 600;
    background: var(--color-raised);
    transition-property: scale, background-color;
    transition-duration: 150ms;
  }

  .big:first-child {
    color: var(--color-on-accent);
    background: var(--color-accent);
  }

  /* Two panes side by side; the sheet slides between them. */
  .panes {
    display: grid;
    grid-template-columns: 100% 100%;
    align-items: start;
    transition: translate 520ms cubic-bezier(0.34, 1.2, 0.5, 1);
  }

  .panes.qr {
    translate: -100% 0;
  }

  .pane {
    display: grid;
    gap: var(--s-3);
    min-width: 0;
    transition: opacity 300ms;
  }

  .pane[inert] {
    opacity: 0;
  }

  .tip {
    font-family: var(--font-mono);
    font-size: var(--t-micro);
    text-align: center;
    color: var(--color-ink-faint);
  }

  .qr-pane {
    justify-items: center;
  }

  .back {
    justify-self: start;
    display: inline-flex;
    align-items: center;
    gap: 2px;
    min-height: 36px;
    padding-right: 10px;
    border-radius: 10px;
    font-size: var(--t-small);
    font-weight: 600;
    color: var(--color-ink-dim);
  }

  .code {
    --qr-bg: var(--dither-light);
    --qr-ink: var(--dither-dark);
    position: relative;
    width: min(100%, 300px);
    border-radius: 20px;
    overflow: hidden;
    animation: qr-in 480ms cubic-bezier(0.34, 1.35, 0.5, 1);
  }

  .badge {
    position: absolute;
    top: 50%;
    left: 50%;
    display: grid;
    place-items: center;
    width: 48px;
    height: 48px;
    translate: -50% -50%;
    border-radius: 13px;
    color: var(--color-accent);
    background: var(--dither-light);
    box-shadow: 0 0 0 4px var(--dither-light);
  }

  .qr-pick {
    display: flex;
    gap: 4px;
    padding: 3px;
    border-radius: 12px;
    background: var(--color-raised);
  }

  .qr-pick button {
    min-height: 34px;
    padding-inline: 12px;
    border-radius: 9px;
    font-size: var(--t-small);
    font-weight: 600;
    color: var(--color-ink-dim);
    transition: background-color 200ms, color 200ms;
  }

  .qr-pick button.on {
    color: var(--color-ink);
    background: var(--color-surface);
    box-shadow: var(--shadow-float);
  }

  .mini-qr {
    display: grid;
    place-items: center;
    flex: none;
    width: 36px;
    height: 36px;
    border-radius: 10px;
    color: var(--color-ink-faint);
  }

  .copy-bg {
    position: absolute;
    inset: 0 auto 0 0;
    display: flex;
    align-items: center;
    gap: 6px;
    padding-left: 14px;
    width: 100%;
    border-radius: 12px;
    font-size: var(--t-small);
    font-weight: 600;
    color: var(--color-on-accent);
    background: var(--color-accent);
    pointer-events: none;
  }

  li a {
    position: relative;
    background: var(--color-surface);
    touch-action: pan-y;
    -webkit-user-drag: none;
    user-select: none;
    transition: translate 420ms cubic-bezier(0.34, 1.4, 0.5, 1), background-color 150ms !important;
  }

  li a.sliding {
    transition: none !important;
  }

  @keyframes qr-in {
    from {
      opacity: 0;
      scale: 0.9;
      rotate: -3deg;
    }
  }

  .rows {
    list-style: none;
    display: grid;
    gap: 2px;
  }

  li {
    position: relative;
    display: flex;
    align-items: center;
    gap: var(--s-2);
    min-width: 0;
    animation: row-in 420ms cubic-bezier(0.2, 0, 0, 1) both;
    animation-delay: calc(80ms + var(--i) * 30ms);
  }

  li a {
    flex: 1;
    display: flex;
    align-items: center;
    gap: var(--s-3);
    min-width: 0;
    padding: 8px;
    border-radius: 12px;
    color: inherit;
    text-decoration: none;
    transition-property: background-color;
    transition-duration: 150ms;
  }

  li a:hover {
    background: var(--color-hover);
  }

  .ico {
    display: grid;
    place-items: center;
    flex: none;
    width: 34px;
    height: 34px;
    border-radius: 10px;
    background: var(--color-raised);
  }

  .txt {
    display: grid;
    min-width: 0;
    line-height: 1.3;
  }

  .txt strong {
    font-size: var(--t-small);
    font-weight: 600;
  }

  .txt span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-family: var(--font-mono);
    font-size: var(--t-micro);
    color: var(--color-ink-faint);
  }

  @keyframes rise {
    from {
      transform: translateY(60px);
      opacity: 0;
    }
  }

  @keyframes row-in {
    from {
      opacity: 0;
      translate: 0 6px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .panel,
    li {
      animation: none;
    }
  }
</style>
