<script lang="ts">
  interface Props {
    items: string[];
  }

  let { items }: Props = $props();
</script>

<ul>
  {#each items as item (item)}
    <li>{item}</li>
  {/each}
</ul>

<style>
  ul {
    list-style: none;
    display: flex;
    flex-wrap: wrap;
    gap: var(--s-2);
  }

  li {
    display: inline-flex;
    align-items: center;
    height: 30px;
    padding-inline: var(--s-3);
    border-radius: var(--r-pill);
    font-size: var(--t-small);
    color: var(--color-ink);
    background: var(--color-surface);
    box-shadow: 0 0 0 1px var(--color-line);
  }
</style>
