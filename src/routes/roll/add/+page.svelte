<script lang="ts">
  import { onMount } from 'svelte';
  import DitherImage from '$lib/components/DitherImage.svelte';
  import Icon from '$lib/components/Icon.svelte';
  import { app } from '$lib/app.svelte.ts';
  import { identity } from '$lib/data/profile';
  import { rollFileName } from '$lib/roll-name';
  import { formatBytes, prepPhoto, type Upscale } from '$lib/utils/photo';
  import { pageHref } from '$lib/utils/urls';

  /** Where the roll lives in the repo; GitHub's uploader drops files straight in. */
  const UPLOAD_URL = 'https://github.com/DasVR/spacehey-personal/upload/main/src/lib/roll';

  interface Source {
    file: File;
    url: string;
    width: number;
    height: number;
  }

  let source = $state<Source | null>(null);
  let dragging = $state(false);
  let busy = $state(false);

  let caption = $state('');
  let date = $state(new Date().toISOString().slice(0, 10));
  let upscale = $state<Upscale>(1);
  let maxEdge = $state(2400);
  let sharpen = $state(true);
  let format = $state<'image/webp' | 'image/jpeg'>('image/webp');
  let quality = $state(0.86);
  let view = $state<'dither' | 'photo'>('dither');

  let out = $state<{ url: string; blob: Blob; width: number; height: number } | null>(null);

  const ext = $derived(format === 'image/webp' ? 'webp' : 'jpg');
  const name = $derived(rollFileName(date, caption || 'untitled', ext));

  onMount(() => {
    // Visiting this page marks the device as the owner's, so the roll shows an "add" tile.
    try {
      localStorage.setItem('roll-owner', '1');
    } catch {
      /* private mode */
    }
  });

  async function take(file: File | undefined): Promise<void> {
    if (!file || !file.type.startsWith('image/')) {
      app.say('That isn’t an image');
      return;
    }
    if (source) URL.revokeObjectURL(source.url);
    const url = URL.createObjectURL(file);
    const bmp = await createImageBitmap(file);
    source = { file, url, width: bmp.width, height: bmp.height };
    bmp.close();
    date = new Date(file.lastModified || Date.now()).toISOString().slice(0, 10);
    caption = file.name
      .replace(/\.[^.]+$/, '')
      .replace(/^(IMG|DSC|PXL)[_-]?\d+.*$/i, '')
      .replace(/[-_]+/g, ' ')
      .trim();
    // Small photos default to 2× so they hold up full-screen.
    upscale = Math.max(bmp.width, bmp.height) < 1200 ? 2 : 1;
  }

  // Re-render the output whenever a setting changes.
  $effect(() => {
    if (!source) return;
    const opts = { upscale, maxEdge, sharpen, format, quality };
    const file = source.file;
    busy = true;
    let cancelled = false;
    prepPhoto(file, opts)
      .then((r) => {
        if (cancelled) return;
        if (out) URL.revokeObjectURL(out.url);
        out = { ...r, url: URL.createObjectURL(r.blob) };
      })
      .catch(() => app.say('Couldn’t process that photo'))
      .finally(() => {
        if (!cancelled) busy = false;
      });
    return () => {
      cancelled = true;
    };
  });

  function download(): void {
    if (!out) return;
    const a = document.createElement('a');
    a.href = out.url;
    a.download = name;
    a.click();
    app.say('Saved — now drop it into GitHub');
  }

  async function share(): Promise<void> {
    if (!out) return;
    const file = new File([out.blob], name, { type: format });
    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: name });
      } catch {
        /* dismissed */
      }
    } else {
      download();
    }
  }
</script>

<svelte:head>
  <title>Add to the roll · {identity.host}</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<main class="add">
  <header>
    <a class="back" href={pageHref('/')}><Icon name="chevron-left" size={16} /> Back to the card</a>
    <h1>Add to the roll</h1>
    <p class="lead">Drop a photo, tune it, and it lands on the page after one upload. Location data is stripped on the way.</p>
  </header>

  {#if !source}
    <label
      class="drop"
      class:dragging
      ondragover={(e) => {
        e.preventDefault();
        dragging = true;
      }}
      ondragleave={() => (dragging = false)}
      ondrop={(e) => {
        e.preventDefault();
        dragging = false;
        take(e.dataTransfer?.files[0]);
      }}
    >
      <input type="file" accept="image/*" onchange={(e) => take(e.currentTarget.files?.[0])} />
      <span class="drop-icon"><Icon name="image" size={28} /></span>
      <strong>Drop a photo or tap to choose</strong>
      <span>JPEG, PNG, HEIC from your camera roll, WebP</span>
    </label>
  {:else}
    <div class="work">
      <div class="preview">
        <div class="shot" class:busy>
          {#if out}
            {#key out.url}
              <DitherImage src={out.url} alt={caption || 'Preview'} fit="contain" develop={false} developed={view === 'photo'} eager />
            {/key}
          {/if}
        </div>
        <div class="seg" role="radiogroup" aria-label="Preview">
          <button type="button" role="radio" aria-checked={view === 'dither'} class:on={view === 'dither'} onclick={() => (view = 'dither')}>
            <Icon name="sparkle" size={15} /> As it shows on the page
          </button>
          <button type="button" role="radio" aria-checked={view === 'photo'} class:on={view === 'photo'} onclick={() => (view = 'photo')}>
            <Icon name="image" size={15} /> Full photo
          </button>
        </div>
      </div>

      <form class="panel" onsubmit={(e) => e.preventDefault()}>
        <label class="field">
          <span>Caption</span>
          <input bind:value={caption} placeholder="Soundcheck at The Social" maxlength="60" />
        </label>
        <label class="field">
          <span>Date</span>
          <input type="date" bind:value={date} />
        </label>

        <fieldset class="field">
          <legend>Upscale</legend>
          <div class="seg">
            {#each [1, 2, 4] as const as u (u)}
              <button type="button" class:on={upscale === u} onclick={() => (upscale = u)}>{u === 1 ? 'Off' : `${u}×`}</button>
            {/each}
          </div>
        </fieldset>

        <fieldset class="field">
          <legend>Longest edge</legend>
          <div class="seg">
            {#each [1600, 2400, 3200] as edge (edge)}
              <button type="button" class:on={maxEdge === edge} onclick={() => (maxEdge = edge)}>{edge}px</button>
            {/each}
          </div>
        </fieldset>

        <label class="toggle">
          <input type="checkbox" bind:checked={sharpen} />
          <span>Sharpen after scaling</span>
        </label>

        <fieldset class="field">
          <legend>Format</legend>
          <div class="seg">
            <button type="button" class:on={format === 'image/webp'} onclick={() => (format = 'image/webp')}>WebP</button>
            <button type="button" class:on={format === 'image/jpeg'} onclick={() => (format = 'image/jpeg')}>JPEG</button>
          </div>
        </fieldset>

        <label class="field">
          <span>Quality <output>{Math.round(quality * 100)}</output></span>
          <input type="range" min="0.6" max="0.95" step="0.01" bind:value={quality} />
        </label>

        <p class="stats">
          {source.width}×{source.height} → {#if out}<strong>{out.width}×{out.height}</strong> · {formatBytes(out.blob.size)}{:else}…{/if}
        </p>
        <p class="file"><Icon name="image" size={14} /> {name}</p>

        <ol class="steps">
          <li>
            <button type="button" class="btn primary press" onclick={share} disabled={!out || busy}>
              <Icon name="download" size={18} stroke={2} /> Save photo
            </button>
          </li>
          <li>
            <a class="btn press" href={UPLOAD_URL} target="_blank" rel="noopener">
              <Icon name="upload" size={18} stroke={2} /> Upload to the roll on GitHub
            </a>
            <span class="note">Drop the saved file there and commit. The page rebuilds itself in about a minute.</span>
          </li>
        </ol>

        <button type="button" class="reset" onclick={() => (source = null)}>Start over with another photo</button>
      </form>
    </div>
  {/if}
</main>

<style>
  .add {
    display: grid;
    gap: var(--s-6);
    max-width: 64rem;
    margin-inline: auto;
    padding-block: var(--s-5) var(--s-8);
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
    font-size: clamp(2.25rem, 8vw, 3.5rem);
    line-height: 1;
    letter-spacing: -0.02em;
  }

  .lead {
    max-width: 38rem;
    color: var(--color-ink-dim);
    font-size: var(--t-lead);
  }

  .drop {
    position: relative;
    display: grid;
    place-items: center;
    align-content: center;
    gap: var(--s-2);
    min-height: 320px;
    padding: var(--s-6);
    border-radius: var(--r-card);
    border: 1.5px dashed var(--color-line-strong);
    background: color-mix(in oklch, var(--color-surface) 80%, transparent);
    text-align: center;
    cursor: pointer;
    transition-property: border-color, background-color;
    transition-duration: 200ms;
  }

  .drop:hover,
  .drop.dragging {
    border-color: var(--color-accent);
    background: var(--color-surface);
  }

  .drop input {
    position: absolute;
    inset: 0;
    opacity: 0;
    cursor: pointer;
  }

  .drop-icon {
    display: grid;
    place-items: center;
    width: 64px;
    height: 64px;
    border-radius: 20px;
    color: var(--color-on-accent);
    background: var(--color-accent);
  }

  .drop span {
    font-size: var(--t-small);
    color: var(--color-ink-dim);
  }

  .work {
    display: grid;
    gap: var(--s-5);
  }

  @media (min-width: 900px) {
    .work {
      grid-template-columns: 1.3fr 1fr;
      align-items: start;
    }

    .preview {
      position: sticky;
      top: var(--s-4);
    }
  }

  .preview {
    display: grid;
    gap: var(--s-3);
  }

  .shot {
    position: relative;
    aspect-ratio: 4 / 5;
    border-radius: 20px;
    background: var(--color-surface);
    box-shadow: var(--shadow-card);
    overflow: hidden;
    transition-property: opacity;
    transition-duration: 200ms;
  }

  .shot.busy {
    opacity: 0.6;
  }

  .panel {
    display: grid;
    gap: var(--s-4);
    padding: var(--s-5);
    border-radius: var(--r-card);
    background: var(--color-surface);
    box-shadow: var(--shadow-card);
  }

  .field {
    display: grid;
    gap: 6px;
    margin: 0;
    padding: 0;
    border: 0;
  }

  .field > span,
  legend {
    display: flex;
    justify-content: space-between;
    padding: 0;
    font-family: var(--font-mono);
    font-size: var(--t-micro);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--color-ink-faint);
  }

  .field input:not([type='range']) {
    height: 44px;
    padding-inline: var(--s-3);
    border-radius: 10px;
    background: var(--color-raised);
    box-shadow: 0 0 0 1px var(--color-line);
    font-size: 16px;
  }

  .field input[type='range'] {
    accent-color: var(--color-accent);
  }

  .seg {
    display: flex;
    padding: 3px;
    border-radius: 12px;
    background: var(--color-raised);
    box-shadow: 0 0 0 1px var(--color-line);
  }

  .seg button {
    flex: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    min-height: 38px;
    padding-inline: 10px;
    border-radius: 9px;
    font-size: var(--t-small);
    color: var(--color-ink-dim);
    transition-property: background-color, color;
    transition-duration: 200ms;
  }

  .seg button.on {
    color: var(--color-on-accent);
    background: var(--color-accent);
  }

  .toggle {
    display: flex;
    align-items: center;
    gap: var(--s-2);
    min-height: 44px;
    font-size: var(--t-small);
  }

  .toggle input {
    width: 18px;
    height: 18px;
    accent-color: var(--color-accent);
  }

  .stats,
  .file {
    display: flex;
    align-items: center;
    gap: 6px;
    font-family: var(--font-mono);
    font-size: var(--t-meta);
    color: var(--color-ink-dim);
    word-break: break-all;
  }

  .steps {
    display: grid;
    gap: var(--s-3);
    list-style: none;
  }

  .steps li {
    display: grid;
    gap: 6px;
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
    transition-property: background-color, scale, opacity;
    transition-duration: 150ms;
  }

  .btn.primary {
    color: var(--color-on-accent);
    background: var(--color-accent);
  }

  .btn:disabled {
    opacity: 0.5;
  }

  .note {
    font-size: var(--t-small);
    color: var(--color-ink-faint);
  }

  .reset {
    justify-self: start;
    min-height: 44px;
    font-size: var(--t-small);
    color: var(--color-ink-dim);
    text-decoration: underline;
    text-underline-offset: 3px;
  }
</style>
