<script lang="ts">
  import { onMount } from 'svelte';
  import CopyButton from '$lib/components/CopyButton.svelte';
  import Icon from '$lib/components/Icon.svelte';
  import QrCode from '$lib/components/QrCode.svelte';
  import Section from '$lib/components/Section.svelte';
  import { app } from '$lib/app.svelte.ts';
  import { identity } from '$lib/data/profile';
  import type { Mode } from '$lib/data/types';
  import { pageHref } from '$lib/utils/urls';

  interface NdefWriter {
    write(message: { records: { recordType: string; data: string }[] }): Promise<void>;
  }

  let origin = $state(`https://${identity.host}`);
  let canWrite = $state(false);
  let writing = $state<Mode | null>(null);

  const modes: { mode: Mode; title: string; note: string; path: string }[] = [
    { mode: 'casual', title: 'Casual', note: 'Keychain, stickers, the back of your phone.', path: '/' },
    { mode: 'pro', title: 'Pro', note: 'Business cards, a laptop, the desk at a meetup.', path: '/pro' },
  ];

  function url(path: string, via: 'nfc' | 'qr'): string {
    return `${origin}${pageHref(path)}?via=${via}`;
  }

  onMount(() => {
    origin = window.location.origin;
    canWrite = 'NDEFReader' in window;
  });

  async function write(mode: Mode, value: string): Promise<void> {
    const Reader = (window as unknown as { NDEFReader?: new () => NdefWriter }).NDEFReader;
    if (!Reader) return;
    writing = mode;
    app.say('Hold a tag to the back of your phone');
    try {
      await new Reader().write({ records: [{ recordType: 'url', data: value }] });
      app.say('Tag written');
      app.tap();
    } catch {
      app.say('Couldn’t write that tag');
    } finally {
      writing = null;
    }
  }
</script>

<svelte:head>
  <title>Tags & QR · {identity.host}</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<main class="tags">
  <header class="intro">
    <p class="kicker"><Icon name="nfc" size={16} /> Tags & QR</p>
    <h1>Put the card on anything.</h1>
    <p class="lead">
      Write one URL per tag. Phones read it, show a notification, and the card drops in with the tap sequence.
      QR codes open the same page with a scan instead.
    </p>
  </header>

  <div class="grid">
    {#each modes as item (item.mode)}
      {@const nfc = url(item.path, 'nfc')}
      <article class="tag">
        <div class="qr"><QrCode value={url(item.path, 'qr')} label="QR code for the {item.title} card" /></div>
        <div class="info">
          <h2>{item.title}</h2>
          <p class="note">{item.note}</p>
          <div class="url">
            <code>{nfc}</code>
            <CopyButton value={nfc} label="Copy {item.title} tag URL" done="Tag URL copied" />
          </div>
          <div class="actions">
            {#if canWrite}
              <button type="button" class="btn primary press" disabled={writing !== null} onclick={() => write(item.mode, nfc)}>
                <Icon name="nfc" size={18} stroke={2} />
                {writing === item.mode ? 'Waiting for tag…' : 'Write to tag'}
              </button>
            {/if}
            <a class="btn press" href={`${pageHref(item.path)}?via=nfc`}>Preview the tap</a>
          </div>
        </div>
      </article>
    {/each}
  </div>

  <Section index="01" title="Writing a tag">
    <ol class="steps">
      <li><strong>Tag:</strong> NTAG213 or bigger. Both URLs fit in its 144 bytes.</li>
      <li>
        <strong>Android (Chrome):</strong> use <em>Write to tag</em> above — it writes an NDEF URL record straight from this
        page.
      </li>
      <li>
        <strong>iPhone:</strong> iOS can’t write from a web page. Use an app like NFC Tools → Write → Add a record → URL, and
        paste the copied URL.
      </li>
      <li>
        <strong>Reading on iPhone:</strong> iPhone XS and newer read tags in the background while unlocked. A notification
        slides down — tapping it opens Safari straight into the tap sequence.
      </li>
      <li>Lock the tag after writing if it will live somewhere public.</li>
    </ol>
  </Section>
</main>

<style>
  .tags {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: var(--s-7);
    max-width: 60rem;
    margin-inline: auto;
    padding-block: var(--s-6) var(--s-8);
  }

  .kicker {
    display: inline-flex;
    align-items: center;
    gap: var(--s-2);
    font-family: var(--font-mono);
    font-size: var(--t-meta);
    color: var(--color-accent);
  }

  h1 {
    margin-top: var(--s-3);
    font-family: var(--font-serif);
    font-weight: 400;
    font-size: clamp(2.5rem, 9vw, 4rem);
    line-height: 1;
    letter-spacing: -0.02em;
    text-wrap: balance;
  }

  .lead {
    margin-top: var(--s-4);
    max-width: 36rem;
    font-size: var(--t-lead);
    color: var(--color-ink-dim);
    text-wrap: pretty;
  }

  .grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: var(--s-4);
  }

  @media (min-width: 760px) {
    .grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  .tag {
    --pad: var(--r-card-pad);
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    min-width: 0;
    gap: var(--s-4);
    padding: var(--pad);
    border-radius: var(--r-card);
    background: var(--color-surface);
    box-shadow: var(--shadow-card);
  }

  .qr {
    --qr-bg: var(--dither-light);
    --qr-ink: var(--dither-dark);
    border-radius: var(--r-inner);
    overflow: hidden;
    outline: 1px solid var(--img-outline);
    outline-offset: -1px;
  }

  .info {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    min-width: 0;
    gap: var(--s-3);
    padding: var(--s-2) var(--s-2) var(--s-3);
  }

  h2 {
    font-size: var(--t-title);
    font-weight: 600;
  }

  .note {
    color: var(--color-ink-dim);
    font-size: var(--t-small);
  }

  .url {
    display: flex;
    min-width: 0;
    align-items: center;
    gap: var(--s-2);
    padding-left: var(--s-3);
    border-radius: var(--r-control);
    box-shadow: 0 0 0 1px var(--color-line);
  }

  code {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-family: var(--font-mono);
    font-size: var(--t-meta);
    color: var(--color-ink-dim);
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--s-2);
  }

  .btn {
    display: inline-flex;
    align-items: center;
    gap: var(--s-2);
    height: 44px;
    padding-inline: var(--s-4);
    border-radius: var(--r-control);
    font-size: var(--t-small);
    font-weight: 600;
    color: var(--color-ink);
    background: var(--color-raised);
    box-shadow: 0 0 0 1px var(--color-line);
    text-decoration: none;
    transition-property: background-color, scale, opacity;
    transition-duration: 150ms;
  }

  .btn:hover {
    background: color-mix(in oklch, var(--color-raised) 85%, var(--color-ink));
  }

  .btn.primary {
    color: var(--color-on-accent);
    background: var(--color-accent);
  }

  .btn:disabled {
    opacity: 0.6;
  }

  .steps {
    display: grid;
    gap: var(--s-3);
    padding-left: var(--s-5);
    color: var(--color-ink-dim);
    line-height: 1.6;
  }

  .steps strong {
    color: var(--color-ink);
    font-weight: 600;
  }

  @media print {
    :global(body) {
      background: white;
    }

    .actions,
    .url :global(button),
    .intro .lead {
      display: none;
    }
  }
</style>
