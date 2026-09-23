<script lang="ts">
  import Icon from './Icon.svelte';
  import { app } from '$lib/app.svelte.ts';

  interface Props {
    value: string;
    label: string;
    /** Toast after copying. */
    done?: string;
  }

  let { value, label, done = 'Copied' }: Props = $props();
  let copied = $state(false);
  let timer = 0;

  async function copy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(value);
      copied = true;
      app.say(done);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => (copied = false), 1600);
    } catch {
      app.say('Couldn’t reach the clipboard');
    }
  }
</script>

<button type="button" class="copy press" class:copied onclick={copy} aria-label={copied ? `${label} copied` : label}>
  <span class="glyph" aria-hidden="true">
    <span class="a"><Icon name="copy" size={17} /></span>
    <span class="b"><Icon name="check" size={17} /></span>
  </span>
</button>

<style>
  .copy {
    display: grid;
    place-items: center;
    width: 44px;
    height: 44px;
    border-radius: var(--r-control);
    color: var(--color-ink-dim);
    transition-property: color, background-color, scale;
    transition-duration: 150ms;
  }

  .copy:hover {
    color: var(--color-ink);
    background: var(--color-hover);
  }

  .copied {
    color: var(--color-live);
  }

  .glyph {
    position: relative;
    display: grid;
    width: 17px;
    height: 17px;
  }

  /* Both icons stay mounted; cross-fade with scale + blur. */
  .a,
  .b {
    grid-area: 1 / 1;
    transition-property: opacity, scale, filter;
    transition-duration: 200ms;
    transition-timing-function: cubic-bezier(0.2, 0, 0, 1);
  }

  .b {
    opacity: 0;
    scale: 0.25;
    filter: blur(4px);
  }

  .copied .a {
    opacity: 0;
    scale: 0.25;
    filter: blur(4px);
  }

  .copied .b {
    opacity: 1;
    scale: 1;
    filter: blur(0);
  }
</style>
