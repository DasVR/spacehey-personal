<script lang="ts">
  import { app } from '$lib/app.svelte.ts';
</script>

<div class="region" role="status" aria-live="polite">
  {#key app.toast?.id}
    {#if app.toast}
      <p class="toast">{app.toast.text}</p>
    {/if}
  {/key}
</div>

<style>
  .region {
    position: fixed;
    top: max(16px, env(safe-area-inset-top));
    left: 50%;
    z-index: var(--z-toast);
    translate: -50% 0;
    pointer-events: none;
  }

  .toast {
    padding: 10px 16px;
    border-radius: var(--r-pill);
    font-size: var(--t-small);
    font-weight: 500;
    white-space: nowrap;
    color: var(--color-ink);
    background: var(--color-raised);
    box-shadow: var(--shadow-float);
    animation: toast 2.6s var(--ease-out) both;
  }

  @keyframes toast {
    0% {
      opacity: 0;
      transform: translateY(-8px) scale(0.96);
      filter: blur(4px);
    }
    10%,
    85% {
      opacity: 1;
      transform: none;
      filter: blur(0);
    }
    100% {
      opacity: 0;
      transform: translateY(-4px);
    }
  }
</style>
