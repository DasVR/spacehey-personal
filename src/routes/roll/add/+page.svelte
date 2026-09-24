<script lang="ts">
  import { onMount } from 'svelte';
  import DitherImage from '$lib/components/DitherImage.svelte';
  import Icon from '$lib/components/Icon.svelte';
  import { app } from '$lib/app.svelte.ts';
  import { identity } from '$lib/data/profile';
  import { roll, type RollPhoto } from '$lib/roll';
  import { PALETTES, rollFileName, type PaletteName, type RollLook } from '$lib/roll-name';
  import { formatBytes, prepPhoto, type Upscale } from '$lib/utils/photo';
  import { pageHref } from '$lib/utils/urls';

  /** Where the roll lives in the repo; GitHub's uploader drops files straight in. */
  const UPLOAD_URL = 'https://github.com/DasVR/spacehey-personal/upload/main/src/lib/roll';
  const DELETE_URL = (file: string) => `https://github.com/DasVR/spacehey-personal/delete/main/src/lib/roll/${file}`;

  /** Working on a photo already in the roll: swap the image, or just restyle it. */
  let target = $state<{ photo: RollPhoto; mode: 'replace' | 'restyle' } | null>(null);
  let picker: HTMLInputElement;
  let pickFor: RollPhoto | null = null;
  const stem = (file: string) => file.replace(/\.[^.]+$/, '');
  const extOf = (file: string) => file.split('.').pop()?.toLowerCase() ?? '';

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

  function saveLook(): void {
    const blob = new Blob([JSON.stringify(look, null, 2) + '\n'], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = lookName;
    a.click();
    URL.revokeObjectURL(a.href);
    app.say('Look saved — upload it next to the photo');
  }

  /** Tap the preview to set where the square crop centres. */
  function aimFocus(event: MouseEvent): void {
    const r = (event.currentTarget as HTMLElement).getBoundingClientRect();
    focus = [((event.clientX - r.left) / r.width) * 100, ((event.clientY - r.top) / r.height) * 100];
  }

  let out = $state<{ url: string; blob: Blob; width: number; height: number } | null>(null);

  const ext = $derived(format === 'image/webp' ? 'webp' : 'jpg');
  /** Replacing keeps the old file name so it takes the same spot and overwrites on upload. */
  const name = $derived(target ? `${stem(target.photo.file)}.${ext}` : rollFileName(date, caption || 'untitled', ext));
  const sameName = $derived(!target || `${stem(target.photo.file)}.${ext}` === target.photo.file);
  const lookName = $derived(name.replace(/\.[^.]+$/, '.json'));

  onMount(() => {
    // Visiting this page marks the device as the owner's, so the roll shows an "add" tile.
    try {
      localStorage.setItem('roll-owner', '1');
    } catch {
      /* private mode */
    }
  });

  function loadLook(photo: RollPhoto): void {
    const l = photo.look;
    note = l.note ?? '';
    dither = l.dither !== false;
    grain = l.grain ?? 3;
    tones = l.tones ?? 3;
    if (Array.isArray(l.palette)) {
      customPal = [...l.palette];
      paletteName = 'custom';
    } else paletteName = l.palette ?? 'theme';
    focus = l.focus ?? [50, 50];
  }

  /** Start from a photo that's already in the roll. */
  async function begin(photo: RollPhoto, mode: 'replace' | 'restyle', file?: File): Promise<void> {
    let f = file;
    if (!f) {
      const blob = await (await fetch(photo.src)).blob();
      f = new File([blob], photo.file, { type: blob.type || 'image/jpeg' });
    }
    await take(f);
    target = { photo, mode };
    caption = photo.caption;
    date = photo.date || date;
    loadLook(photo);
    // Match the existing extension when we can, so the upload overwrites it.
    const e = extOf(photo.file);
    if (e === 'webp') format = 'image/webp';
    else if (e === 'jpg' || e === 'jpeg') format = 'image/jpeg';
    upscale = 1;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function replace(photo: RollPhoto): void {
    pickFor = photo;
    picker.click();
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
    <h1>{target ? (target.mode === 'replace' ? `Replace “${target.photo.caption}”` : `Restyle “${target.photo.caption}”`) : 'Your roll'}</h1>
    <p class="lead">
      {#if target?.mode === 'replace'}
        The new photo keeps this one's name, so uploading it swaps it in place.
      {:else if target}
        Tune how it shows on the page, then save the look file.
      {:else}
        Swap photos out, restyle them, or add new ones. Location data is stripped on the way.
      {/if}
    </p>
  </header>

  <input
    bind:this={picker}
    class="hidden-input"
    type="file"
    accept="image/*"
    onchange={(e) => {
      const f = e.currentTarget.files?.[0];
      if (f && pickFor) begin(pickFor, 'replace', f);
      e.currentTarget.value = '';
    }}
  />

  {#if !source}
    {#if roll.length}
      <ul class="current">
        {#each roll as photo, i (photo.file)}
          <li style="--i: {i}">
            <div class="thumb-sm">
              <DitherImage
                src={photo.src}
                alt={photo.caption}
                cell={photo.look.grain ?? 3}
                levels={photo.look.tones ?? 3}
                palette={photo.look.palette ?? 'theme'}
                focus={photo.look.focus}
                developed={photo.look.dither === false ? true : undefined}
              />
            </div>
            <div class="cur-txt">
              <strong>{photo.caption}</strong>
              <span>{photo.file}</span>
            </div>
            <div class="cur-actions">
              <button type="button" class="chip press" onclick={() => replace(photo)}><Icon name="upload" size={14} /> Replace</button>
              <button type="button" class="chip press" onclick={() => begin(photo, 'restyle')}><Icon name="sparkle" size={14} /> Restyle</button>
              <a class="chip danger press" href={DELETE_URL(photo.file)} target="_blank" rel="noopener"><Icon name="close" size={14} /> Remove</a>
            </div>
          </li>
        {/each}
      </ul>
      <h2 class="sub">Add a new photo</h2>
    {/if}
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

        <ol class="steps">
          <li>
            <button type="button" class="btn primary press" onclick={share} disabled={!out || busy}>
              <Icon name="download" size={18} stroke={2} /> Save photo
            </button>
          </li>
          {#if hasLook}
            <li>
              <button type="button" class="btn press" onclick={saveLook}>
                <Icon name="download" size={18} stroke={2} /> Save look ({lookName})
              </button>
            </li>
          {/if}
          <li>
            <a class="btn press" href={UPLOAD_URL} target="_blank" rel="noopener">
              <Icon name="upload" size={18} stroke={2} /> Upload to the roll on GitHub
            </a>
            <span class="note">Drop the saved file{hasLook ? 's' : ''} there and commit. The page rebuilds itself in about a minute.</span>
          </li>
        </ol>

        {#if target && !sameName}
          <p class="note warn">This saves as <b>{name}</b>. After uploading, remove the old <b>{target.photo.file}</b> so it doesn't show twice.</p>
        {/if}
        <button
          type="button"
          class="reset"
          onclick={() => {
            source = null;
            target = null;
          }}>Back to your roll</button
        >
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

  .hidden-input {
    display: none;
  }

  .current {
    list-style: none;
    display: grid;
    gap: var(--s-2);
  }

  .current li {
    display: grid;
    grid-template-columns: 64px minmax(0, 1fr);
    gap: 4px var(--s-3);
    align-items: center;
    padding: 8px;
    border-radius: 18px;
    background: var(--color-surface);
    box-shadow: 0 0 0 1px var(--color-line);
    animation: cur-in 480ms cubic-bezier(0.34, 1.3, 0.5, 1) both;
    animation-delay: calc(var(--i) * 40ms);
  }

  .thumb-sm {
    grid-row: span 2;
    width: 64px;
    aspect-ratio: 4 / 5;
    border-radius: 10px;
    overflow: hidden;
  }

  .cur-txt {
    display: grid;
    min-width: 0;
  }

  .cur-txt strong {
    font-weight: 600;
  }

  .cur-txt span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-family: var(--font-mono);
    font-size: var(--t-micro);
    color: var(--color-ink-faint);
  }

  .cur-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .chip {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    min-height: 32px;
    padding-inline: 10px;
    border-radius: 999px;
    font-size: var(--t-meta);
    font-weight: 600;
    color: var(--color-ink);
    text-decoration: none;
    background: var(--color-raised);
  }

  .chip.danger {
    color: var(--color-accent);
  }

  .sub {
    margin-top: var(--s-3);
    font-size: var(--t-title);
    font-weight: 600;
  }

  .warn {
    color: var(--color-accent);
  }

  @keyframes cur-in {
    from {
      opacity: 0;
      transform: translateY(10px) scale(0.97);
    }
  }
</style>
