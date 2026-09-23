<script lang="ts">
  import type { Mode } from '$lib/data/types';
  import { pageHref } from '$lib/utils/urls';

  interface Props {
    mode: Mode;
    host: string;
  }

  let { mode, host }: Props = $props();
</script>

<header class="bar">
  <a class="brand" href={pageHref(mode === 'pro' ? '/pro' : '/')}>
    <span class="mark" aria-hidden="true"></span>
    <span>{host}</span>
  </a>

  <nav class="switch" aria-label="Profile mode" data-mode={mode}>
    <span class="thumb" aria-hidden="true"></span>
    <a href={pageHref('/')} aria-current={mode === 'casual' ? 'page' : undefined} data-sveltekit-noscroll>Casual</a>
    <a href={pageHref('/pro')} aria-current={mode === 'pro' ? 'page' : undefined} data-sveltekit-noscroll>Pro</a>
  </nav>
</header>

<style>
  .bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--s-4);
    padding-block: var(--s-4);
    transition-property: opacity;
    transition-duration: 400ms;
    transition-timing-function: var(--ease-out);
  }

  /* The island owns the top edge while a tap plays. */
  :global(html.arrive) .bar,
  :global(html.arriving) .bar {
    opacity: 0;
  }

  .brand {
    display: inline-flex;
    align-items: center;
    gap: var(--s-2);
    font-family: var(--font-mono);
    font-size: var(--t-meta);
    letter-spacing: 0.02em;
    color: var(--color-ink-dim);
    text-decoration: none;
    min-height: 44px;
    transition-property: color;
    transition-duration: 150ms;
  }

  .brand:hover {
    color: var(--color-ink);
  }

  /* A 2×2 dither cell as the mark. */
  .mark {
    width: 10px;
    height: 10px;
    background:
      linear-gradient(var(--color-accent), var(--color-accent)) 0 0 / 5px 5px no-repeat,
      linear-gradient(var(--color-ink), var(--color-ink)) 5px 5px / 5px 5px no-repeat;
  }

  .switch {
    --pad: 3px;
    position: relative;
    display: grid;
    grid-template-columns: 1fr 1fr;
    padding: var(--pad);
    border-radius: var(--r-pill);
    background: color-mix(in oklch, var(--color-surface) 80%, transparent);
    box-shadow: var(--shadow-float);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
  }

  .switch a {
    position: relative;
    z-index: 1;
    display: grid;
    place-items: center;
    min-width: 4.25rem;
    min-height: 34px;
    padding-inline: var(--s-3);
    font-size: var(--t-small);
    font-weight: 500;
    color: var(--color-ink-dim);
    text-decoration: none;
    border-radius: var(--r-pill);
    transition-property: color;
    transition-duration: 150ms;
  }

  /* 44px hit area without growing the pill. */
  .switch a::after {
    content: '';
    position: absolute;
    inset: -5px 0;
  }

  .switch a[aria-current='page'] {
    color: var(--color-on-accent);
  }

  .thumb {
    position: absolute;
    top: var(--pad);
    bottom: var(--pad);
    left: var(--pad);
    width: calc(50% - var(--pad));
    border-radius: var(--r-pill);
    background: var(--color-accent);
    transition-property: translate;
    transition-duration: 300ms;
    transition-timing-function: var(--ease-out);
  }

  [data-mode='pro'] .thumb {
    translate: 100% 0;
  }
</style>
