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
        class="friend"
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
          {#if friend.social}
            <span class="badge" aria-hidden="true"><Icon name={friend.social.platform} size={12} stroke={2} /></span>
          {/if}
        </span>
        <span class="name">{friend.name}</span>
        <span class="cap">{friend.social ? `@${friend.social.handle}` : friend.caption}</span>
      </svelte:element>
    </li>
  {/each}
</ul>

<style>
  .grid {
    list-style: none;
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: var(--s-4) var(--s-3);
  }

  .friend {
    display: grid;
    gap: 2px;
    color: inherit;
    text-decoration: none;
  }

  .face {
    position: relative;
    display: block;
    aspect-ratio: 1;
    border-radius: 50%;
    margin-bottom: var(--s-2);
    outline: 1px solid var(--img-outline);
    outline-offset: -1px;
    transition-property: scale;
    transition-duration: 200ms;
    transition-timing-function: var(--ease-out);
  }

  a.friend:hover .face {
    scale: 1.04;
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
    left: -2px;
    top: -2px;
    display: grid;
    place-items: center;
    min-width: 20px;
    height: 20px;
    padding-inline: 5px;
    border-radius: 10px;
    font-family: var(--font-mono);
    font-size: 10px;
    font-weight: 500;
    color: var(--color-on-accent);
    background: var(--color-accent);
    box-shadow: 0 0 0 2px var(--color-bg);
  }

  .badge {
    position: absolute;
    right: -2px;
    bottom: -2px;
    display: grid;
    place-items: center;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    color: var(--color-ink);
    background: var(--color-raised);
    box-shadow: 0 0 0 2px var(--color-bg);
  }

  .name {
    font-size: var(--t-small);
    font-weight: 500;
    color: var(--color-ink);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: center;
  }

  .cap {
    font-size: var(--t-micro);
    color: var(--color-ink-faint);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: center;
  }
</style>
