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
    eager?: boolean;
  }

  let { src, alt, cell = 3, levels = 3, develop = true, eager = false }: Props = $props();

  let frame: HTMLDivElement;
  let canvas: HTMLCanvasElement;
  let img: HTMLImageElement;
  let ready = $state(false);
  let pressed = $state(false);

  const url = $derived(assetUrl(src));

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
    const w = Math.max(8, Math.round(fw / cell));
    const h = Math.max(8, Math.round(fh / cell));
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // object-fit: cover, done by hand.
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    const scale = Math.max(w / iw, h / ih);
    const sw = w / scale;
    const sh = h / scale;
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
    // Stretch to the full range so dark stand-in photos still read.
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
  class="dither"
  class:ready
  class:developed={develop && pressed}
  class:develop
  bind:this={frame}
  onpointerdown={() => (pressed = true)}
  onpointerup={() => (pressed = false)}
  onpointercancel={() => (pressed = false)}
  onpointerleave={() => (pressed = false)}
>
  <img bind:this={img} src={url} {alt} loading={eager ? 'eager' : 'lazy'} decoding="async" draggable="false" />
  <canvas bind:this={canvas} aria-hidden="true"></canvas>
</div>

<style>
  .dither {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: var(--dither-dark);
    border-radius: inherit;
    -webkit-touch-callout: none;
    user-select: none;
  }

  img,
  canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: inherit;
  }

  img {
    opacity: 0;
    transition-property: opacity;
    transition-duration: 300ms;
    transition-timing-function: var(--ease-out);
  }

  canvas {
    image-rendering: pixelated;
    opacity: 0;
    transition-property: opacity;
    transition-duration: 300ms;
    transition-timing-function: var(--ease-out);
  }

  .ready canvas {
    opacity: 1;
  }

  /* Developing: the photo fades up under the dither, then the dither lifts. */
  .ready img {
    opacity: 1;
  }

  .developed canvas {
    opacity: 0;
  }

  @media (hover: hover) and (pointer: fine) {
    .develop:hover canvas {
      opacity: 0;
    }
  }
</style>
