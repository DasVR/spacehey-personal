<script lang="ts">
  import Barcode from './Barcode.svelte';

  interface Props {
    name: string;
    barcode: string;
  }

  let { name, barcode }: Props = $props();
</script>

<section class="title-block">
  <div>
    <p class="eyebrow">profile name</p>
    <h1 class="glitch-name" data-text={name}>{name}</h1>
  </div>
  <Barcode kind="title" caption={barcode} />
</section>

<style>
  .title-block {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    gap: var(--s-4);
    flex-wrap: wrap;
    padding: var(--s-5) 0 10px;
  }

  h1 {
    font-family: var(--font-display);
    font-size: var(--t-display);
    letter-spacing: var(--track-display);
    line-height: var(--lh-tight);
    text-transform: uppercase;
    margin: 0;
  }

  :global([data-theme='pro']) h1 {
    text-transform: none;
    letter-spacing: -0.03em;
  }
</style>
