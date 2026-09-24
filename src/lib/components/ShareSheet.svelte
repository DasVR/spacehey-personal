<script lang="ts">
  import CopyButton from './CopyButton.svelte';
  import Icon from './Icon.svelte';
  import type { Link } from '$lib/data/types';
  import { pageHref } from '$lib/utils/urls';

  interface Props {
    open: boolean;
    url: string;
    name: string;
    links: Link[];
    onshare: () => void;
    onqr: () => void;
    onclose: () => void;
  }

  let { open, url, name, links, onshare, onqr, onclose }: Props = $props();

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
    dragY = dy > 0 ? dy : dy * 0.18;
  }

  function release(event: PointerEvent): void {
    if (!dragging) return;
    dragging = false;
    const velocity = (event.clientY - start.y) / Math.max(1, performance.now() - start.t);
    if (dragY > 120 || velocity > 0.7) dismiss();
    else dragY = 0;
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

    <div class="quick">
      <button type="button" class="big press" onclick={onshare}>
        <Icon name="share" size={20} stroke={2} />
        <span>Share…</span>
      </button>
      <button type="button" class="big press" onclick={onqr}>
        <Icon name="qr" size={20} stroke={2} />
        <span>QR code</span>
      </button>
    </div>

    <ul class="rows">
      {#each rows as row, i (row.id)}
        <li style="--i: {i}">
          <a href={row.href} target="_blank" rel="noopener me">
            <span class="ico"><Icon name={row.icon} size={16} /></span>
            <span class="txt">
              <strong>{row.label}</strong>
              <span>{pretty(row.href)}</span>
            </span>
          </a>
          <CopyButton value={row.href} label="Copy {row.label} link" done="{row.label} link copied" />
        </li>
      {/each}
    </ul>
  </div>
</dialog>

<style>
  .sheet {
    position: fixed;
    inset: auto 0 0;
    width: 100%;
    max-width: 460px;
    max-height: 88dvh;
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
    max-height: 88dvh;
    overflow: auto;
    overscroll-behavior: contain;
    padding: 10px var(--s-5) calc(var(--s-5) + env(safe-area-inset-bottom));
    border-radius: 28px 28px 0 0;
    background: var(--color-surface);
    box-shadow: var(--shadow-card);
    animation: rise 520ms cubic-bezier(0.34, 1.3, 0.5, 1);
    transition: translate 480ms cubic-bezier(0.34, 1.3, 0.5, 1);
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

  .rows {
    list-style: none;
    display: grid;
    gap: 2px;
  }

  li {
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
