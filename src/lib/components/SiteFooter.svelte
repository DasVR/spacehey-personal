<script lang="ts">
  import Icon from './Icon.svelte';
  import { app } from '$lib/app.svelte.ts';
  import type { Mode } from '$lib/data/types';
  import { pageHref } from '$lib/utils/urls';

  interface Props {
    mode: Mode;
    host: string;
    since?: string;
  }

  let { mode, host, since }: Props = $props();
</script>

<footer class="foot">
  <div class="row">
    <button type="button" class="pill press" onclick={() => app.replay()}>
      <Icon name="nfc" size={16} />
      Replay tap
    </button>
    <a class="pill press" href={pageHref('/links')}>
      <Icon name="globe" size={16} />
      All links
    </a>
    <a class="pill press" href={pageHref('/tags')}>
      <Icon name="qr" size={16} />
      Tags & QR
    </a>
  </div>

  <p class="fine">
    {#if mode === 'casual'}
      <span class="count">{String(app.visitors).padStart(6, '0')}</span> visitors · member since {since} ·
    {/if}
    {host} · not a template · dither is a feature
  </p>
</footer>

<style>
  .foot {
    display: grid;
    gap: var(--s-4);
    padding-block: var(--s-6) calc(var(--s-8) + env(safe-area-inset-bottom));
    border-top: 1px solid var(--color-line);
  }

  .row {
    display: flex;
    flex-wrap: wrap;
    gap: var(--s-2);
  }

  .pill {
    display: inline-flex;
    align-items: center;
    gap: var(--s-2);
    height: 40px;
    padding-inline: var(--s-4);
    border-radius: var(--r-pill);
    font-size: var(--t-small);
    font-weight: 500;
    color: var(--color-ink);
    background: var(--color-surface);
    box-shadow: 0 0 0 1px var(--color-line);
    text-decoration: none;
    transition-property: background-color, scale;
    transition-duration: 150ms;
  }

  .pill:hover {
    background: var(--color-raised);
  }

  .fine {
    font-family: var(--font-mono);
    font-size: var(--t-micro);
    line-height: 1.7;
    color: var(--color-ink-faint);
  }

  .count {
    color: var(--color-accent);
    font-variant-numeric: tabular-nums;
  }
</style>
