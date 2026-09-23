<script lang="ts">
  import Icon from './Icon.svelte';
  import Logo from './Logo.svelte';
  import QrCode from './QrCode.svelte';

  interface Props {
    open: boolean;
    url: string;
    name: string;
    onclose: () => void;
  }

  let { open, url, name, onclose }: Props = $props();

  let dialog: HTMLDialogElement;

  // Keep the native <dialog> in sync with `open` (focus trap + Esc for free).
  $effect(() => {
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  });
</script>

<!--
  Face-to-face sharing: hold your phone up, they scan it. The code opens the
  card with ?via=qr so it plays the arrival on their phone.
-->
<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
<dialog
  bind:this={dialog}
  class="sheet"
  aria-labelledby="qr-title"
  onclose={onclose}
  onclick={(e) => {
    if (e.target === dialog) onclose();
  }}
>
  <div class="panel">
    <span class="grabber" aria-hidden="true"></span>
    <header>
      <h2 id="qr-title">Scan to save {name}</h2>
      <button type="button" class="close press" onclick={onclose} aria-label="Close">
        <Icon name="close" size={18} />
      </button>
    </header>
    <div class="code">
      <QrCode value={url} label="QR code for {name}'s card" />
      <span class="badge" aria-hidden="true"><Logo size={26} /></span>
    </div>
    <p class="hint"><Icon name="nfc" size={14} /> Or tap phones — the tag does the same thing.</p>
  </div>
</dialog>

<style>
  .sheet {
    position: fixed;
    inset: auto 0 0;
    width: 100%;
    max-width: 440px;
    max-height: none;
    margin: 0 auto;
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--color-ink);
    overflow: visible;
  }

  .sheet::backdrop {
    background: oklch(0 0 0 / 0.55);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
    animation: fade 250ms var(--ease-out);
  }

  .panel {
    display: grid;
    gap: var(--s-4);
    padding: 10px var(--s-5) calc(var(--s-6) + env(safe-area-inset-bottom));
    border-radius: 28px 28px 0 0;
    background: var(--color-surface);
    box-shadow: var(--shadow-card);
    animation: rise 420ms cubic-bezier(0.2, 0, 0, 1);
  }

  @media (min-width: 560px) {
    .sheet {
      inset: 0;
      margin: auto;
      height: fit-content;
    }

    .panel {
      border-radius: 28px;
      padding-bottom: var(--s-6);
    }
  }

  .grabber {
    justify-self: center;
    width: 36px;
    height: 5px;
    border-radius: 3px;
    background: var(--color-line-strong);
  }

  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  h2 {
    font-size: var(--t-title);
    font-weight: 600;
  }

  .close {
    display: grid;
    place-items: center;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: var(--color-raised);
    color: var(--color-ink-dim);
  }

  .code {
    --qr-bg: var(--dither-light);
    --qr-ink: var(--dither-dark);
    position: relative;
    border-radius: 20px;
    overflow: hidden;
  }

  /* The mark sits in the middle; error correction Q absorbs the covered modules. */
  .badge {
    position: absolute;
    top: 50%;
    left: 50%;
    display: grid;
    place-items: center;
    width: 52px;
    height: 52px;
    translate: -50% -50%;
    border-radius: 14px;
    color: var(--color-accent);
    background: var(--dither-light);
    box-shadow: 0 0 0 4px var(--dither-light);
  }

  .hint {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    font-size: var(--t-small);
    color: var(--color-ink-dim);
  }

  @keyframes rise {
    from {
      transform: translateY(40px);
      opacity: 0;
    }
  }

  @keyframes fade {
    from {
      opacity: 0;
    }
  }
</style>
