<script lang="ts">
  import type { IconName } from '$lib/data/types';

  interface Props {
    name: IconName;
    size?: number;
    /** 1.5 beside regular text, 2 beside semibold. */
    stroke?: 1.5 | 2;
  }

  let { name, size = 18, stroke = 1.5 }: Props = $props();
</script>

<svg
  class="icon"
  width={size}
  height={size}
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width={stroke}
  stroke-linecap="round"
  stroke-linejoin="round"
  aria-hidden="true"
>
  {#if name === 'github'}
    <path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21" />
  {:else if name === 'globe'}
    <circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
  {:else if name === 'mail'}
    <rect x="3" y="5" width="18" height="14" rx="3" /><path d="m4 7 8 6 8-6" />
  {:else if name === 'instagram'}
    <rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><path d="M17.5 6.5h.01" />
  {:else if name === 'x'}
    <path d="M4 4l16 16M20 4 4 20" />
  {:else if name === 'discord'}
    <path d="M8 7.5a14 14 0 0 1 8 0M7 16.5a14 14 0 0 0 10 0" /><path d="M8.5 5 7 5.3C5.5 7.8 4.5 10.8 4.5 15c1.4 1.5 3 2.4 4.5 2.8L10 16m4-11 1.5.3c1.5 2.5 2.5 5.5 2.5 9.7-1.4 1.5-3 2.4-4.5 2.8L14 16" /><circle cx="9.5" cy="12" r="1" /><circle cx="14.5" cy="12" r="1" />
  {:else if name === 'spotify'}
    <circle cx="12" cy="12" r="9" /><path d="M7.5 9.5c3-1 6.5-.7 9 .8M8 12.6c2.4-.7 5-.5 7 .7M8.5 15.5c1.9-.5 3.8-.3 5.3.5" />
  {:else if name === 'share'}
    <path d="M12 3v12M8 7l4-4 4 4" /><path d="M5 12v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" />
  {:else if name === 'contact'}
    <circle cx="10" cy="8" r="4" /><path d="M3 20a7 7 0 0 1 12.5-4.3M19 14v6M16 17h6" />
  {:else if name === 'copy'}
    <rect x="8" y="8" width="12" height="12" rx="2.5" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
  {:else if name === 'check'}
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  {:else if name === 'nfc'}
    <path d="M6 8.5a5 5 0 0 1 0 7M9.5 6a9 9 0 0 1 0 12M13 3.5a13 13 0 0 1 0 17" /><circle cx="3.5" cy="12" r="1" />
  {:else if name === 'qr'}
    <rect x="3.5" y="3.5" width="6" height="6" rx="1" /><rect x="14.5" y="3.5" width="6" height="6" rx="1" /><rect x="3.5" y="14.5" width="6" height="6" rx="1" /><path d="M14.5 14.5h2v2h-2zM18.5 18.5h2v2h-2zM18.5 14.5h2M14.5 20.5h2" />
  {:else if name === 'arrow'}
    <path d="M7 17 17 7M9 7h8v8" />
  {:else if name === 'play'}
    <path d="M8 5.5v13l10-6.5z" />
  {:else if name === 'pause'}
    <path d="M8 5.5v13M16 5.5v13" />
  {:else if name === 'music'}
    <path d="M9 18V6l11-2v12" /><circle cx="6.5" cy="18" r="2.5" /><circle cx="17.5" cy="16" r="2.5" />
  {:else if name === 'code'}
    <path d="m8 7-5 5 5 5M16 7l5 5-5 5M13.5 4.5l-3 15" />
  {:else if name === 'moon'}
    <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />
  {:else if name === 'coffee'}
    <path d="M4 9h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5zM17 10h1.5a2.5 2.5 0 0 1 0 5H17M8 3v2.5M12 3v2.5" />
  {:else if name === 'camera'}
    <path d="M4 8h3l1.5-2.5h7L17 8h3v11H4z" /><circle cx="12" cy="13" r="3.5" />
  {:else if name === 'game'}
    <path d="M7 8h10a4 4 0 0 1 4 4v1.5a3.5 3.5 0 0 1-6.3 2.1L14 14.5h-4l-.7 1.1A3.5 3.5 0 0 1 3 13.5V12a4 4 0 0 1 4-4zM8 11v3M6.5 12.5h3M15.5 12h.01M17.5 13.5h.01" />
  {:else if name === 'film'}
    <rect x="3.5" y="4" width="17" height="16" rx="2" /><path d="M7.5 4v16M16.5 4v16M3.5 9h4M3.5 15h4M16.5 9h4M16.5 15h4" />
  {:else if name === 'star'}
    <path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.8l-5.2 2.8 1-5.8-4.3-4.1 5.9-.9z" />
  {:else if name === 'plus'}
    <path d="M12 5v14M5 12h14" />
  {:else if name === 'upload'}
    <path d="M12 16V4M7 9l5-5 5 5M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />
  {:else if name === 'download'}
    <path d="M12 4v12M7 11l5 5 5-5M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />
  {:else if name === 'close'}
    <path d="M6 6l12 12M18 6 6 18" />
  {:else if name === 'chevron-left'}
    <path d="m15 5-7 7 7 7" />
  {:else if name === 'chevron-right'}
    <path d="m9 5 7 7-7 7" />
  {:else if name === 'clock'}
    <circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" />
  {:else if name === 'image'}
    <rect x="3.5" y="4.5" width="17" height="15" rx="2.5" /><circle cx="9" cy="10" r="1.8" /><path d="m4 18 5.5-5.5 4 4 2.5-2.5L20.5 18" />
  {:else if name === 'sparkle'}
    <path d="M12 3.5c.6 4.2 2.3 5.9 6.5 6.5-4.2.6-5.9 2.3-6.5 6.5-.6-4.2-2.3-5.9-6.5-6.5 4.2-.6 5.9-2.3 6.5-6.5zM18.5 15.5c.3 1.8 1 2.5 2.8 2.8-1.8.3-2.5 1-2.8 2.8-.3-1.8-1-2.5-2.8-2.8 1.8-.3 2.5-1 2.8-2.8z" />
  {:else if name === 'tiktok'}
    <path d="M14 3.5v11.5a3.5 3.5 0 1 1-3.5-3.5M14 3.5c.5 2.8 2.3 4.4 5 4.6" />
  {:else if name === 'bluesky'}
    <path d="M12 11C10.5 8 6.5 4 4.5 4.5 3 5 3.5 9 4.5 11.5c.8 2 3.5 2.5 5.5 2-3 1.5-3.5 4 -1.5 5.5S13 18 12 14c-1 4 3 7 5 5.5s1.5-4-1.5-5.5c2 .5 4.7 0 5.5-2 1-2.5 1.5-6.5 0-7C17.5 4 13.5 8 12 11z" />
  {:else if name === 'youtube'}
    <rect x="3" y="6" width="18" height="12" rx="4" /><path d="m10.5 9.5 4 2.5-4 2.5z" />
  {:else if name === 'twitch'}
    <path d="M5 4h15v10l-4 4h-3.5L10 20.5V18H5zM11 8v4M15.5 8v4" />
  {:else if name === 'pin'}
    <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z" /><circle cx="12" cy="10" r="2.3" />
  {/if}
</svg>

<style>
  .icon {
    flex: none;
    display: block;
  }
</style>
