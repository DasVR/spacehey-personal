<script lang="ts">
  interface Props {
    size?: number;
    label?: string;
  }

  let { size = 20, label }: Props = $props();
</script>

<!-- The dasdev mark: two strokes inside a broken ring. Inherits currentColor. -->
<svg
  class="logo"
  width={size}
  height={size * (728 / 628)}
  viewBox="454 404 628 728"
  fill="none"
  stroke="currentColor"
  stroke-linecap="round"
  role={label ? 'img' : undefined}
  aria-label={label}
  aria-hidden={label ? undefined : 'true'}
>
  <path d="M578 905 893 485M642 1051 957 630" stroke-width="104" />
  <path d="M722 517A256 256 0 0 0 514 795M1021 740A256 256 0 0 1 812 1019" stroke-width="60" />
</svg>

<style>
  .logo {
    display: block;
    flex: none;
  }
</style>
