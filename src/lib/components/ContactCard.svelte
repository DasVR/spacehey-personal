<script lang="ts">
  import { onMount } from 'svelte';
  import { replaceState } from '$app/navigation';
  import { page } from '$app/state';
  import CopyButton from './CopyButton.svelte';
  import DitherImage from './DitherImage.svelte';
  import Icon from './Icon.svelte';
  import { app } from '$lib/app.svelte.ts';
  import { arrivalLabel, arrivalSource, type ArrivalSource } from '$lib/arrival';
  import type { Identity, Link, Mode } from '$lib/data/types';
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
  }

  let { mode, identity, headline, status, links, facts }: Props = $props();

  let card: HTMLElement;
  let source = $state<ArrivalSource | null>(null);
  let arriving = $state(false);
  let offscreen = $state(false);
  let tilting = $state(false);

  const path = $derived(mode === 'pro' ? '/pro' : '/');
  const vcard = $derived(assetUrl(mode === 'pro' ? '/das-pro.vcf' : '/das.vcf'));
  let shareUrl = $state('');

  onMount(() => {
    shareUrl = new URL(pageHref(path), window.location.origin).href;
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
      }, 2400);
    }

    const io = new IntersectionObserver(([entry]) => (offscreen = !entry.isIntersecting && entry.boundingClientRect.bottom < 0), {
      threshold: 0,
    });
    io.observe(card);
    return () => {
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
      }, 2400);
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
  <div class="island" role="status" aria-live="polite">
    <span class="island-avatar"><DitherImage src={identity.avatar.src} alt="" cell={2} levels={2} develop={false} eager /></span>
    <span class="island-text">
      <strong>{identity.name}</strong>
      <span>{arrivalLabel(source)} · {identity.host}</span>
    </span>
    <span class="island-wave"><Icon name="nfc" size={18} /></span>
  </div>
{/if}

<div class="stage" class:arriving>
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
      <div class="poster" style="--i: 0">
        <DitherImage src={identity.avatar.src} alt={identity.avatar.alt} cell={3} eager />
        <div class="poster-top">
          <span class="chip"><Icon name="nfc" size={14} /> tap card</span>
          <span class="serial">003 963 6663</span>
        </div>
        <h1 id="card-name" class="name">{identity.name}</h1>
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
      {#if mode === 'casual'}
        <p class="status" style="--i: 2"><span class="dot"></span><span class="status-label">mood</span> {status}</p>
      {/if}

      <dl class="facts" style="--i: 2">
        {#each facts as fact (fact.label)}
          <div>
            <dt>{fact.label}</dt>
            <dd>{fact.value}</dd>
          </div>
        {/each}
      </dl>

      <div class="actions" style="--i: 3">
        <a class="btn primary press" href={vcard} data-sveltekit-reload onclick={() => app.say('Opening contact card')}>
          <Icon name="contact" size={18} stroke={2} />
          <span>Save contact</span>
        </a>
        <button type="button" class="btn icon press" onclick={share} aria-label="Share">
          <Icon name="share" size={18} stroke={2} />
        </button>
        <CopyButton value={shareUrl} label="Copy link" done="Link copied" />
      </div>

      <ul class="links" class:grid={mode === 'casual'} style="--i: 4">
        {#each links as link (link.id)}
          <li>
            <a href={link.href} target={link.href.startsWith('mailto:') ? undefined : '_blank'} rel="noopener me">
              <Icon name={link.icon} size={18} />
              <span class="link-label">{link.label}</span>
              {#if link.detail && mode === 'pro'}<span class="link-detail">{link.detail}</span>{/if}
              {#if mode === 'pro'}<span class="link-arrow"><Icon name="arrow" size={14} /></span>{/if}
            </a>
          </li>
        {/each}
      </ul>
    </div>
  </article>
</div>

<a class="dock press" class:show={offscreen} href={vcard} data-sveltekit-reload tabindex={offscreen ? 0 : -1} aria-hidden={!offscreen}>
  <span class="dock-avatar"><DitherImage src={identity.avatar.src} alt="" cell={2} levels={2} develop={false} /></span>
  <span>Save {identity.name}</span>
  <Icon name="contact" size={16} stroke={2} />
</a>

<style>
  /* ---------- stage & card ---------- */

  .stage {
    perspective: 1200px;
  }

  .card {
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

  .poster {
    position: relative;
    aspect-ratio: 4 / 4.6;
    border-radius: var(--r-inner);
    overflow: hidden;
    outline: 1px solid var(--img-outline);
    outline-offset: -1px;
  }

  .poster::after {
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

  .status {
    display: flex;
    align-items: center;
    gap: var(--s-2);
    font-size: var(--t-body);
    color: var(--color-accent);
    font-style: italic;
  }

  .status-label {
    font-family: var(--font-mono);
    font-style: normal;
    font-size: var(--t-micro);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--color-ink-faint);
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

  .facts dd {
    color: var(--color-ink);
    text-align: right;
    font-variant-numeric: tabular-nums;
  }

  /* ---------- actions ---------- */

  .actions {
    display: grid;
    grid-template-columns: 1fr auto auto;
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

  .links.grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 4px;
  }

  .links.grid a {
    flex-direction: column;
    justify-content: center;
    gap: 6px;
    min-height: 64px;
    font-size: var(--t-micro);
    font-family: var(--font-mono);
    letter-spacing: 0.02em;
    color: var(--color-ink-dim);
  }

  .links.grid a:hover {
    color: var(--color-ink);
  }

  .links.grid li:nth-child(4) a {
    color: var(--color-accent);
  }

  /* ---------- arrival: the island ---------- */

  .island {
    position: fixed;
    top: max(10px, env(safe-area-inset-top));
    left: 50%;
    z-index: var(--z-island);
    display: flex;
    align-items: center;
    gap: var(--s-3);
    height: 52px;
    padding: 6px 14px 6px 6px;
    translate: -50% 0;
    border-radius: var(--r-pill);
    /* Always black, like the hardware it imitates. */
    background: oklch(0.12 0 0);
    color: oklch(0.96 0 0);
    box-shadow: 0 12px 40px -10px oklch(0 0 0 / 0.6);
    overflow: hidden;
    white-space: nowrap;
    animation: island 2.4s var(--ease-out) both;
  }

  .island-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    overflow: hidden;
    flex: none;
    animation: fade-in 300ms var(--ease-out) 250ms both;
  }

  .island-text {
    display: grid;
    line-height: 1.2;
    font-size: var(--t-small);
    animation: fade-in 300ms var(--ease-out) 300ms both;
  }

  .island-text span {
    font-size: var(--t-micro);
    color: oklch(0.72 0 0);
  }

  .island-wave {
    margin-left: var(--s-4);
    color: var(--color-live);
    animation:
      fade-in 300ms var(--ease-out) 350ms both,
      wave 1.2s ease-in-out 400ms infinite;
  }

  /* ---------- arrival: the card drops out of the island ---------- */

  .arriving .card {
    transform-origin: 50% 0;
    animation: card-drop 900ms var(--ease-out) 420ms backwards;
  }

  .arriving [style*='--i'] {
    animation: part-in 500ms var(--ease-out) backwards;
    animation-delay: calc(900ms + var(--i) * 100ms);
  }

  /* Before hydration: hide the card if the page was opened from a tag. */
  :global(html.arrive:not(.arriving)) .card {
    opacity: 0;
    animation: none;
  }

  /* ---------- floating dock (card scrolled away, mostly phones) ---------- */

  .dock {
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

  @keyframes card-drop {
    0% {
      opacity: 0;
      transform: translateY(var(--drop-y, -40vh)) scale(0.22);
      filter: blur(12px);
      border-radius: 60px;
    }
    35% {
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

  @keyframes island {
    0% {
      width: 120px;
      height: 36px;
      opacity: 0;
    }
    8% {
      opacity: 1;
    }
    22% {
      width: min(340px, calc(100vw - 32px));
      height: 52px;
    }
    72% {
      width: min(340px, calc(100vw - 32px));
      height: 52px;
      opacity: 1;
    }
    100% {
      width: 120px;
      height: 36px;
      opacity: 0;
    }
  }

  @keyframes fade-in {
    from {
      opacity: 0;
      filter: blur(4px);
    }
  }

  @keyframes wave {
    50% {
      opacity: 0.4;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .card,
    .arriving .card,
    .arriving [style*='--i'] {
      animation: fade-in 300ms linear both;
      transform: none;
    }

    .island-wave {
      animation: none;
    }
  }
</style>
