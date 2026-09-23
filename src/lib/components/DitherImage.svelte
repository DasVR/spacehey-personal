<script lang="ts">
  import { onMount } from 'svelte';
  import { ditherLevel, luma } from '$lib/utils/bayer';
  import { parseHex } from '$lib/utils/color';
  import { assetUrl } from '$lib/utils/urls';

  interface Props {
    src: string;
    alt: string;
    /** CSS pixels per dither cell. */
    cell?: number;
    /** 2 = one-bit, 3 = adds the mid tone. */
    levels?: 2 | 3;
    /** Hover (or press and hold) develops the dither back into the photo. */
    develop?: boolean;
    /** Force the photo on (true) or the dither on (false); undefined = interactive. */
    developed?: boolean;
    eager?: boolean;
    /** `contain` letterboxes instead of cropping (lightbox). */
    fit?: 'cover' | 'contain';
  }

  let {
    src,
    alt,
    cell = 3,
    levels = 3,
    develop = true,
    developed = undefined,
    eager = false,
    fit = 'cover',
  }: Props = $props();

  let frame: HTMLDivElement;
  let canvas: HTMLCanvasElement;
  let img: HTMLImageElement;
  let ready = $state(false);
  let pressed = $state(false);
  let hovering = $state(false);

  const url = $derived(assetUrl(src));
  const showPhoto = $derived(developed ?? (develop && (pressed || hovering)));

  function palette(): number[][] {
    const style = getComputedStyle(frame);
    const pick = (name: string) => (parseHex(style.getPropertyValue(name)) ?? [0, 0, 0]).map((c) => Math.round(c * 255));
    const dark = pick('--dither-dark');
    const light = pick('--dither-light');
    return levels === 2 ? [dark, light] : [dark, pick('--dither-mid'), light];
  }

  function render(): void {
    if (!img?.complete || !img.naturalWidth || !frame) return;
    // Layout size, not the transformed box: the card may be mid-animation.
    const fw = frame.offsetWidth;
    const fh = frame.offsetHeight;
    if (!fw || !fh) return;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;

    // In contain mode the canvas matches the photo's own box inside the frame.
    let bw = fw;
    let bh = fh;
    if (fit === 'contain') {
      const s = Math.min(fw / iw, fh / ih);
      bw = iw * s;
      bh = ih * s;
    }
    canvas.style.width = `${bw}px`;
    canvas.style.height = `${bh}px`;

    const w = Math.max(8, Math.round(bw / cell));
    const h = Math.max(8, Math.round(bh / cell));
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // object-fit: cover, done by hand (contain maps the whole image).
    const scale = fit === 'contain' ? Math.min(w / iw, h / ih) : Math.max(w / iw, h / ih);
    const sw = w / scale;
    const sh = h / scale;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, (iw - sw) / 2, (ih - sh) / 2, sw, sh, 0, 0, w, h);

    const data = ctx.getImageData(0, 0, w, h);
    const px = data.data;
    const lum = new Float32Array(w * h);
    let lo = 1;
    let hi = 0;
    for (let i = 0; i < lum.length; i += 1) {
      const v = luma(px[i * 4], px[i * 4 + 1], px[i * 4 + 2]);
      lum[i] = v;
      if (v < lo) lo = v;
      if (v > hi) hi = v;
    }
    // Stretch to the full range so dark photos still read.
    const span = Math.max(0.08, hi - lo);
    const colors = palette();
    for (let y = 0; y < h; y += 1) {
      for (let x = 0; x < w; x += 1) {
        const i = y * w + x;
        const v = Math.pow(Math.max(0, (lum[i] - lo) / span), 0.85);
        const c = colors[ditherLevel(v, x, y, colors.length)];
        px[i * 4] = c[0];
        px[i * 4 + 1] = c[1];
        px[i * 4 + 2] = c[2];
        px[i * 4 + 3] = 255;
      }
    }
    ctx.putImageData(data, 0, 0);
    ready = true;
  }

  /** The reveal grows from wherever the finger or cursor is. */
  function aim(event: PointerEvent): void {
    const rect = frame.getBoundingClientRect();
    frame.style.setProperty('--px', `${((event.clientX - rect.left) / rect.width) * 100}%`);
    frame.style.setProperty('--py', `${((event.clientY - rect.top) / rect.height) * 100}%`);
  }

  // Re-dither when the source or the dither settings change.
  $effect(() => {
    void url;
    void cell;
    void levels;
    void fit;
    ready = false;
    if (img) requestAnimationFrame(render);
  });

  onMount(() => {
    const onLoad = () => render();
    img.addEventListener('load', onLoad);
    if (img.complete) render();

    const resizer = new ResizeObserver(() => render());
    resizer.observe(frame);
    const themeWatch = new MutationObserver(() => requestAnimationFrame(render));
    themeWatch.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    return () => {
      img.removeEventListener('load', onLoad);
      resizer.disconnect();
      themeWatch.disconnect();
    };
  });
</script>

<!-- Press-to-develop is a visual flourish; the <img> carries the meaning. -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="dither {fit}"
  class:ready
  class:photo={showPhoto}
  bind:this={frame}
  onpointerenter={(e) => {
    aim(e);
    if (e.pointerType === 'mouse') hovering = true;
  }}
  onpointermove={aim}
  onpointerleave={() => {
    hovering = false;
    pressed = false;
  }}
  onpointerdown={(e) => {
    aim(e);
    pressed = true;
  }}
  onpointerup={() => (pressed = false)}
  onpointercancel={() => (pressed = false)}
>
  <img bind:this={img} src={url} {alt} loading={eager ? 'eager' : 'lazy'} decoding="async" draggable="false" />
  <canvas bind:this={canvas} aria-hidden="true"></canvas>
</div>

<style>
  /* Animatable reveal radius for the develop effect. */
  @property --reveal {
    syntax: '<percentage>';
    inherits: false;
    /* Negative so the mask is fully closed at rest (no hole under the pointer). */
    initial-value: -20%;
  }

  .dither {
    --px: 50%;
    --py: 50%;
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: var(--dither-dark);
    border-radius: inherit;
    -webkit-touch-callout: none;
    user-select: none;
  }

  .contain {
    display: grid;
    place-items: center;
    background: transparent;
  }

  img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: inherit;
    opacity: 0;
    transition-property: opacity;
    transition-duration: 400ms;
    transition-timing-function: var(--ease-out);
  }

  .contain img {
    object-fit: contain;
  }

  canvas {
    --reveal: -20%;
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    margin: auto;
    border-radius: inherit;
    image-rendering: pixelated;
    opacity: 0;
    /* The photo shows through a hole that grows from the pointer. */
    mask-image: radial-gradient(circle at var(--px) var(--py), transparent var(--reveal), black calc(var(--reveal) + 18%));
    -webkit-mask-image: radial-gradient(circle at var(--px) var(--py), transparent var(--reveal), black calc(var(--reveal) + 18%));
    transition-property: opacity, --reveal;
    transition-duration: 400ms, 650ms;
    transition-timing-function: var(--ease-out);
  }

  .ready canvas {
    opacity: 1;
  }

  .ready img {
    opacity: 1;
  }

  .photo canvas {
    --reveal: 160%;
  }

  @media (prefers-reduced-motion: reduce) {
    canvas {
      transition-property: opacity;
      mask-image: none;
      -webkit-mask-image: none;
    }

    .photo canvas {
      opacity: 0;
    }
  }
</style>
