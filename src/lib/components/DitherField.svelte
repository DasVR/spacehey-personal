<script lang="ts">
  import { onMount } from 'svelte';
  import { app } from '$lib/app.svelte.ts';
  import { DitherField, type FieldPalette, type Rgb } from '$lib/gl/field';
  import { readTokenColor, readTokenNumber } from '$lib/utils/color';

  let canvas: HTMLCanvasElement;
  let failed = $state(false);

  const BLACK: Rgb = [0, 0, 0];

  function readPalette(): FieldPalette {
    const root = document.documentElement;
    return {
      c0: readTokenColor(root, '--shader-0', BLACK),
      c1: readTokenColor(root, '--shader-1', BLACK),
      c2: readTokenColor(root, '--shader-2', BLACK),
      c3: readTokenColor(root, '--shader-3', BLACK),
      speed: readTokenNumber(root, '--shader-speed', 1),
      gain: readTokenNumber(root, '--shader-gain', 1),
      cell: readTokenNumber(root, '--shader-cell', 3),
    };
  }

  onMount(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const cores = navigator.hardwareConcurrency ?? 4;
    let field: DitherField;
    try {
      field = new DitherField(canvas, readPalette(), {
        fps: cores <= 4 ? 24 : 30,
        still: reduce.matches,
      });
    } catch {
      failed = true;
      return;
    }
    app.field = field;
    field.start();

    const onResize = () => field.resize();
    const resizer = new ResizeObserver(onResize);
    resizer.observe(canvas);

    const themeWatch = new MutationObserver(() => field.setPalette(readPalette()));
    themeWatch.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    const onPointer = (event: PointerEvent) => {
      field.setPointer(event.clientX / window.innerWidth, event.clientY / window.innerHeight, true);
    };
    const onLeave = () => field.setPointer(0.62, 0.22, false);
    const onScroll = () => field.setScroll(window.scrollY / window.innerHeight);
    const onVisibility = () => (document.hidden ? field.stop() : field.start());

    window.addEventListener('pointermove', onPointer, { passive: true });
    window.addEventListener('pointerdown', onPointer, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      resizer.disconnect();
      themeWatch.disconnect();
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('pointerdown', onPointer);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('visibilitychange', onVisibility);
      app.field = null;
      field.destroy();
    };
  });
</script>

<div class="field" class:failed aria-hidden="true">
  <canvas bind:this={canvas}></canvas>
  <div class="veil"></div>
</div>

<style>
  .field {
    position: fixed;
    inset: 0;
    z-index: var(--z-field);
    background: var(--color-bg);
    pointer-events: none;
  }

  canvas {
    display: block;
    width: 100%;
    /* lvh: stays put while mobile browser chrome slides in and out. */
    height: 100lvh;
    image-rendering: pixelated;
    opacity: 0;
    animation: field-in 1.2s var(--ease-out) 0.05s forwards;
  }

  /* No WebGL: a still, stepped gradient in the same palette. */
  .failed {
    background:
      radial-gradient(120% 60% at 60% -10%, var(--shader-2), transparent 60%),
      radial-gradient(90% 50% at 20% 0%, var(--shader-1), transparent 70%),
      var(--shader-0);
  }

  .failed canvas {
    display: none;
  }

  /* Keeps the lower half calm enough to read over. */
  .veil {
    position: absolute;
    inset: 0;
    background: var(--color-bg);
    /* A light hold under the top bar, clear through the horizon, heavy under the content. */
    mask-image: linear-gradient(to bottom, oklch(0 0 0 / 0.35) 0%, transparent 18%, transparent 30%, oklch(0 0 0 / 0.82) 100%);
    -webkit-mask-image: linear-gradient(to bottom, oklch(0 0 0 / 0.35) 0%, transparent 18%, transparent 30%, oklch(0 0 0 / 0.82) 100%);
  }

  @keyframes field-in {
    to {
      opacity: 1;
    }
  }
</style>
