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
