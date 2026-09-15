<script lang="ts">
  import GrainLayer from './GrainLayer.svelte';

  interface Props {
    title: string;
    body: string;
    editing?: boolean;
    onChange?: (value: string) => void;
  }

  let { title, body, editing = false, onChange }: Props = $props();
</script>

<section class="blurb">
  <GrainLayer />
  <h2 class="section-title">{title}</h2>
  {#if editing}
    <textarea
      rows="6"
      value={body}
      oninput={(e) => onChange?.(e.currentTarget.value)}
    ></textarea>
  {:else}
    <p>{body}</p>
  {/if}
</section>

<style>
  .blurb {
    position: relative;
    overflow: hidden;
    background: var(--color-panel);
    border: 1px solid var(--color-line);
    padding: var(--s-4);
  }

  p,
  textarea {
    color: var(--color-ink-soft);
    max-width: 42rem;
  }

  textarea {
    width: 100%;
    background: var(--color-bg);
    border: 1px solid var(--color-line-hot);
    padding: var(--s-2);
    resize: vertical;
  }
</style>
