<script lang="ts">
  import Icon from './Icon.svelte';
  import type { Friend, SocialPlatform } from '$lib/data/types';
  import { assetUrl } from '$lib/utils/urls';

  interface Props {
    friends: Friend[];
  }

  let { friends }: Props = $props();

  /** Friends whose social avatar failed to load fall back to their colour tile. */
  let broken = $state<Record<string, boolean>>({});

  const profileUrl: Record<SocialPlatform, (h: string) => string> = {
    instagram: (h) => `https://instagram.com/${h}`,
    x: (h) => `https://x.com/${h}`,
    github: (h) => `https://github.com/${h}`,
    tiktok: (h) => `https://tiktok.com/@${h}`,
    bluesky: (h) => `https://bsky.app/profile/${h}`,
    youtube: (h) => `https://youtube.com/@${h}`,
    twitch: (h) => `https://twitch.tv/${h}`,
  };

  // unavatar.io resolves a public profile picture from the platform + handle.
  const unavatarKey: Record<SocialPlatform, string> = {
    instagram: 'instagram',
    x: 'x',
    github: 'github',
    tiktok: 'tiktok',
    bluesky: 'bluesky',
    youtube: 'youtube',
    twitch: 'twitch',
  };

  function avatar(f: Friend): string {
    if (f.social && !broken[f.id]) {
      return `https://unavatar.io/${unavatarKey[f.social.platform]}/${encodeURIComponent(f.social.handle)}?fallback=false`;
    }
    return assetUrl(f.tile);
  }
</script>

<ul class="grid">
  {#each friends as friend, i (friend.id)}
    <li style="--i: {i}">
      <svelte:element
        this={friend.social ? 'a' : 'div'}
        class="friend press"
        href={friend.social ? profileUrl[friend.social.platform](friend.social.handle) : undefined}
        target={friend.social ? '_blank' : undefined}
        rel={friend.social ? 'noopener' : undefined}
      >
        <span class="face">
          <img
            src={avatar(friend)}
            alt=""
            loading="lazy"
            decoding="async"
            referrerpolicy="no-referrer"
            onerror={() => (broken = { ...broken, [friend.id]: true })}
          />
          <span class="rank">{i + 1}</span>
        </span>
        <span class="text">
          <span class="name">{friend.name}</span>
          <span class="cap">{friend.caption}</span>
          {#if friend.social}
            <span class="handle"><Icon name={friend.social.platform} size={11} stroke={2} /> @{friend.social.handle}</span>
          {:else}
            <span class="handle dim">no socials yet</span>
          {/if}
        </span>
      </svelte:element>
    </li>
  {/each}
</ul>

<style>
  .grid {
    list-style: none;
    display: grid;
    /* Two cards a row on phones so nothing gets clipped; four on wide screens. */
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--s-2);
  }

  @media (max-width: 359px) {
    .grid {
      grid-template-columns: minmax(0, 1fr);
    }
  }

  @media (min-width: 760px) {
    .grid {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }
  }

  li {
    min-width: 0;
    animation: pop 500ms cubic-bezier(0.34, 1.56, 0.64, 1) both;
    animation-delay: calc(var(--i) * 45ms);
  }

  .friend {
    display: flex;
    align-items: center;
    gap: 8px;
    height: 100%;
    padding: 8px;
    border-radius: 16px;
    color: inherit;
    text-decoration: none;
    background: var(--color-surface);
    box-shadow: 0 0 0 1px var(--color-line);
    transition-property: background-color, scale, box-shadow;
    transition-duration: 200ms;
    transition-timing-function: var(--ease-out);
  }

  a.friend:hover {
    background: var(--color-hover);
    box-shadow: 0 0 0 1px var(--color-line-strong);
  }

  .face {
    position: relative;
    flex: none;
    width: 42px;
    height: 42px;
    border-radius: 50%;
    outline: 1px solid var(--img-outline);
    outline-offset: -1px;
  }

  .face img {
    display: block;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
    background: var(--color-raised);
  }

  .rank {
    position: absolute;
    left: -4px;
    top: -4px;
    display: grid;
    place-items: center;
    min-width: 18px;
    height: 18px;
    padding-inline: 4px;
    border-radius: 9px;
    font-family: var(--font-mono);
    font-size: 10px;
    font-weight: 500;
    color: var(--color-on-accent);
    background: var(--color-accent);
    box-shadow: 0 0 0 2px var(--color-surface);
  }

  .text {
    display: grid;
    min-width: 0;
    line-height: 1.3;
  }

  .name,
  .cap,
  .handle {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .name {
    font-size: var(--t-small);
    font-weight: 600;
    color: var(--color-ink);
  }

  .cap {
    font-size: var(--t-micro);
    color: var(--color-ink-dim);
  }

  .handle {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-top: 2px;
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--color-accent);
  }

  .handle.dim {
    color: var(--color-ink-faint);
  }

  @keyframes pop {
    from {
      opacity: 0;
      scale: 0.9;
      translate: 0 8px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    li {
      animation: none;
    }
  }
</style>
