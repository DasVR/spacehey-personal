<script lang="ts">
  interface Props {
    count: number;
    memberSince: string;
  }

  let { count, memberSince }: Props = $props();

  const padded = $derived(String(count).padStart(6, '0'));
</script>

<footer class="foot">
  <p class="counter" aria-label="Visitor count {padded}">
    {#each padded.split('') as digit, i (`${digit}-${i}`)}
      <span>{digit}</span>
    {/each}
  </p>
  <p>member since {memberSince}</p>
  <p class="fine">p.dasdev.net · not a template · grain is a feature</p>
</footer>

<style>
  .foot {
    text-align: center;
    padding: var(--s-6) var(--s-4) var(--s-2);
    color: var(--color-ink-dim);
    font-size: 11px;
  }

  .counter {
    display: inline-flex;
    gap: 2px;
    margin: 0 0 10px;
    background: var(--color-void);
    padding: 5px 6px;
    border: 1px solid var(--color-red);
  }

  .counter span {
    display: inline-flex;
    width: 16px;
    justify-content: center;
    font-family: var(--font-mono);
    color: var(--color-red);
  }

  .fine {
    margin: 6px 0 0;
    font-size: 9px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }
</style>
