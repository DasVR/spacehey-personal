<script lang="ts">
  import type { SocialLink } from '$lib/data/types';

  interface Props {
    links: SocialLink[];
  }

  let { links }: Props = $props();

  function isExternal(href: string): boolean {
    return href.startsWith('http://') || href.startsWith('https://');
  }
</script>

<section class="links">
  <p class="eyebrow">links</p>
  <div class="grid">
    {#each links as link (link.id)}
      <a
        class="tile"
        class:accent={link.accent}
        href={link.href}
        rel={isExternal(link.href) ? 'noreferrer noopener' : undefined}
        target={isExternal(link.href) ? '_blank' : undefined}
      >
        <span class="mark">{link.mark}</span>
        <span class="label">{link.label}</span>
      </a>
    {/each}
  </div>
</section>

<style>
  .links {
    background: var(--color-panel);
    border: 1px solid var(--color-line);
    padding: 0.9rem var(--s-4);
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--s-2);
  }

  .tile {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 0.65rem 0.25rem;
    background: var(--color-void);
    color: var(--color-ink);
    border: 1px solid var(--color-panel-ink);
    text-decoration: none;
    transition:
      transform 150ms var(--ease-out),
      border-color 150ms ease;
  }

  .tile:hover {
    transform: translateY(-3px);
    border-color: var(--color-red);
    color: var(--color-ink);
  }

  .tile:active {
    transform: scale(0.96);
  }

  .accent {
    background: var(--color-red);
    color: var(--color-on-red);
  }

  .accent:hover {
    border-color: var(--color-panel-ink);
    color: var(--color-on-red);
  }

  .mark {
    font-family: var(--font-mono);
    font-size: 13px;
    font-weight: 700;
  }

  .label {
    font-size: 8px;
    color: var(--color-ink-dim);
    text-transform: lowercase;
  }

  .accent .label {
    color: color-mix(in srgb, var(--color-on-red) 80%, transparent);
  }
</style>
