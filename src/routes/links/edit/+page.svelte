<script lang="ts">
  import { onMount } from 'svelte';
  import { flip } from 'svelte/animate';
  import Icon from '$lib/components/Icon.svelte';
  import { app } from '$lib/app.svelte.ts';
  import linkData from '$lib/data/links.json';
  import { identity } from '$lib/data/profile';
  import type { IconName, Link } from '$lib/data/types';
  import { LINK_ICONS, iconForUrl, parseLinks, safeHref, slugId } from '$lib/links';
  import { pageHref } from '$lib/utils/urls';

  /** GitHub's in-browser editor for the file; paste the copied JSON and commit. */
  const EDIT_URL = 'https://github.com/DasVR/spacehey-personal/edit/main/src/lib/data/links.json';
  const DRAFT_KEY = 'links-draft';

  type Tab = 'casual' | 'pro';
  interface Row extends Link {
    /** true once the icon was picked by hand, so URL edits stop re-guessing it. */
    pinnedIcon?: boolean;
  }

  let tab = $state<Tab>('casual');
  let lists = $state<Record<Tab, Row[]>>({
    casual: parseLinks(linkData.casual),
    pro: parseLinks(linkData.pro),
  });
  let open = $state<string | null>(null);
  const rows = $derived(lists[tab]);

  const json = $derived(
    JSON.stringify(
      Object.fromEntries(
        (['casual', 'pro'] as Tab[]).map((t) => [
          t,
          lists[t]
            .filter((r) => r.label.trim() && safeHref(r.href))
            .map(({ id, label, href, icon, detail, featured, pinnedIcon }) => ({
              id,
              label: label.trim(),
              href: href.trim(),
              ...(pinnedIcon || icon !== iconForUrl(href) ? { icon } : {}),
              ...(detail?.trim() ? { detail: detail.trim() } : {}),
              ...(featured ? { featured: true } : {}),
            })),
        ]),
      ),
      null,
      2,
    ) + '\n',
  );
  const changed = $derived(json !== JSON.stringify(linkData, null, 2) + '\n');

  onMount(() => {
    try {
      localStorage.setItem('roll-owner', '1');
      const draft = localStorage.getItem(DRAFT_KEY);
      if (draft) {
        const d = JSON.parse(draft);
        lists = { casual: parseLinks(d.casual), pro: parseLinks(d.pro) };
      }
    } catch {
      /* no storage: start from the file */
    }
  });

  $effect(() => {
    try {
      localStorage.setItem(DRAFT_KEY, json);
    } catch {
      /* ignore */
    }
  });

  function update(id: string, patch: Partial<Row>): void {
    lists[tab] = lists[tab].map((r) => {
      if (r.id !== id) return r;
      const next = { ...r, ...patch };
      if (patch.href !== undefined && !next.pinnedIcon) next.icon = iconForUrl(patch.href);
      return next;
    });
  }

  function feature(id: string): void {
    lists[tab] = lists[tab].map((r) => ({ ...r, featured: r.id === id ? !r.featured : false }));
    navigator.vibrate?.(6);
  }

  function add(): void {
    const id = slugId('new link', new Set(rows.map((r) => r.id)));
    lists[tab] = [...lists[tab], { id, label: 'New link', href: 'https://', icon: 'globe' }];
    open = id;
    navigator.vibrate?.(6);
  }

  function remove(id: string): void {
    lists[tab] = lists[tab].filter((r) => r.id !== id);
    if (open === id) open = null;
    navigator.vibrate?.([6, 30, 6]);
  }

  function reset(): void {
    lists = { casual: parseLinks(linkData.casual), pro: parseLinks(linkData.pro) };
    open = null;
    app.say('Back to the published links');
  }

  /* ---------- drag to reorder ---------- */

  let list = $state<HTMLUListElement>();
  let drag = $state<{ id: string; dy: number } | null>(null);
  let dragStart = 0;

  function grip(event: PointerEvent, id: string): void {
    event.preventDefault();
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    dragStart = event.clientY;
    drag = { id, dy: 0 };
    open = null;
    navigator.vibrate?.(8);
  }

  function gripMove(event: PointerEvent): void {
    if (!drag) return;
    drag.dy = event.clientY - dragStart;
    // Swap with a neighbour once the row passes the middle of it.
    if (!list) return;
    const items = [...list.children] as HTMLElement[];
    const i = lists[tab].findIndex((r) => r.id === drag!.id);
    const me = items[i];
    if (!me) return;
    // Layout offsets, not client rects: the flip animation transforms rows mid-move.
    const mid = me.offsetTop + me.offsetHeight / 2 + drag.dy;
    const below = items[i + 1];
    const above = items[i - 1];
    const move = (to: number) => {
      const arr = [...lists[tab]];
      const [row] = arr.splice(i, 1);
      arr.splice(to, 0, row);
      lists[tab] = arr;
      const shift = (to > i ? 1 : -1) * (me.offsetHeight + 6);
      dragStart += shift;
      drag!.dy -= shift;
      navigator.vibrate?.(3);
    };
    if (below && mid > below.offsetTop + below.offsetHeight / 2) move(i + 1);
    else if (above && mid < above.offsetTop + above.offsetHeight / 2) move(i - 1);
  }

  function gripEnd(): void {
    drag = null;
  }

  /* ---------- swipe left to delete ---------- */

  let swipe = $state<{ id: string; dx: number } | null>(null);
  let swipeStart = { x: 0, y: 0 };

  function swipeDown(event: PointerEvent, id: string): void {
    if ((event.target as HTMLElement).closest('.grip, input, select, button:not(.head)')) return;
    swipeStart = { x: event.clientX, y: event.clientY };
    swipe = { id, dx: 0 };
  }

  function swipeMove(event: PointerEvent): void {
    if (!swipe) return;
    const dx = event.clientX - swipeStart.x;
    const dy = event.clientY - swipeStart.y;
    if (Math.abs(dy) > Math.abs(dx) && Math.abs(swipe.dx) < 4) {
      swipe = null;
      return;
    }
    swipe.dx = Math.min(0, dx > 0 ? dx * 0.2 : dx);
  }

  function swipeUp(): void {
    if (!swipe) return;
    if (swipe.dx < -110) remove(swipe.id);
    swipe = null;
  }

  async function copy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(json);
      app.say('links.json copied — paste it on GitHub');
    } catch {
      app.say('Couldn’t reach the clipboard');
    }
  }

  function download(): void {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
    a.download = 'links.json';
    a.click();
    URL.revokeObjectURL(a.href);
  }
</script>

<svelte:head>
  <title>Edit links · {identity.host}</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<main class="edit">
  <header>
    <a class="back" href={pageHref('/links')}><Icon name="chevron-left" size={16} /> Link page</a>
    <h1>Your links</h1>
    <p class="lead">Drag <span class="kbd">⋮⋮</span> to reorder, swipe a row left to delete, tap to edit. Star one to make it the big button.</p>
  </header>

  <div class="tabs" data-tab={tab}>
    <span class="thumb" aria-hidden="true"></span>
    <button type="button" class:on={tab === 'casual'} onclick={() => ((tab = 'casual'), (open = null))}>Casual card</button>
    <button type="button" class:on={tab === 'pro'} onclick={() => ((tab = 'pro'), (open = null))}>Pro card</button>
  </div>

  <div class="layout">
    <section class="editor" aria-label="Links">
      {#key tab}
        <ul class="rows" bind:this={list} onpointermove={gripMove} onpointerup={gripEnd} onpointercancel={gripEnd}>
          {#each rows as row (row.id)}
            <li
              animate:flip={{ duration: drag?.id === row.id ? 0 : 280 }}
              class:lifted={drag?.id === row.id}
              class:bad={!safeHref(row.href) || !row.label.trim()}
              style="--dy: {drag?.id === row.id ? drag.dy : 0}px; --dx: {swipe?.id === row.id ? swipe.dx : 0}px"
            >
              <span class="bin" aria-hidden="true" style="opacity: {swipe?.id === row.id ? Math.min(1, -swipe.dx / 110) : 0}">
                <Icon name="close" size={18} stroke={2} />
              </span>
              <div
                class="card-row"
                role="group"
                aria-label={row.label}
                onpointerdown={(e) => swipeDown(e, row.id)}
                onpointermove={swipeMove}
                onpointerup={swipeUp}
                onpointercancel={swipeUp}
              >
                <div class="top">
                  <span class="grip" aria-label="Drag to reorder" role="button" tabindex="-1" onpointerdown={(e) => grip(e, row.id)}>⋮⋮</span>
                  <button type="button" class="head" onclick={() => (open = open === row.id ? null : row.id)} aria-expanded={open === row.id}>
                    <span class="ico"><Icon name={row.icon} size={16} /></span>
                    <span class="txt">
                      <strong>{row.label || 'Untitled'}</strong>
                      <span>{row.href.replace(/^https?:\/\//, '')}</span>
                    </span>
                  </button>
                  <button type="button" class="star press" class:on={row.featured} onclick={() => feature(row.id)} aria-pressed={!!row.featured} aria-label="Feature {row.label}">
                    <Icon name="star" size={16} stroke={2} />
                  </button>
                </div>

                <div class="more" inert={open !== row.id} class:open={open === row.id}>
                  <div class="more-inner">
                    <label>
                      <span>Label</span>
                      <input value={row.label} maxlength="40" oninput={(e) => update(row.id, { label: e.currentTarget.value })} />
                    </label>
                    <label>
                      <span>Link</span>
                      <input
                        value={row.href}
                        inputmode="url"
                        autocomplete="off"
                        autocapitalize="off"
                        spellcheck="false"
                        oninput={(e) => update(row.id, { href: e.currentTarget.value.trim() })}
                      />
                      {#if !safeHref(row.href)}<small>Needs to start with https:// or mailto:</small>{/if}
                    </label>
                    <label>
                      <span>Detail <small>(handle, optional)</small></span>
                      <input value={row.detail ?? ''} maxlength="60" placeholder="@arriq" oninput={(e) => update(row.id, { detail: e.currentTarget.value })} />
                    </label>
                    <div class="icons" role="radiogroup" aria-label="Icon">
                      {#each LINK_ICONS as name (name)}
                        <button
                          type="button"
                          role="radio"
                          aria-checked={row.icon === name}
                          aria-label={name}
                          class:on={row.icon === name}
                          onclick={() => update(row.id, { icon: name as IconName, pinnedIcon: true })}
                        >
                          <Icon {name} size={16} />
                        </button>
                      {/each}
                    </div>
                    <button type="button" class="delete" onclick={() => remove(row.id)}>Remove link</button>
                  </div>
                </div>
              </div>
            </li>
          {/each}
        </ul>
      {/key}
      <button type="button" class="add press" onclick={add}><Icon name="plus" size={16} stroke={2} /> Add a link</button>
    </section>

    <aside class="preview" aria-label="Preview">
      <p class="mini">Preview</p>
      <ul class="tree">
        {#each rows.filter((r) => r.label.trim() && safeHref(r.href)) as row (row.id)}
          <li animate:flip={{ duration: 280 }}>
            <span class="tree-row" class:featured={row.featured}>
              <span class="tree-ico"><Icon name={row.icon} size={16} /></span>
              <span class="tree-label">{row.label}</span>
              {#if row.detail}<span class="tree-detail">{row.detail}</span>{/if}
            </span>
          </li>
        {/each}
      </ul>
    </aside>
  </div>

  <div class="publish" class:changed>
    <p>{changed ? 'Unpublished changes (saved on this device).' : 'Matches what’s live.'}</p>
    <div class="actions">
      <button type="button" class="btn primary press" onclick={copy}><Icon name="copy" size={16} stroke={2} /> Copy JSON</button>
      <a class="btn press" href={EDIT_URL} target="_blank" rel="noopener"><Icon name="github" size={16} /> GitHub</a>
      <button type="button" class="btn press" onclick={download} aria-label="Download links.json"><Icon name="download" size={16} /></button>
      {#if changed}<button type="button" class="btn ghost press" onclick={reset}>Reset</button>{/if}
    </div>
  </div>
</main>

<style>
  .edit {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: var(--s-5);
    max-width: 60rem;
    margin-inline: auto;
    padding-block: var(--s-4) calc(var(--s-8) + 80px + env(safe-area-inset-bottom));
  }

  header {
    display: grid;
    gap: var(--s-2);
  }

  .back {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    justify-self: start;
    min-height: 44px;
    font-size: var(--t-small);
    color: var(--color-ink-dim);
    text-decoration: none;
  }

  h1 {
    font-family: var(--font-serif);
    font-weight: 400;
    font-size: clamp(2.25rem, 9vw, 3.25rem);
    line-height: 1;
  }

  .lead {
    color: var(--color-ink-dim);
  }

  .kbd {
    font-family: var(--font-mono);
    color: var(--color-ink);
  }

  /* ---------- tabs ---------- */

  .tabs {
    position: relative;
    display: grid;
    grid-template-columns: 1fr 1fr;
    padding: 3px;
    border-radius: 14px;
    background: var(--color-raised);
  }

  .tabs button {
    position: relative;
    z-index: 1;
    min-height: 40px;
    font-weight: 600;
    font-size: var(--t-small);
    color: var(--color-ink-dim);
    transition: color 200ms;
  }

  .tabs button.on {
    color: var(--color-ink);
  }

  .thumb {
    position: absolute;
    inset: 3px auto 3px 3px;
    width: calc(50% - 3px);
    border-radius: 11px;
    background: var(--color-surface);
    box-shadow: var(--shadow-float);
    transition: translate 420ms cubic-bezier(0.34, 1.35, 0.5, 1);
  }

  [data-tab='pro'] .thumb {
    translate: 100% 0;
  }

  .layout {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: var(--s-5);
  }

  @media (min-width: 820px) {
    .layout {
      grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
      align-items: start;
    }

    .preview {
      position: sticky;
      top: var(--s-5);
    }
  }

  /* ---------- rows ---------- */

  .rows {
    list-style: none;
    display: grid;
    gap: 6px;
    animation: tab-in 380ms cubic-bezier(0.2, 0, 0, 1);
  }

  li {
    position: relative;
    border-radius: 16px;
  }

  .bin {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding-right: 22px;
    border-radius: inherit;
    color: var(--color-on-accent);
    background: var(--color-accent);
  }

  .card-row {
    position: relative;
    border-radius: inherit;
    background: var(--color-surface);
    box-shadow: 0 0 0 1px var(--color-line);
    translate: var(--dx) var(--dy);
    transition:
      translate 380ms cubic-bezier(0.34, 1.3, 0.5, 1),
      box-shadow 200ms,
      scale 200ms;
    touch-action: pan-y;
  }

  .lifted {
    z-index: 5;
  }

  .lifted .card-row {
    scale: 1.03;
    box-shadow:
      0 0 0 1px var(--color-line-strong),
      0 24px 40px -18px oklch(0 0 0 / 0.6);
    transition: scale 200ms, box-shadow 200ms;
  }

  .bad .card-row {
    box-shadow: 0 0 0 1px color-mix(in oklch, var(--color-accent) 60%, transparent);
  }

  .top {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 6px;
  }

  .grip {
    display: grid;
    place-items: center;
    width: 32px;
    height: 44px;
    font-family: var(--font-mono);
    letter-spacing: -2px;
    color: var(--color-ink-faint);
    cursor: grab;
    touch-action: none;
    user-select: none;
  }

  .head {
    display: flex;
    align-items: center;
    gap: var(--s-3);
    flex: 1;
    min-width: 0;
    min-height: 44px;
    text-align: left;
    color: inherit;
  }

  .ico {
    display: grid;
    place-items: center;
    flex: none;
    width: 36px;
    height: 36px;
    border-radius: 11px;
    background: var(--color-raised);
  }

  .txt {
    display: grid;
    min-width: 0;
    line-height: 1.3;
  }

  .txt strong {
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

  .star {
    display: grid;
    place-items: center;
    width: 44px;
    height: 44px;
    border-radius: 12px;
    color: var(--color-ink-faint);
  }

  .star.on {
    color: var(--color-accent);
  }

  .more {
    display: grid;
    grid-template-rows: 0fr;
    opacity: 0;
    transition:
      grid-template-rows 420ms cubic-bezier(0.34, 1.2, 0.5, 1),
      opacity 200ms;
  }

  .more.open {
    grid-template-rows: 1fr;
    opacity: 1;
  }

  .more-inner {
    display: grid;
    gap: var(--s-3);
    min-height: 0;
    overflow: hidden;
    padding-inline: var(--s-3);
  }

  .more.open .more-inner {
    padding-bottom: var(--s-3);
  }

  label {
    display: grid;
    gap: 4px;
    font-size: var(--t-meta);
    font-weight: 600;
    color: var(--color-ink-dim);
  }

  label small {
    font-weight: 400;
    color: var(--color-ink-faint);
  }

  input {
    min-height: 42px;
    padding-inline: var(--s-3);
    border-radius: 10px;
    font: inherit;
    font-size: 16px;
    font-weight: 400;
    color: var(--color-ink);
    background: var(--color-bg);
    border: 1px solid var(--color-line-strong);
  }

  .icons {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  .icons button {
    display: grid;
    place-items: center;
    width: 38px;
    height: 38px;
    border-radius: 10px;
    color: var(--color-ink-dim);
    background: var(--color-raised);
    transition: scale 300ms cubic-bezier(0.34, 1.56, 0.64, 1), background-color 150ms;
  }

  .icons button.on {
    scale: 1.08;
    color: var(--color-on-accent);
    background: var(--color-accent);
  }

  .delete {
    justify-self: start;
    min-height: 36px;
    font-size: var(--t-small);
    font-weight: 600;
    color: var(--color-accent);
  }

  .add {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    width: 100%;
    min-height: 52px;
    margin-top: var(--s-2);
    border-radius: 16px;
    font-weight: 600;
    color: var(--color-ink-dim);
    border: 1.5px dashed var(--color-line-strong);
  }

  /* ---------- preview (mirrors the card) ---------- */

  .mini {
    margin-bottom: var(--s-2);
    font-family: var(--font-mono);
    font-size: var(--t-micro);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--color-ink-faint);
  }

  .preview {
    padding: var(--s-4);
    border-radius: var(--r-card);
    background: var(--color-surface);
    box-shadow: var(--shadow-card);
  }

  .tree {
    list-style: none;
    display: grid;
    gap: 6px;
  }

  .tree-row {
    display: flex;
    align-items: center;
    gap: var(--s-3);
    min-height: 46px;
    padding: 5px 12px 5px 5px;
    border-radius: 14px;
    background: var(--color-raised);
    box-shadow: 0 0 0 1px var(--color-line);
  }

  .tree-row.featured {
    color: var(--color-on-accent);
    background: var(--color-accent);
  }

  .tree-ico {
    display: grid;
    place-items: center;
    width: 34px;
    height: 34px;
    border-radius: 10px;
    background: var(--color-surface);
  }

  .featured .tree-ico {
    background: oklch(1 0 0 / 0.16);
  }

  .tree-label {
    font-weight: 600;
  }

  .tree-detail {
    margin-left: auto;
    font-family: var(--font-mono);
    font-size: var(--t-micro);
    opacity: 0.7;
  }

  /* ---------- publish bar ---------- */

  .publish {
    position: fixed;
    left: 50%;
    bottom: max(12px, env(safe-area-inset-bottom));
    z-index: var(--z-dock);
    display: grid;
    gap: 6px;
    width: min(560px, calc(100% - 24px));
    padding: 10px;
    border-radius: 20px;
    translate: -50% 0;
    background: color-mix(in oklch, var(--color-surface) 85%, transparent);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    box-shadow: var(--shadow-float);
    transition: box-shadow 300ms;
  }

  .publish.changed {
    box-shadow:
      0 0 0 1.5px var(--color-accent),
      var(--shadow-float);
    animation: nudge 500ms cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .publish p {
    padding-inline: 4px;
    font-size: var(--t-micro);
    font-family: var(--font-mono);
    color: var(--color-ink-dim);
  }

  .actions {
    display: flex;
    gap: 6px;
  }

  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    min-height: 44px;
    padding-inline: var(--s-3);
    border-radius: 12px;
    font-size: var(--t-small);
    font-weight: 600;
    white-space: nowrap;
    color: var(--color-ink);
    text-decoration: none;
    background: var(--color-raised);
  }

  .btn.primary {
    flex: 1;
    color: var(--color-on-accent);
    background: var(--color-accent);
  }

  .btn.ghost {
    background: none;
    color: var(--color-ink-dim);
  }

  @keyframes tab-in {
    from {
      opacity: 0;
      translate: 0 8px;
    }
  }

  @keyframes nudge {
    40% {
      scale: 1.03;
    }
  }
</style>
