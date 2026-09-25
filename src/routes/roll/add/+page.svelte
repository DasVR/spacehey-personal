<script lang="ts">
  import { onMount } from 'svelte';
  import DitherImage from '$lib/components/DitherImage.svelte';
  import Icon from '$lib/components/Icon.svelte';
  import { app } from '$lib/app.svelte.ts';
  import { identity } from '$lib/data/profile';
  import { PALETTES, rollFileName, type PaletteName, type RollLook } from '$lib/roll-name';
  import { canPickRollFolder, forgetRollFolder, pickRollFolder, savedRollFolder, writeRollFiles } from '$lib/utils/roll-folder';
  import { blobToBase64, publishToGithub, RollSendError, tokenCanReadRoll } from '$lib/utils/roll-send';
  import { formatBytes, prepPhoto, type Upscale } from '$lib/utils/photo';
  import { pageHref } from '$lib/utils/urls';

  const TOKEN_KEY = 'roll-github-token';

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

  // The look travels with the photo as a small .json sidecar.
  let note = $state('');
  let dither = $state(true);
  let grain = $state(3);
  let tones = $state<2 | 3>(3);
  let paletteName = $state<PaletteName | 'custom'>('theme');
  let customPal = $state<[string, string, string]>(['#0b0b0b', '#6e1019', '#ece7dd']);
  let focus = $state<[number, number]>([50, 50]);
  const palette = $derived(paletteName === 'custom' ? customPal : paletteName);
  const look = $derived.by<RollLook>(() => {
    const l: RollLook = {};
    if (note.trim()) l.note = note.trim();
    if (!dither) l.dither = false;
    if (grain !== 3) l.grain = grain;
    if (tones !== 3) l.tones = tones;
    if (paletteName !== 'theme') l.palette = palette;
    if (focus[0] !== 50 || focus[1] !== 50) l.focus = [Math.round(focus[0]), Math.round(focus[1])];
    return l;
  });
  const hasLook = $derived(Object.keys(look).length > 0);

  /** Tap the preview to set where the square crop centres. */
  function aimFocus(event: MouseEvent): void {
    const r = (event.currentTarget as HTMLElement).getBoundingClientRect();
    focus = [((event.clientX - r.left) / r.width) * 100, ((event.clientY - r.top) / r.height) * 100];
  }

  let out = $state<{ url: string; blob: Blob; width: number; height: number } | null>(null);

  type Sink = 'dev' | 'folder' | 'github' | 'none';
  let sink = $state<Sink>('none');
  let folderName = $state('');
  let sending = $state(false);
  let connectOpen = $state(false);
  let tokenDraft = $state('');
  let folderHandle: FileSystemDirectoryHandle | null = null;
  const canPickFolder = canPickRollFolder();

  const sinkHint = $derived(
    sink === 'dev'
      ? 'Writes the photo and its look straight into the roll folder on this computer.'
      : sink === 'folder'
        ? `Writes both files into ${folderName}.`
        : sink === 'github'
          ? 'Photo and look go up together. The page rebuilds in about a minute.'
          : 'One tap, once this browser can reach the roll.',
  );

  const ext = $derived(format === 'image/webp' ? 'webp' : 'jpg');
  const name = $derived(rollFileName(date, caption || 'untitled', ext));
  const lookName = $derived(name.replace(/\.[^.]+$/, '.json'));

  onMount(() => {
    // Visiting this page marks the device as the owner's, so the roll shows an "add" tile.
    try {
      localStorage.setItem('roll-owner', '1');
    } catch {
      /* private mode */
    }
    void detectSink();
  });

  async function detectSink(): Promise<void> {
    if (import.meta.env.DEV) {
      try {
        const res = await fetch('/roll/save');
        if (res.ok) {
          sink = 'dev';
          return;
        }
      } catch {
        /* the dev saver is not running */
      }
    }
    const dir = await savedRollFolder(false);
    if (dir) {
      folderHandle = dir;
      folderName = dir.name;
      sink = 'folder';
      return;
    }
    try {
      if (localStorage.getItem(TOKEN_KEY)) sink = 'github';
    } catch {
      /* private mode */
    }
  }

  function lookText(): string | undefined {
    return hasLook ? JSON.stringify(look, null, 2) + '\n' : undefined;
  }

  function rollFiles(): { name: string; blob: Blob }[] {
    if (!out) return [];
    const files = [{ name, blob: out.blob }];
    const text = lookText();
    if (text) files.push({ name: lookName, blob: new Blob([text], { type: 'application/json' }) });
    return files;
  }

  async function sendToRoll(): Promise<void> {
    if (!out || busy || sending) return;
    if (sink === 'none') {
      connectOpen = true;
      return;
    }
    sending = true;
    try {
      if (sink === 'dev') {
        const res = await fetch('/roll/save', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            photoName: name,
            photo: await blobToBase64(out.blob),
            lookName: hasLook ? lookName : undefined,
            look: lookText(),
          }),
        });
        if (!res.ok) throw new RollSendError('Couldn’t write that photo');
        app.say('It’s in the roll folder');
      } else if (sink === 'folder') {
        const dir = folderHandle ?? (await savedRollFolder(true));
        if (!dir) throw new RollSendError('Pick the roll folder again');
        folderHandle = dir;
        await writeRollFiles(dir, rollFiles());
        app.say('It’s in the roll folder');
      } else {
        const token = localStorage.getItem(TOKEN_KEY);
        if (!token) {
          sink = 'none';
          connectOpen = true;
          return;
        }
        await publishToGithub(token, {
          photoName: name,
          photoBase64: await blobToBase64(out.blob),
          lookName: hasLook ? lookName : undefined,
          lookText: lookText(),
        });
        app.say('Sent — it shows up after the rebuild');
      }
    } catch (error) {
      app.say(error instanceof RollSendError ? error.message : 'Couldn’t send that photo');
    } finally {
      sending = false;
    }
  }

  async function connectGithub(): Promise<void> {
    const token = tokenDraft.trim();
    if (!token) return;
    sending = true;
    try {
      await tokenCanReadRoll(token);
      localStorage.setItem(TOKEN_KEY, token);
      tokenDraft = '';
      sink = 'github';
      connectOpen = false;
      app.say('GitHub is connected');
    } catch (error) {
      app.say(error instanceof RollSendError ? error.message : 'Couldn’t connect');
    } finally {
      sending = false;
    }
  }

  async function connectFolder(): Promise<void> {
    try {
      const dir = await pickRollFolder();
      folderHandle = dir;
      folderName = dir.name;
      sink = 'folder';
      connectOpen = false;
      app.say(`Using ${dir.name}`);
    } catch {
      /* picker dismissed */
    }
  }

  async function disconnect(): Promise<void> {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* private mode */
    }
    await forgetRollFolder();
    folderHandle = null;
    folderName = '';
    sink = 'none';
    connectOpen = true;
  }

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

  function saveFile(href: string, fileName: string): void {
    const a = document.createElement('a');
    a.href = href;
    a.download = fileName;
    a.click();
  }

  /** Share or download the photo and its look together, for a hand upload. */
  async function downloadBoth(): Promise<void> {
    if (!out) return;
    const text = lookText();
    const photo = new File([out.blob], name, { type: format });
    const files = text ? [photo, new File([text], lookName, { type: 'application/json' })] : [photo];
    if (navigator.canShare?.({ files })) {
      try {
        await navigator.share({ files, title: name });
        return;
      } catch {
        return;
      }
    }
    saveFile(out.url, name);
    if (text) {
      const url = URL.createObjectURL(files[1]);
      saveFile(url, lookName);
      URL.revokeObjectURL(url);
    }
    app.say(text ? 'Saved both — drop them into GitHub' : 'Saved — now drop it into GitHub');
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
    <p class="lead">Drop a photo, tune it, and send it to the roll in one tap. Location data is stripped on the way.</p>
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
              <DitherImage
                src={out.url}
                alt={caption || 'Preview'}
                fit="contain"
                cell={grain}
                levels={tones}
                {palette}
                develop={false}
                developed={view === 'photo' || !dither}
                eager
              />
            {/key}
          {/if}
        </div>
        {#if out}
          <p class="mini-label">How it sits in the roll — tap to set the crop focus</p>
          <button type="button" class="thumb" onclick={aimFocus} aria-label="Set crop focus">
            {#key out.url}
              <DitherImage
                src={out.url}
                alt=""
                cell={grain}
                levels={tones}
                {palette}
                {focus}
                develop={false}
                developed={!dither ? true : undefined}
                eager
              />
            {/key}
            <span class="pin" style="left: {focus[0]}%; top: {focus[1]}%"></span>
          </button>
        {/if}
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

        <label class="field">
          <span>Note <small>(optional, shows in the viewer)</small></span>
          <input bind:value={note} placeholder="Shot on a disposable" maxlength="200" />
        </label>

        <fieldset class="field look">
          <legend>Look</legend>
          <label class="toggle">
            <input type="checkbox" bind:checked={dither} />
            <span>Dither it on the page</span>
          </label>
          <label class="field" class:dim={!dither}>
            <span>Grain <output>{grain}px</output></span>
            <input type="range" min="1" max="8" step="1" bind:value={grain} disabled={!dither} />
          </label>
          <div class="seg" class:dim={!dither}>
            <button type="button" class:on={tones === 2} onclick={() => (tones = 2)} disabled={!dither}>1-bit</button>
            <button type="button" class:on={tones === 3} onclick={() => (tones = 3)} disabled={!dither}>3-tone</button>
          </div>
          <div class="swatches" class:dim={!dither} role="radiogroup" aria-label="Palette">
            {#each PALETTES as p (p)}
              <button
                type="button"
                role="radio"
                aria-checked={paletteName === p}
                aria-label={p}
                class="sw"
                class:on={paletteName === p}
                style="--a: var(--{p === 'theme' ? 'dither' : `pal-${p}`}-dark); --b: var(--{p === 'theme' ? 'dither' : `pal-${p}`}-mid); --c: var(--{p === 'theme' ? 'dither' : `pal-${p}`}-light)"
                disabled={!dither}
                onclick={() => (paletteName = p)}
              ></button>
            {/each}
            <button
              type="button"
              role="radio"
              aria-checked={paletteName === 'custom'}
              class="sw custom"
              class:on={paletteName === 'custom'}
              style="--a: {customPal[0]}; --b: {customPal[1]}; --c: {customPal[2]}"
              disabled={!dither}
              onclick={() => (paletteName = 'custom')}
              aria-label="Custom"
            ></button>
          </div>
          {#if paletteName === 'custom'}
            <div class="pickers">
              {#each ['Shadows', 'Mids', 'Highlights'] as label, i (label)}
                <label><input type="color" bind:value={customPal[i]} /> {label}</label>
              {/each}
            </div>
          {/if}
        </fieldset>

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

        <div class="send">
          <button type="button" class="btn primary press" onclick={sendToRoll} disabled={!out || busy || sending}>
            <Icon name="upload" size={18} stroke={2} /> {sending ? 'Sending…' : 'Send to the roll'}
          </button>
          <p class="note">{sinkHint}</p>

          {#if sink !== 'none' && sink !== 'dev'}
            <button type="button" class="reset" onclick={disconnect}>Use a different destination</button>
          {/if}

          {#if connectOpen && sink === 'none'}
            <div class="connect">
              <label class="field">
                <span>GitHub token</span>
                <input type="password" bind:value={tokenDraft} autocomplete="off" spellcheck="false" placeholder="github_pat_…" />
              </label>
              <button type="button" class="btn press" onclick={connectGithub} disabled={!tokenDraft.trim() || sending}>
                Save token on this device
              </button>
              <p class="note">
                A fine-grained token for DasVR/spacehey-personal, Contents read and write. It stays in this browser and only adds files in the roll folder.
                <a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noopener">Create one</a>
              </p>
              {#if canPickFolder}
                <button type="button" class="btn press" onclick={connectFolder}>
                  <Icon name="image" size={18} /> Use the roll folder on this computer
                </button>
              {/if}
            </div>
          {/if}

          <details class="manual">
            <summary>Download and upload by hand</summary>
            <button type="button" class="btn press" onclick={downloadBoth} disabled={!out || busy}>
              <Icon name="download" size={18} stroke={2} /> {hasLook ? 'Save photo and look' : 'Save photo'}
            </button>
            <a class="btn press" href={UPLOAD_URL} target="_blank" rel="noopener">
              <Icon name="github" size={18} /> Open the roll on GitHub
            </a>
            <span class="note">Drop the saved file{hasLook ? 's' : ''} there and commit.</span>
          </details>
        </div>

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

  .send,
  .connect,
  .manual {
    display: grid;
    gap: var(--s-3);
  }

  .manual {
    padding-top: var(--s-2);
  }

  .manual summary {
    min-height: 44px;
    font-size: var(--t-small);
    color: var(--color-ink-dim);
    cursor: pointer;
  }

  .note a {
    color: var(--color-ink);
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

  .mini-label {
    font-family: var(--font-mono);
    font-size: var(--t-micro);
    color: var(--color-ink-faint);
  }

  .thumb {
    position: relative;
    width: min(220px, 60%);
    aspect-ratio: 4 / 5;
    border-radius: 14px;
    overflow: hidden;
    cursor: crosshair;
  }

  .pin {
    position: absolute;
    width: 18px;
    height: 18px;
    translate: -50% -50%;
    border-radius: 50%;
    border: 2px solid var(--dither-light);
    box-shadow: 0 0 0 2px oklch(0 0 0 / 0.5);
    pointer-events: none;
    transition-property: left, top;
    transition-duration: 300ms;
    transition-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .look {
    display: grid;
    gap: var(--s-3);
  }

  .dim {
    opacity: 0.4;
  }

  .swatches {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .sw {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: conic-gradient(var(--a) 0 33%, var(--b) 0 66%, var(--c) 0);
    box-shadow: 0 0 0 1px var(--color-line-strong);
    transition-property: scale, box-shadow;
    transition-duration: 200ms;
    transition-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .sw.on {
    scale: 1.15;
    box-shadow: 0 0 0 2px var(--color-accent);
  }

  .sw.custom {
    outline: 1px dashed var(--color-ink-faint);
    outline-offset: 2px;
  }

  .pickers {
    display: flex;
    flex-wrap: wrap;
    gap: var(--s-3);
    font-size: var(--t-small);
  }

  .pickers label {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .pickers input {
    width: 32px;
    height: 32px;
    padding: 0;
    border: 0;
    background: none;
  }
</style>
