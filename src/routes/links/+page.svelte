<script lang="ts">
  import { onMount } from 'svelte';
  import DitherImage from '$lib/components/DitherImage.svelte';
  import Icon from '$lib/components/Icon.svelte';
  import Meta from '$lib/components/Meta.svelte';
  import QrSheet from '$lib/components/QrSheet.svelte';
  import ShareSheet from '$lib/components/ShareSheet.svelte';
  import StatusPill from '$lib/components/StatusPill.svelte';
  import { app } from '$lib/app.svelte.ts';
  import music from '$lib/data/music.json';
  import { casual, identity } from '$lib/data/profile';
  import type { Crate, IconName } from '$lib/data/types';
  import { localTime } from '$lib/utils/time';
  import { assetUrl, pageHref } from '$lib/utils/urls';

  const crate = music as Crate;
  const track = crate.tracks[0];

  interface Row {
    id: string;
    label: string;
    detail: string;
    href: string;
    icon: IconName;
    external: boolean;
  }

  const host = (href: string) => href.replace(/^https?:\/\//, '').replace(/^mailto:/, '').replace(/\/$/, '');

  /** The link-in-bio list: the card first, then everywhere else he lives online. */
  const rows: Row[] = [
    { id: 'card', label: 'The full card', detail: 'crate, roll, guestbook', href: pageHref('/'), icon: 'contact', external: false },
    ...casual.links.map((l) => ({
      id: l.id,
      label: l.label,
      detail: l.detail ?? host(l.href),
      href: l.href,
      icon: l.icon,
      external: true,
    })),
    { id: 'pro', label: 'Work with me', detail: 'the pro card', href: pageHref('/pro'), icon: 'code', external: false },
    { id: 'mail', label: 'Email', detail: identity.email, href: `mailto:${identity.email}`, icon: 'mail', external: false },
  ];

  let shareOpen = $state(false);
  let qrOpen = $state(false);
  let url = $state('');
  let now = $state(Date.now());
  let ripples = $state<{ id: number; row: string; x: number; y: number }[]>([]);

  onMount(() => {
    url = new URL(pageHref('/links'), window.location.origin).href;
    const tick = window.setInterval(() => (now = Date.now()), 30_000);
    return () => window.clearInterval(tick);
  });

  /** A ripple from the finger, then the link opens as normal. */
  function tap(event: PointerEvent, row: string): void {
    const el = event.currentTarget as HTMLElement;
    const r = el.getBoundingClientRect();
    const id = performance.now();
    ripples = [...ripples.slice(-3), { id, row, x: event.clientX - r.left, y: event.clientY - r.top }];
    window.setTimeout(() => (ripples = ripples.filter((p) => p.id !== id)), 700);
    navigator.vibrate?.(5);
  }

  async function share(): Promise<void> {
    const data = { title: `${identity.name} · links`, text: casual.tagline, url };
    if (navigator.share) {
      try {
        await navigator.share(data);
      } catch {
        /* dismissed */
      }
      return;
    }
    await navigator.clipboard?.writeText(url).catch(() => {});
    app.say('Link copied');
  }
</script>

<Meta
  title="{identity.name} · links"
  description="{casual.tagline}. Every link in one place."
  path="/links"
  image="/og/casual.png"
  imageAlt="{identity.name}'s links"
/>

<main class="links">
  <header class="hero">
    <span class="avatar">
      <span class="ring" aria-hidden="true"></span>
      <DitherImage src={identity.avatar.src} alt={identity.avatar.alt} cell={2} eager />
    </span>
    <h1>{identity.name}</h1>
    <p class="tagline">{casual.tagline}</p>
    <p class="meta">
      <Icon name="pin" size={13} /> {identity.location}
      <span aria-hidden="true">·</span>
      <Icon name="clock" size={13} /> {localTime(casual.timezone, now)}
    </p>
    <div class="status"><StatusPill statuses={casual.statuses} /></div>

    <div class="quick">
      <a class="qbtn primary press" href={assetUrl('/das.vcf')} data-sveltekit-reload onclick={() => app.say('Opening contact card')}>
        <Icon name="contact" size={18} stroke={2} /> Save contact
      </a>
      <button type="button" class="qbtn press" onclick={() => (shareOpen = true)} aria-label="Share">
        <Icon name="share" size={18} stroke={2} />
      </button>
      <button type="button" class="qbtn press" onclick={() => (qrOpen = true)} aria-label="QR code">
        <Icon name="qr" size={18} stroke={2} />
      </button>
    </div>
  </header>

  <ul class="list">
    {#each rows as row, i (row.id)}
      <li style="--i: {i}">
        <a
          class="row press"
          href={row.href}
          target={row.external ? '_blank' : undefined}
          rel={row.external ? 'noopener me' : undefined}
          onpointerdown={(e) => tap(e, row.id)}
        >
          <span class="ico"><Icon name={row.icon} size={18} /></span>
          <span class="txt">
            <strong>{row.label}</strong>
            <span>{row.detail}</span>
          </span>
          <span class="arrow"><Icon name="arrow" size={16} /></span>
          {#each ripples.filter((p) => p.row === row.id) as p (p.id)}
            <span class="ripple" style="left: {p.x}px; top: {p.y}px"></span>
          {/each}
        </a>
      </li>
    {/each}
  </ul>

  {#if track}
    <a class="playing press" href={pageHref('/')} style="--i: {rows.length}">
      <img src={track.artwork.replace(/\d+x\d+bb/, '200x200bb')} alt="" />
      <span class="txt">
        <span class="kicker"><span class="eq" aria-hidden="true"><i></i><i></i><i></i></span> on repeat</span>
        <strong>{track.title}</strong>
        <span>{track.artist}</span>
      </span>
      <span class="arrow"><Icon name="arrow" size={16} /></span>
    </a>
  {/if}

  <p class="fine">{identity.brand} · <a href={pageHref('/tags')}>tap card</a></p>
</main>

<ShareSheet
  open={shareOpen}
  {url}
  name={identity.name}
  links={casual.links}
  onshare={share}
  onqr={() => {
    shareOpen = false;
    qrOpen = true;
  }}
  onclose={() => (shareOpen = false)}
/>
<QrSheet open={qrOpen} url={url ? `${url}?via=qr` : ''} name={identity.name} onclose={() => (qrOpen = false)} />

<style>
  .links {
    display: grid;
    gap: var(--s-5);
    width: 100%;
    max-width: 30rem;
    margin-inline: auto;
    padding-block: var(--s-4) calc(var(--s-8) + env(safe-area-inset-bottom));
  }

  /* ---------- hero ---------- */

  .hero {
    view-transition-name: card;
    display: grid;
    justify-items: center;
    gap: var(--s-2);
    padding: var(--s-6) var(--s-5) var(--s-5);
    border-radius: var(--r-card);
    text-align: center;
    background: var(--color-surface);
    box-shadow: var(--shadow-card);
    animation: hero-in 700ms cubic-bezier(0.34, 1.3, 0.5, 1) both;
  }

  .avatar {
    position: relative;
    width: 104px;
    height: 104px;
    padding: 4px;
    margin-bottom: var(--s-2);
    border-radius: 50%;
  }

  .avatar :global(.dither) {
    border-radius: 50%;
  }

  .ring {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: conic-gradient(var(--color-accent), transparent 45%, var(--color-accent));
    animation: spin 2.4s linear infinite;
  }

  .avatar > :global(.dither) {
    position: relative;
    box-shadow: 0 0 0 3px var(--color-surface);
  }

  h1 {
    font-family: var(--name-font);
    text-transform: var(--name-case);
    letter-spacing: var(--name-track);
    font-weight: 400;
    font-size: clamp(2.75rem, 14vw, 3.5rem);
    line-height: 0.9;
  }

  .tagline {
    max-width: 22rem;
    font-family: var(--font-mono);
    font-size: var(--t-small);
    color: var(--color-ink-dim);
    text-wrap: balance;
  }

  .meta {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: var(--t-meta);
    color: var(--color-ink-faint);
  }

  .status {
    width: 100%;
    margin-top: var(--s-2);
    text-align: left;
  }

  .quick {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto auto;
    gap: var(--s-2);
    width: 100%;
    margin-top: var(--s-2);
  }

  .qbtn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--s-2);
    min-width: 48px;
    height: 48px;
    padding-inline: var(--s-3);
    border-radius: var(--r-control);
    font-weight: 600;
    white-space: nowrap;
    color: var(--color-ink);
    text-decoration: none;
    background: var(--color-raised);
    box-shadow: 0 0 0 1px var(--color-line);
  }

  .qbtn.primary {
    color: var(--color-on-accent);
    background: var(--color-accent);
    box-shadow: none;
  }

  /* ---------- the list ---------- */

  .list {
    list-style: none;
    display: grid;
    gap: var(--s-2);
  }

  li,
  .playing {
    animation: row-in 560ms cubic-bezier(0.34, 1.35, 0.5, 1) both;
    animation-delay: calc(180ms + var(--i) * 45ms);
  }

  .row,
  .playing {
    position: relative;
    display: flex;
    align-items: center;
    gap: var(--s-3);
    min-height: 64px;
    padding: 10px 16px 10px 10px;
    overflow: hidden;
    border-radius: 20px;
    color: inherit;
    text-decoration: none;
    background: var(--color-surface);
    box-shadow: 0 0 0 1px var(--color-line);
    transition-property: scale, background-color, box-shadow, translate;
    -webkit-tap-highlight-color: transparent;
  }

  /* A light sweep on hover, like glass catching the light. */
  .row::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(105deg, transparent 30%, color-mix(in oklch, var(--color-ink) 8%, transparent) 50%, transparent 70%);
    translate: -100% 0;
    transition: translate 700ms cubic-bezier(0.2, 0, 0, 1);
    pointer-events: none;
  }

  @media (hover: hover) {
    .row:hover,
    .playing:hover {
      background: var(--color-hover);
      box-shadow: 0 0 0 1px var(--color-line-strong);
      translate: 0 -2px;
    }

    .row:hover::after {
      translate: 100% 0;
    }

    .row:hover .arrow,
    .playing:hover .arrow {
      translate: 3px 0;
      color: var(--color-accent);
    }
  }

  .ico {
    display: grid;
    place-items: center;
    flex: none;
    width: 44px;
    height: 44px;
    border-radius: 14px;
    color: var(--color-ink);
    background: var(--color-raised);
  }

  li:first-child .ico {
    color: var(--color-on-accent);
    background: var(--color-accent);
  }

  .txt {
    display: grid;
    flex: 1;
    min-width: 0;
    line-height: 1.3;
    text-align: left;
  }

  .txt strong {
    font-size: var(--t-body);
    font-weight: 600;
  }

  .txt > span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-family: var(--font-mono);
    font-size: var(--t-micro);
    color: var(--color-ink-faint);
  }

  .arrow {
    display: inline-flex;
    color: var(--color-ink-faint);
    transition: translate 300ms cubic-bezier(0.34, 1.56, 0.64, 1), color 200ms;
  }

  .ripple {
    position: absolute;
    width: 20px;
    height: 20px;
    margin: -10px 0 0 -10px;
    border-radius: 50%;
    pointer-events: none;
    background: color-mix(in oklch, var(--color-accent) 35%, transparent);
    animation: ripple 650ms cubic-bezier(0.2, 0, 0, 1) forwards;
  }

  /* ---------- on repeat ---------- */

  .playing img {
    flex: none;
    width: 44px;
    height: 44px;
    border-radius: 8px;
    object-fit: cover;
    background: var(--color-raised);
  }

  .kicker {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: var(--color-accent) !important;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .eq {
    display: inline-flex;
    align-items: flex-end;
    gap: 2px;
    height: 10px;
  }

  .eq i {
    width: 2px;
    height: 100%;
    border-radius: 1px;
    background: currentColor;
    transform-origin: bottom;
    animation: eq 900ms ease-in-out infinite alternate;
  }

  .eq i:nth-child(2) {
    animation-delay: -300ms;
  }

  .eq i:nth-child(3) {
    animation-delay: -600ms;
  }

  .fine {
    text-align: center;
    font-family: var(--font-mono);
    font-size: var(--t-micro);
    color: var(--color-ink-faint);
  }

  .fine a {
    color: inherit;
  }

  @keyframes hero-in {
    from {
      opacity: 0;
      transform: translateY(16px) scale(0.97);
    }
  }

  @keyframes row-in {
    from {
      opacity: 0;
      transform: translateY(14px) scale(0.96);
    }
  }

  @keyframes ripple {
    from {
      scale: 0.5;
      opacity: 1;
    }
    to {
      scale: 30;
      opacity: 0;
    }
  }

  @keyframes spin {
    to {
      rotate: 1turn;
    }
  }

  @keyframes eq {
    from {
      scale: 1 0.25;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .hero,
    li,
    .playing,
    .ring,
    .eq i,
    .ripple {
      animation: none;
    }
  }
</style>
