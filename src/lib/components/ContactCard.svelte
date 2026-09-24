<script lang="ts">
  import { onMount } from 'svelte';
  import { replaceState } from '$app/navigation';
  import { page } from '$app/state';
  import CopyButton from './CopyButton.svelte';
  import DitherImage from './DitherImage.svelte';
  import Icon from './Icon.svelte';
  import Logo from './Logo.svelte';
  import ShareSheet from './ShareSheet.svelte';
  import QrSheet from './QrSheet.svelte';
  import StatusPill from './StatusPill.svelte';
  import { app } from '$lib/app.svelte.ts';
  import { arrivalLabel, arrivalSource, type ArrivalSource } from '$lib/arrival';
  import type { Identity, Link, Mode, Status } from '$lib/data/types';
  import { hourOffset, localTime } from '$lib/utils/time';
  import { assetUrl, pageHref } from '$lib/utils/urls';

  interface Props {
    mode: Mode;
    identity: Identity;
    /** Casual: tagline. Pro: role. */
    headline: string;
    status: string;
    links: Link[];
    /** Short meta rows under the headline. */
    facts: { label: string; value: string }[];
    /** Casual: recent statuses, newest first. */
    statuses?: Status[];
    /** IANA zone for the live local-time row. */
    timezone?: string;
    /** Casual: shown on the back of the poster when it flips. */
    about?: string;
    memberSince?: string;
  }

  let { mode, identity, headline, status, links, facts, statuses, timezone, about, memberSince }: Props = $props();

  let qrOpen = $state(false);
  let shareOpen = $state(false);
  let flipped = $state(false);
  /** Each tap drops a ripple where the finger landed. */
  let ripples = $state<{ id: number; x: number; y: number }[]>([]);

  function flip(event: MouseEvent): void {
    const el = event.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    // Keyboard clicks report 0,0: ripple from the middle instead.
    const x = event.clientX ? event.clientX - rect.left : rect.width / 2;
    const y = event.clientY ? event.clientY - rect.top : rect.height / 2;
    const id = Date.now();
    ripples = [...ripples.slice(-2), { id, x, y }];
    window.setTimeout(() => (ripples = ripples.filter((r) => r.id !== id)), 900);
    flipped = !flipped;
    navigator.vibrate?.(8);
    app.field?.tap();
  }
  let now = $state(Date.now());

  /** "3:12 PM" plus how far that is from the visitor. */
  const clock = $derived.by(() => {
    if (!timezone) return null;
    const off = hourOffset(timezone, now);
    const rel = off === 0 ? 'same as you' : `${off > 0 ? '+' : '−'}${Math.abs(off)}h from you`;
    return { time: localTime(timezone, now), rel };
  });

  let card: HTMLElement;
  let source = $state<ArrivalSource | null>(null);
  let arriving = $state(false);
  let offscreen = $state(false);
  let tilting = $state(false);

  const path = $derived(mode === 'pro' ? '/pro' : '/');
  const vcard = $derived(assetUrl(mode === 'pro' ? '/das-pro.vcf' : '/das.vcf'));
  let shareUrl = $state('');
  let host = $state('');

  onMount(() => {
    const tick = window.setInterval(() => (now = Date.now()), 30_000);
    shareUrl = new URL(pageHref(path), window.location.origin).href;
    host = window.location.host;
    const root = document.documentElement;
    const from = arrivalSource(window.location.search);

    let settle = 0;
    if (from) {
      source = from;
      measureDrop();
      arriving = true;
      root.classList.add('arriving');
      // Let the first painted frame land before the wave starts.
      requestAnimationFrame(() => app.tap());
      settle = window.setTimeout(() => {
        arriving = false;
        root.classList.remove('arrive', 'arriving');
        // A reload or a re-share should not replay the tap.
        const clean = new URL(window.location.href);
        clean.searchParams.delete('via');
        replaceState(clean, page.state);
      }, 2700);
    }

    const io = new IntersectionObserver(([entry]) => (offscreen = !entry.isIntersecting && entry.boundingClientRect.bottom < 0), {
      threshold: 0,
    });
    io.observe(card);
    return () => {
      window.clearInterval(tick);
      window.clearTimeout(settle);
      io.disconnect();
    };
  });

  /** Where the island sits relative to the card, so the card grows out of it. */
  function measureDrop(): void {
    const top = card.getBoundingClientRect().top;
    card.style.setProperty('--drop-y', `${-Math.max(0, top - 16)}px`);
  }

  let replayTimer = 0;
  function replay(): void {
    arriving = false;
    window.scrollTo({ top: 0, behavior: 'instant' });
    requestAnimationFrame(() => {
      measureDrop();
      source = 'nfc';
      arriving = true;
      document.documentElement.classList.add('arriving');
      app.tap();
      window.clearTimeout(replayTimer);
      replayTimer = window.setTimeout(() => {
        arriving = false;
        document.documentElement.classList.remove('arriving');
      }, 2700);
    });
  }

  $effect(() => {
    if (app.replays > 0) replay();
  });

  async function share(): Promise<void> {
    const data = { title: `${identity.name} · ${identity.host}`, text: headline, url: shareUrl };
    if (navigator.share) {
      try {
        await navigator.share(data);
      } catch {
        /* dismissed */
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      app.say('Link copied');
    } catch {
      app.say(shareUrl);
    }
  }

  /* Press and hold a link to copy it instead of opening it. */
  let holdTimer = 0;
  let held = false;
  function holdStart(event: PointerEvent, href: string, label: string): void {
    held = false;
    const el = event.currentTarget as HTMLElement;
    window.clearTimeout(holdTimer);
    holdTimer = window.setTimeout(async () => {
      held = true;
      el.classList.add('copied');
      window.setTimeout(() => el.classList.remove('copied'), 900);
      navigator.vibrate?.([6, 40, 12]);
      try {
        await navigator.clipboard.writeText(href.replace(/^mailto:/, ''));
        app.say(`${label} copied`);
      } catch {
        app.say(href);
      }
    }, 480);
  }

  function holdEnd(): void {
    window.clearTimeout(holdTimer);
  }

  function tilt(event: PointerEvent): void {
    if (event.pointerType !== 'mouse') return;
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    tilting = true;
    card.style.setProperty('--rx', `${(0.5 - y) * 6}deg`);
    card.style.setProperty('--ry', `${(x - 0.5) * 8}deg`);
    card.style.setProperty('--mx', `${x * 100}%`);
    card.style.setProperty('--my', `${y * 100}%`);
  }

  function untilt(): void {
    tilting = false;
    card.style.setProperty('--rx', '0deg');
    card.style.setProperty('--ry', '0deg');
  }
</script>

{#if arriving && source}
  <div class="isl" role="status" aria-live="polite">
    <!-- Metaball filter: blurred black shapes re-thresholded so they melt into each other. -->
    <svg class="isl-defs" width="0" height="0" aria-hidden="true">
      <filter id="isl-goo" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="9" result="blur" />
        <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 28 -12" />
      </filter>
    </svg>
    <div class="goo" aria-hidden="true">
      <span class="lip"></span>
      <span class="neck"></span>
      <span class="blob"></span>
    </div>
    <div class="face">
      <span class="island-avatar">
        <img src={assetUrl(identity.avatar.src)} alt="" />
      </span>
      <span class="island-text">
        <span class="island-kicker">{arrivalLabel(source)} · {host || identity.host}</span>
        <strong>{identity.name}</strong>
      </span>
      <span class="island-rings" aria-hidden="true"><i></i><i></i><i></i><Icon name="nfc" size={16} stroke={2} /></span>
    </div>
  </div>
{/if}

<div class="stage" class:arriving class:intro={!source}>
  <article
    class="card {mode}"
    class:tilting
    bind:this={card}
    onpointermove={tilt}
    onpointerleave={untilt}
    aria-labelledby="card-name"
  >
    <div class="sheen" aria-hidden="true"></div>

    {#if mode === 'casual'}
      <div class="poster-wrap" style="--i: 0">
        <div class="flipper" class:flipped>
          <div class="poster front" inert={flipped}>
            <DitherImage src={identity.avatar.src} alt={identity.avatar.alt} cell={3} eager />
            <div class="poster-top">
              <span class="chip"><Icon name="nfc" size={14} /> tap card</span>
              <span class="serial">003 963 6663</span>
            </div>
            <h1 id="card-name" class="name">{identity.name}</h1>
          </div>
          <div class="poster back" inert={!flipped} aria-hidden={!flipped}>
            <div class="back-head">
              <span class="back-mark"><Logo size={26} /></span>
              <p class="back-kicker">{identity.brand} · about</p>
            </div>
            {#if about}<p class="back-about">{about}</p>{/if}
            <div class="back-foot">
              {#if memberSince}<span>since {memberSince}</span>{/if}
              <span>tap to flip back</span>
            </div>
          </div>
        </div>
        <button type="button" class="flip-hit" onclick={flip} aria-pressed={flipped} aria-label={flipped ? 'Flip the card back' : `Flip the card: about ${identity.name}`}>
          {#each ripples as r (r.id)}
            <span class="ripple" style="left: {r.x}px; top: {r.y}px"></span>
          {/each}
        </button>
      </div>
    {:else}
      <div class="head" style="--i: 0">
        <span class="avatar"><DitherImage src={identity.avatar.src} alt={identity.avatar.alt} cell={2} eager /></span>
        <span class="chip live"><span class="dot"></span>{status}</span>
      </div>
      <h1 id="card-name" class="name" style="--i: 1">{identity.name}</h1>
    {/if}

    <div class="body">
      <p class="headline" style="--i: 1">{headline}</p>
      {#if mode === 'casual' && statuses?.length}
        <div style="--i: 2"><StatusPill {statuses} /></div>
      {/if}

      <dl class="facts" style="--i: 2">
        {#each facts as fact (fact.label)}
          <div>
            <dt>{fact.label}</dt>
            <dd>{fact.value}</dd>
          </div>
        {/each}
        {#if clock}
          <div>
            <dt>Local time</dt>
            <dd class="clock"><Icon name="clock" size={14} /> {clock.time} <span>{clock.rel}</span></dd>
          </div>
        {/if}
      </dl>

      <div class="actions" style="--i: 3">
        <a class="btn primary press" href={vcard} data-sveltekit-reload onclick={() => app.say('Opening contact card')}>
          <Icon name="contact" size={18} stroke={2} />
          <span class="long">Save contact</span><span class="short">Save</span>
        </a>
        <button type="button" class="btn icon press" onclick={() => (shareOpen = true)} aria-label="Share">
          <Icon name="share" size={18} stroke={2} />
        </button>
        <button type="button" class="btn icon press" onclick={() => (qrOpen = true)} aria-label="Show QR code">
          <Icon name="qr" size={18} stroke={2} />
        </button>
        <CopyButton value={shareUrl} label="Copy link" done="Link copied" />
      </div>

      {#if mode === 'casual'}
        <!-- Link-tree stack: the featured link is the big button; hold any row to copy it. -->
        <ul class="tree" style="--i: 4">
          {#each links as link, n (link.id)}
            <li style="--n: {n}">
              <a
                class="tree-row press"
                class:featured={link.featured}
                href={link.href}
                target={link.href.startsWith('mailto:') ? undefined : '_blank'}
                rel="noopener me"
                onpointerdown={(e) => holdStart(e, link.href, link.label)}
                onpointerup={holdEnd}
                onpointerleave={holdEnd}
                onpointercancel={holdEnd}
                onclick={(e) => {
                  if (held) {
                    e.preventDefault();
                    held = false;
                  }
                }}
                oncontextmenu={(e) => e.preventDefault()}
              >
                <span class="tree-ico"><Icon name={link.icon} size={17} /></span>
                <span class="tree-label">{link.label}</span>
                {#if link.detail}<span class="tree-detail">{link.detail}</span>{/if}
                <span class="tree-arrow"><Icon name="arrow" size={14} /></span>
              </a>
            </li>
          {/each}
        </ul>
      {:else}
        <ul class="links" style="--i: 4">
          {#each links as link (link.id)}
            <li>
              <a href={link.href} target={link.href.startsWith('mailto:') ? undefined : '_blank'} rel="noopener me">
                <Icon name={link.icon} size={18} />
                <span class="link-label">{link.label}</span>
                {#if link.detail}<span class="link-detail">{link.detail}</span>{/if}
                <span class="link-arrow"><Icon name="arrow" size={14} /></span>
              </a>
            </li>
          {/each}
        </ul>
      {/if}
    </div>
  </article>
</div>

<a class="dock press" class:show={offscreen} href={vcard} data-sveltekit-reload tabindex={offscreen ? 0 : -1} aria-hidden={!offscreen}>
  <span class="dock-avatar"><DitherImage src={identity.avatar.src} alt="" cell={2} levels={2} develop={false} /></span>
  <span>Save {identity.name}</span>
  <Icon name="contact" size={16} stroke={2} />
</a>

<ShareSheet
  open={shareOpen}
  url={shareUrl}
  name={identity.name}
  {links}
  onshare={share}
  onclose={() => (shareOpen = false)}
/>

<QrSheet open={qrOpen} url={shareUrl ? `${shareUrl}?via=qr` : ''} name={identity.name} onclose={() => (qrOpen = false)} />

<style>
  /* ---------- stage & card ---------- */

  .stage {
    perspective: 1200px;
  }

  .card {
    view-transition-name: card;
    --rx: 0deg;
    --ry: 0deg;
    --mx: 50%;
    --my: 0%;
    position: relative;
    width: 100%;
    max-width: var(--card-w);
    margin-inline: auto;
    padding: var(--r-card-pad);
    border-radius: var(--r-card);
    background: var(--color-surface);
    box-shadow: var(--shadow-card);
    transform: rotateX(var(--rx)) rotateY(var(--ry));
    transform-style: preserve-3d;
    transition-property: transform;
    transition-duration: 500ms;
    transition-timing-function: var(--ease-out);
  }

  /* Ordinary visits get a soft rise. After a tap the card simply stays put. */
  .intro .card {
    animation: card-rise 700ms var(--ease-out) backwards;
  }

  .card.tilting {
    transition-duration: 80ms;
  }

  /* A soft light that follows the cursor across the card. */
  .sheen {
    position: absolute;
    inset: 0;
    z-index: 2;
    border-radius: inherit;
    pointer-events: none;
    background: radial-gradient(40% 30% at var(--mx) var(--my), color-mix(in oklch, var(--color-ink) 7%, transparent), transparent 70%);
    opacity: 0;
    transition-property: opacity;
    transition-duration: 300ms;
  }

  .tilting .sheen {
    opacity: 1;
  }

  /* ---------- casual poster ---------- */

  .poster-wrap {
    position: relative;
    aspect-ratio: 4 / 4.6;
    perspective: 1400px;
  }

  /* A springy 3D flip: overshoots a touch and settles, like a real card. */
  .flipper {
    position: absolute;
    inset: 0;
    transform-style: preserve-3d;
    transition: transform 800ms cubic-bezier(0.34, 1.4, 0.5, 1);
  }

  .flipper.flipped {
    transform: rotateY(180deg);
  }

  .poster {
    position: absolute;
    inset: 0;
    border-radius: var(--r-inner);
    overflow: hidden;
    outline: 1px solid var(--img-outline);
    outline-offset: -1px;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
  }

  .back {
    display: flex;
    flex-direction: column;
    gap: var(--s-3);
    padding: clamp(var(--s-4), 5vw, var(--s-5));
    transform: rotateY(180deg);
    color: var(--dither-light);
    background:
      radial-gradient(120% 80% at 100% 0%, color-mix(in oklch, var(--color-accent) 35%, transparent), transparent 60%),
      var(--dither-dark);
  }

  .back-head {
    display: flex;
    align-items: center;
    gap: var(--s-3);
  }

  .back-mark {
    display: inline-flex;
    color: var(--color-accent);
    transform-origin: 50% 50%;
  }

  .flipped .back-mark {
    animation: mark-spin 900ms cubic-bezier(0.34, 1.56, 0.64, 1) 200ms both;
  }

  .back-kicker {
    font-family: var(--font-mono);
    font-size: var(--t-micro);
    letter-spacing: 0.14em;
    text-transform: uppercase;
    opacity: 0.7;
  }

  .back-about {
    flex: 1;
    min-height: 0;
    overflow: auto;
    font-size: clamp(0.8125rem, 3.9vw, 1.0625rem);
    line-height: 1.45;
    text-wrap: pretty;
  }

  .back-foot {
    display: flex;
    justify-content: space-between;
    gap: var(--s-3);
    font-family: var(--font-mono);
    font-size: var(--t-micro);
    opacity: 0.6;
  }

  .flip-hit {
    position: absolute;
    inset: 0;
    z-index: 3;
    overflow: hidden;
    border-radius: var(--r-inner);
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    transition: scale 300ms cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .flip-hit:active {
    scale: 0.985;
  }

  .flip-hit:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 3px;
  }

  /* Liquid ripple from the tap point. */
  .ripple {
    position: absolute;
    width: 24px;
    height: 24px;
    margin: -12px 0 0 -12px;
    border-radius: 50%;
    pointer-events: none;
    background: radial-gradient(circle, color-mix(in oklch, var(--color-accent) 55%, transparent), transparent 70%);
    animation: ripple 850ms cubic-bezier(0.2, 0, 0, 1) forwards;
  }

  @keyframes ripple {
    from {
      scale: 0.4;
      opacity: 1;
    }
    to {
      scale: 28;
      opacity: 0;
    }
  }

  @keyframes mark-spin {
    from {
      rotate: -140deg;
      scale: 0.4;
      opacity: 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .flipper {
      transition-duration: 1ms;
    }

    .ripple,
    .flipped .back-mark {
      animation: none;
    }
  }

  .front::after {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: linear-gradient(to bottom, transparent 45%, color-mix(in oklch, var(--dither-dark) 85%, transparent));
  }

  .poster-top {
    position: absolute;
    inset: var(--s-3) var(--s-3) auto;
    z-index: 1;
    display: flex;
    justify-content: space-between;
    align-items: center;
    pointer-events: none;
  }

  .serial {
    font-family: var(--font-mono);
    font-size: var(--t-micro);
    letter-spacing: 0.14em;
    color: var(--color-ink);
    mix-blend-mode: difference;
  }

  .chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 26px;
    padding-inline: 10px;
    border-radius: var(--r-pill);
    font-family: var(--font-mono);
    font-size: var(--t-micro);
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--color-ink);
    background: color-mix(in oklch, var(--color-bg) 55%, transparent);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    box-shadow: 0 0 0 1px var(--color-line);
  }

  .name {
    font-family: var(--name-font);
    text-transform: var(--name-case);
    letter-spacing: var(--name-track);
    font-weight: 400;
    line-height: 0.86;
    color: var(--color-ink);
  }

  .casual .name {
    position: absolute;
    left: var(--s-4);
    bottom: var(--s-3);
    z-index: 1;
    font-size: var(--t-poster);
    color: var(--dither-light);
  }

  /* ---------- pro head ---------- */

  .head {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: var(--s-3) var(--s-3) 0;
  }

  .avatar {
    display: block;
    width: 64px;
    height: 64px;
    border-radius: 18px;
    overflow: hidden;
    outline: 1px solid var(--img-outline);
    outline-offset: -1px;
  }

  .pro .chip {
    background: var(--color-bg);
    backdrop-filter: none;
    text-transform: none;
    font-family: var(--font-sans);
    font-size: var(--t-meta);
    letter-spacing: 0;
    color: var(--color-ink-dim);
  }

  .pro .name {
    padding: var(--s-6) var(--s-3) 0;
    font-size: clamp(3.25rem, 15vw, 4.5rem);
  }

  /* ---------- body ---------- */

  .body {
    display: grid;
    gap: var(--s-4);
    padding: var(--s-4) var(--s-3) var(--s-2);
  }

  .headline {
    font-size: var(--t-lead);
    line-height: 1.4;
    color: var(--color-ink);
    text-wrap: balance;
  }

  .casual .headline {
    font-family: var(--font-mono);
    font-size: var(--t-small);
    color: var(--color-ink-dim);
  }

  .pro .headline {
    font-family: var(--font-serif);
    font-style: italic;
    font-size: 1.375rem;
    color: var(--color-ink-dim);
    margin-top: calc(-1 * var(--s-2));
  }

  .dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--color-live);
    box-shadow: 0 0 0 3px color-mix(in oklch, var(--color-live) 22%, transparent);
    flex: none;
  }

  .facts {
    display: grid;
    border-radius: var(--r-control);
    box-shadow: 0 0 0 1px var(--color-line);
  }

  .facts div {
    display: flex;
    justify-content: space-between;
    gap: var(--s-4);
    padding: 10px var(--s-3);
    font-size: var(--t-small);
  }

  .facts div + div {
    border-top: 1px solid var(--color-line);
  }

  .facts dt {
    color: var(--color-ink-faint);
    font-family: var(--font-mono);
    font-size: var(--t-micro);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    align-self: center;
  }

  .clock {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .clock span {
    font-family: var(--font-mono);
    font-size: var(--t-micro);
    color: var(--color-ink-faint);
  }

  .facts dd {
    color: var(--color-ink);
    text-align: right;
    font-variant-numeric: tabular-nums;
  }

  /* ---------- actions ---------- */

  .actions {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto auto auto;
    gap: var(--s-2);
    align-items: center;
  }

  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--s-2);
    height: 48px;
    padding-inline: var(--s-4);
    border-radius: var(--r-control);
    font-size: var(--t-body);
    font-weight: 600;
    color: var(--color-ink);
    background: var(--color-raised);
    box-shadow: 0 0 0 1px var(--color-line);
    text-decoration: none;
    transition-property: background-color, scale, box-shadow;
    transition-duration: 150ms;
  }

  .btn.primary {
    min-width: 0;
    white-space: nowrap;
  }

  .btn.primary .short {
    display: none;
  }

  /* Small phones: Copy lives in the share sheet, so the row keeps its breathing room. */
  @media (max-width: 360px) {
    .actions {
      grid-template-columns: minmax(0, 1fr) auto auto;
    }

    .actions > :global(.copy) {
      display: none;
    }

    .btn.primary .long {
      display: none;
    }

    .btn.primary .short {
      display: inline;
    }

    .btn {
      padding-inline: var(--s-3);
    }
  }

  .btn:hover {
    background: color-mix(in oklch, var(--color-raised) 85%, var(--color-ink));
  }

  .btn.icon {
    width: 48px;
    padding: 0;
  }

  .btn.primary {
    color: var(--color-on-accent);
    background: var(--color-accent);
    box-shadow:
      0 0 0 1px color-mix(in oklch, var(--color-accent) 70%, var(--color-ink)),
      0 1px 0 0 oklch(1 0 0 / 0.18) inset,
      0 8px 24px -8px color-mix(in oklch, var(--color-accent) 70%, transparent);
  }

  .btn.primary:hover {
    background: color-mix(in oklch, var(--color-accent) 88%, var(--color-ink));
  }

  /* ---------- links ---------- */

  .links {
    display: grid;
    list-style: none;
    border-top: 1px solid var(--color-line);
    padding-top: var(--s-2);
  }

  .links a {
    display: flex;
    align-items: center;
    gap: var(--s-3);
    min-height: 44px;
    padding-inline: var(--s-2);
    border-radius: 10px;
    font-size: var(--t-body);
    color: var(--color-ink);
    text-decoration: none;
    transition-property: background-color, color;
    transition-duration: 150ms;
  }

  .links a:hover {
    background: var(--color-hover);
  }

  .link-detail {
    margin-left: auto;
    color: var(--color-ink-dim);
    font-size: var(--t-small);
  }

  .link-arrow {
    color: var(--color-ink-faint);
    transition-property: translate, color;
    transition-duration: 150ms;
  }

  .links a:hover .link-arrow {
    color: var(--color-ink);
    translate: 1px -1px;
  }

  /* ---------- casual: link tree ---------- */

  .tree {
    display: grid;
    gap: 6px;
    list-style: none;
    padding-top: var(--s-3);
    border-top: 1px solid var(--color-line);
  }

  .tree li {
    animation: tree-in 520ms cubic-bezier(0.34, 1.35, 0.5, 1) both;
    animation-delay: calc(250ms + var(--n) * 40ms);
  }

  .tree-row {
    position: relative;
    display: flex;
    align-items: center;
    gap: var(--s-3);
    min-height: 48px;
    padding: 6px 14px 6px 6px;
    overflow: hidden;
    border-radius: 16px;
    color: var(--color-ink);
    text-decoration: none;
    background: var(--color-raised);
    box-shadow: 0 0 0 1px var(--color-line);
    -webkit-touch-callout: none;
    user-select: none;
    transition-property: scale, background-color, translate, box-shadow;
  }

  /* Hold feedback: a fill sweeps across while you press, and flashes when copied. */
  .tree-row::before {
    content: '';
    position: absolute;
    inset: 0;
    background: color-mix(in oklch, var(--color-accent) 22%, transparent);
    transform-origin: left;
    scale: 0 1;
    transition: scale 150ms ease-out;
    pointer-events: none;
  }

  .tree-row:active::before {
    scale: 1 1;
    transition: scale 480ms linear;
  }

  .tree-row:global(.copied) {
    box-shadow: 0 0 0 2px var(--color-accent);
  }

  @media (hover: hover) {
    .tree-row:hover {
      background: var(--color-hover);
      translate: 0 -1px;
    }

    .tree-row:hover .tree-arrow {
      translate: 2px -2px;
      color: var(--color-accent);
    }
  }

  .tree-ico {
    position: relative;
    display: grid;
    place-items: center;
    flex: none;
    width: 36px;
    height: 36px;
    border-radius: 11px;
    background: var(--color-surface);
  }

  .tree-label {
    position: relative;
    font-size: var(--t-body);
    font-weight: 600;
  }

  .tree-detail {
    position: relative;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    min-width: 0;
    font-family: var(--font-mono);
    font-size: var(--t-micro);
    color: var(--color-ink-faint);
  }

  .tree-arrow {
    position: relative;
    display: inline-flex;
    margin-left: auto;
    color: var(--color-ink-faint);
    transition: translate 300ms cubic-bezier(0.34, 1.56, 0.64, 1), color 200ms;
  }

  .tree-row.featured {
    min-height: 56px;
    color: var(--color-on-accent);
    background: var(--color-accent);
    box-shadow: 0 10px 30px -12px color-mix(in oklch, var(--color-accent) 70%, transparent);
  }

  .tree-row.featured .tree-ico {
    background: oklch(1 0 0 / 0.16);
  }

  .tree-row.featured .tree-detail,
  .tree-row.featured .tree-arrow {
    color: inherit;
    opacity: 0.8;
  }

  @keyframes tree-in {
    from {
      opacity: 0;
      transform: translateY(10px) scale(0.96);
    }
  }

  /* ---------- arrival: the island ---------- */

  /*
   * The island drips out of the phone's own Dynamic Island.
   * --anchor is where the hardware island sits: 11px down in a home-screen
   * app (content runs under the status bar), tucked just above the top edge
   * in Safari so the drop appears to pour out of it.
   */
  .isl {
    --anchor: clamp(-30px, calc(env(safe-area-inset-top, 0px) - 48px), 11px);
    /* Where the expanded island settles: clear of the status bar, which iOS blurs. */
    --at: max(calc(var(--anchor) + 50px), calc(env(safe-area-inset-top, 0px) + 58px));
    --w: min(372px, calc(100vw - 20px));
    position: fixed;
    inset: 0 0 auto;
    z-index: var(--z-island);
    height: 260px;
    pointer-events: none;
  }

  .isl-defs {
    position: absolute;
  }

  .goo {
    position: absolute;
    inset: 0;
    filter: url(#isl-goo);
  }

  .lip,
  .neck,
  .blob,
  .face {
    position: absolute;
    left: 50%;
    translate: -50% 0;
    background: oklch(0 0 0);
  }

  /* Stand-in for the hardware island; it bulges as the drop pulls away. */
  .lip {
    top: var(--anchor);
    width: 126px;
    height: 37px;
    border-radius: 20px;
    animation: lip 2.6s cubic-bezier(0.2, 0, 0, 1) both;
  }

  .blob {
    animation: drop 2.6s both;
  }

  /* The thread of liquid between the island and the drop; the goo filter melts it into both. */
  .neck {
    top: calc(var(--anchor) + 18px);
    width: 30px;
    height: 0;
    border-radius: 15px;
    animation: neck 2.6s both;
  }

  /*
   * The face never changes size, so nothing inside it reflows mid-animation.
   * It sits where the island opens and is revealed by a clip that grows from
   * a pill to the full shape, in step with the blob underneath.
   */
  .face {
    top: var(--at);
    width: var(--w);
    height: 76px;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 0 16px 0 13px;
    white-space: nowrap;
    color: oklch(0.97 0 0);
    background: none;
    animation: face-clip 2.6s both;
  }

  /*
   * Each piece slides in on its own beat (--d), then leaves a little faster
   * in reverse order. Transform, opacity and blur only: compositor work, so
   * it stays smooth while the goo filter repaints underneath.
   */
  .face > * {
    --d: 0ms;
    opacity: 0;
    will-change: transform, opacity, filter;
    animation:
      piece-in 520ms cubic-bezier(0.2, 0, 0, 1) calc(880ms + var(--d)) forwards,
      piece-out 200ms cubic-bezier(0.4, 0, 1, 1) calc(1840ms - var(--d) / 2) forwards;
  }

  .face > .island-avatar {
    --d: 0ms;
  }

  .face > .island-text {
    --d: 70ms;
  }

  .face > .island-rings {
    --d: 140ms;
  }

  .island-avatar {
    position: relative;
    flex: none;
    width: 50px;
    height: 50px;
    padding: 2px;
    border-radius: 50%;
  }

  /* A ring of light chasing round the photo, like a live share. */
  .island-avatar::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: conic-gradient(var(--color-accent), oklch(1 0 0 / 0.08) 40%, var(--color-accent));
    animation: spin 1.6s linear infinite;
  }

  .island-avatar img {
    position: relative;
    display: block;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid oklch(0.08 0 0);
  }

  .island-text {
    display: grid;
    min-width: 0;
    line-height: 1.15;
  }

  /* The name trails the kicker by a beat. */
  .island-text > * {
    animation: line-in 520ms cubic-bezier(0.2, 0, 0, 1) 950ms backwards;
  }

  .island-text > strong {
    animation-delay: 1010ms;
  }

  .island-kicker {
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--color-live);
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .island-text strong {
    font-size: 17px;
    font-weight: 600;
    letter-spacing: -0.01em;
  }

  /* NameDrop-style ripples around the NFC glyph. */
  .island-rings {
    position: relative;
    display: grid;
    place-items: center;
    flex: none;
    width: 44px;
    height: 44px;
    margin-left: auto;
    color: var(--color-live);
  }

  .island-rings i {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    box-shadow: 0 0 0 1.5px currentColor inset;
    opacity: 0;
    animation: ripple 1.5s cubic-bezier(0.2, 0, 0, 1) infinite;
  }

  .island-rings i:nth-child(2) {
    animation-delay: 0.5s;
  }

  .island-rings i:nth-child(3) {
    animation-delay: 1s;
  }

  /* ---------- arrival: the card drops out of the island ---------- */

  .arriving .card {
    transform-origin: 50% 0;
    animation: card-drop 800ms cubic-bezier(0.34, 1.25, 0.5, 1) 900ms backwards;
  }

  .arriving [style*='--i'] {
    animation: part-in 500ms var(--ease-out) backwards;
    animation-delay: calc(900ms + var(--i) * 90ms);
  }

  /* Before hydration: hide the card if the page was opened from a tag. */
  :global(html.arrive:not(.arriving)) .card {
    opacity: 0;
    animation: none;
  }

  /* ---------- floating dock (card scrolled away, mostly phones) ---------- */

  .dock {
    white-space: nowrap;
    position: fixed;
    left: 50%;
    bottom: max(16px, env(safe-area-inset-bottom));
    z-index: var(--z-dock);
    display: inline-flex;
    align-items: center;
    gap: var(--s-2);
    height: 48px;
    padding: 6px 16px 6px 6px;
    border-radius: var(--r-pill);
    font-size: var(--t-small);
    font-weight: 600;
    color: var(--color-on-accent);
    background: var(--color-accent);
    box-shadow: var(--shadow-float);
    text-decoration: none;
    translate: -50% 12px;
    opacity: 0;
    pointer-events: none;
    transition-property: translate, opacity, scale;
    transition-duration: 300ms;
    transition-timing-function: var(--ease-out);
  }

  .dock.show {
    translate: -50% 0;
    opacity: 1;
    pointer-events: auto;
  }

  .dock-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    overflow: hidden;
  }

  @keyframes card-rise {
    from {
      opacity: 0;
      transform: translateY(12px) scale(0.985);
    }
  }

  /* The card surfaces under the island once it has splatted: a soft spring, no shrunken sliver. */
  @keyframes card-drop {
    0% {
      opacity: 0;
      transform: translateY(-28px) scale(0.94);
    }
    40% {
      opacity: 1;
    }
  }

  @keyframes part-in {
    from {
      opacity: 0;
      transform: translateY(8px);
      filter: blur(4px);
    }
  }

  /*
   * 0–22%   the pill pours out of the island, neck stretching (goo keeps them joined)
   * 22–34%  it snaps free and springs open into the live activity
   * 34–76%  hold
   * 76–100% it folds back into a pill and gets sucked back up
   */
  /*
   * Drip → stretch → splat → wobble → hang → pulled back up. Width and height
   * overshoot and settle like a spring so it reads as liquid, not a box.
   */
  @keyframes drop {
    0% {
      top: var(--anchor);
      width: 126px;
      height: 37px;
      border-radius: 20px;
      animation-timing-function: cubic-bezier(0.55, 0, 0.8, 0.2);
    }
    14% {
      top: calc(var(--anchor) + 30px);
      width: 64px;
      height: 58px;
      border-radius: 32px;
      animation-timing-function: cubic-bezier(0.3, 0, 0.2, 1);
    }
    24% {
      top: calc(var(--at) - 6px);
      width: 96px;
      height: 88px;
      border-radius: 44px;
      animation-timing-function: cubic-bezier(0.2, 0, 0, 1);
    }
    32% {
      top: var(--at);
      width: calc(var(--w) + 14px);
      height: 68px;
      border-radius: 34px;
      animation-timing-function: ease-in-out;
    }
    38% {
      width: calc(var(--w) - 8px);
      height: 80px;
      border-radius: 40px;
    }
    44%,
    74% {
      top: var(--at);
      width: var(--w);
      height: 76px;
      border-radius: 38px;
      animation-timing-function: cubic-bezier(0.5, 0, 0.7, 0.3);
    }
    84% {
      top: calc(var(--at) - 14px);
      width: 90px;
      height: 70px;
      border-radius: 35px;
      animation-timing-function: cubic-bezier(0.5, 0, 0.9, 0.4);
    }
    94% {
      top: var(--anchor);
      width: 126px;
      height: 37px;
      border-radius: 20px;
      opacity: 1;
    }
    100% {
      top: var(--anchor);
      width: 126px;
      height: 37px;
      border-radius: 20px;
      opacity: 0;
    }
  }

  @keyframes neck {
    0%,
    6% {
      width: 44px;
      height: 0;
    }
    18% {
      width: 26px;
      height: calc(var(--at) - var(--anchor) - 10px);
    }
    30% {
      width: 10px;
      height: calc(var(--at) - var(--anchor) - 10px);
    }
    38%,
    74% {
      width: 0;
      height: calc(var(--at) - var(--anchor) - 30px);
    }
    82% {
      width: 22px;
      height: calc(var(--at) - var(--anchor) - 10px);
    }
    94%,
    100% {
      width: 44px;
      height: 0;
    }
  }

  @keyframes face-clip {
    0%,
    24% {
      clip-path: inset(0 calc((var(--w) - 96px) / 2) 0 round 38px);
    }
    38%,
    74% {
      clip-path: inset(0 0 0 round 38px);
      animation-timing-function: cubic-bezier(0.4, 0, 1, 1);
    }
    84%,
    100% {
      clip-path: inset(0 calc((var(--w) - 126px) / 2) 39px round 20px);
    }
  }

  @keyframes piece-in {
    from {
      opacity: 0;
      transform: translateY(6px) scale(0.9);
      filter: blur(4px);
    }
    to {
      opacity: 1;
      transform: none;
      filter: blur(0);
    }
  }

  @keyframes piece-out {
    from {
      opacity: 1;
      transform: none;
      filter: blur(0);
    }
    to {
      opacity: 0;
      transform: translateY(-4px) scale(0.92);
      filter: blur(4px);
    }
  }

  @keyframes line-in {
    from {
      transform: translateY(5px);
    }
  }

  @keyframes lip {
    0% {
      scale: 1;
    }
    10% {
      scale: 1.12 1.2;
    }
    22% {
      scale: 0.92 1;
    }
    32%,
    84% {
      scale: 1;
    }
    94% {
      scale: 1.14 1.18;
    }
    100% {
      scale: 1;
    }
  }

  @keyframes spin {
    to {
      rotate: 1turn;
    }
  }

  @keyframes ripple {
    0% {
      opacity: 0.7;
      scale: 0.45;
    }
    100% {
      opacity: 0;
      scale: 1.1;
    }
  }

  @keyframes fade-in {
    from {
      opacity: 0;
      filter: blur(4px);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .card,
    .arriving .card,
    .arriving [style*='--i'] {
      animation: fade-in 300ms linear both;
      transform: none;
    }

    .island-rings i,
    .island-avatar::before {
      animation: none;
    }

    .goo {
      filter: none;
    }
  }
</style>
