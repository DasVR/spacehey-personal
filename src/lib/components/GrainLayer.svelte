<script lang="ts">
  import { nextId } from '$lib/utils/ids';

  interface Props {
    opacity?: number;
  }

  let { opacity }: Props = $props();
  const filterId = nextId('grain');
</script>

<svg class="grain" style:opacity aria-hidden="true">
  <filter id={filterId}>
    <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" />
    <feColorMatrix
      type="matrix"
      values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.05 0"
    />
  </filter>
  <rect width="100%" height="100%" filter="url(#{filterId})" />
</svg>
