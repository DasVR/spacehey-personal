<script lang="ts">
  import { onMount } from 'svelte';
  import type { GiscusConfig } from '$lib/data/types';
  import { assetUrl } from '$lib/utils/urls';

  interface Props {
    config: GiscusConfig;
  }

  let { config }: Props = $props();

  let host: HTMLDivElement;
  let loaded = $state(false);

  /*
   * Giscus stores every entry as a GitHub Discussion comment: visitors sign in
   * with GitHub, can react, reply, attach images and format with Markdown,
   * and the owner moderates (hide, delete, lock, block) from GitHub itself.
   * The iframe loads only when the section scrolls into view.
   */
  function mount(): void {
    if (loaded) return;
    loaded = true;
    const theme = new URL(assetUrl('/giscus/theme.css'), window.location.origin).href;
    const s = document.createElement('script');
    s.src = 'https://giscus.app/client.js';
    s.async = true;
    s.crossOrigin = 'anonymous';
    const attrs: Record<string, string> = {
      'data-repo': config.repo,
      'data-repo-id': config.repoId,
      'data-category': config.category,
      'data-category-id': config.categoryId,
      'data-mapping': 'specific',
      'data-term': 'Guestbook',
      'data-strict': '1',
      'data-reactions-enabled': '1',
      'data-emit-metadata': '0',
      'data-input-position': 'top',
      // A custom theme must be a public URL; localhost can't serve it to giscus.
      'data-theme': /localhost|127\.0\.0\.1/.test(window.location.host) ? 'dark_dimmed' : theme,
      'data-lang': 'en',
      'data-loading': 'lazy',
    };
    for (const [k, v] of Object.entries(attrs)) s.setAttribute(k, v);
    host.appendChild(s);
  }

  onMount(() => {
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          mount();
          io.disconnect();
        }
      },
      { rootMargin: '400px' },
    );
    io.observe(host);
    return () => io.disconnect();
  });
</script>

<div class="giscus-host" bind:this={host}>
  {#if !loaded}<p class="wait">Loading the guestbook…</p>{/if}
</div>

<style>
  .giscus-host {
    min-height: 240px;
  }

  .giscus-host :global(.giscus),
  .giscus-host :global(.giscus-frame) {
    width: 100%;
    color-scheme: normal;
  }

  .wait {
    font-family: var(--font-mono);
    font-size: var(--t-micro);
    color: var(--color-ink-faint);
  }
</style>
