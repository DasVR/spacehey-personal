<script lang="ts">
  interface Props {
    title: string;
    body: string;
    editing?: boolean;
    onChange?: (value: string) => void;
    actionLabel?: string;
    onAction?: () => void;
  }

  let { title, body, editing = false, onChange, actionLabel, onAction }: Props = $props();
</script>

<section class="blurb">
  <div class="head">
    <h2 class="section-title">{title}</h2>
    {#if actionLabel && onAction}
      <button class="edit-link" type="button" onclick={onAction}>
        {actionLabel}
      </button>
    {/if}
  </div>
  {#if editing}
    <textarea
      rows="5"
      value={body}
      oninput={(e) => onChange?.(e.currentTarget.value)}
    ></textarea>
  {:else}
    <p>{body}</p>
  {/if}
</section>

<style>
  .blurb {
    background: var(--color-panel);
    border: 1px solid var(--color-line);
    padding: var(--s-4);
  }

  .head {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: var(--s-3);
    margin-bottom: 10px;
  }

  .head .section-title {
    margin-bottom: 0;
  }

  .edit-link {
    background: none;
    border: 0;
    padding: 0;
    color: var(--color-red);
    font-weight: 700;
    font-size: 11px;
  }

  .edit-link:hover {
    opacity: 0.7;
  }

  p,
  textarea {
    color: var(--color-panel-ink-dim);
    max-width: 42rem;
    line-height: var(--lh-body);
    font-size: 13px;
    margin: 0;
  }

  textarea {
    width: 100%;
    background: var(--color-void);
    color: var(--color-ink);
    border: 1px solid var(--color-line-dark);
    padding: var(--s-2);
    resize: vertical;
  }
</style>
