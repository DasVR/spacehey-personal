<script lang="ts">
  import { profileState } from '$lib/profile.svelte.ts';
  import type { GuestbookEntry } from '$lib/data/types';

  interface Props {
    entries: GuestbookEntry[];
  }

  let { entries }: Props = $props();

  let author = $state('');
  let body = $state('');

  function submit(event: SubmitEvent): void {
    event.preventDefault();
    if (!body.trim()) return;
    profileState.signGuestbook(author, body);
    author = '';
    body = '';
  }
</script>

<section class="book">
  <h2 class="section-title">Guestbook</h2>
  <form onsubmit={submit}>
    <label>
      <span class="eyebrow">name</span>
      <input bind:value={author} placeholder="anon" maxlength="32" />
    </label>
    <label>
      <span class="eyebrow">comment</span>
      <textarea bind:value={body} rows="3" required placeholder="make it look like 2007."></textarea>
    </label>
    <button type="submit">sign guestbook</button>
  </form>
  <ol class="thread">
    {#each entries as entry (entry.id)}
      <li>
        {@render entryBlock(entry, 0)}
      </li>
    {/each}
  </ol>
</section>

{#snippet entryBlock(entry: GuestbookEntry, depth: number)}
  <article class="entry" class:reply={depth > 0}>
    <header>
      <strong>{entry.author}</strong>
      <time>{entry.date}</time>
    </header>
    <p>{entry.body}</p>
    {#if entry.replies?.length}
      <ol class="thread nested">
        {#each entry.replies as reply (reply.id)}
          <li>
            {@render entryBlock(reply, depth + 1)}
          </li>
        {/each}
      </ol>
    {/if}
  </article>
{/snippet}

<style>
  .book {
    background: var(--color-panel);
    border: 1px solid var(--color-line);
    padding: var(--s-4);
  }

  form {
    display: grid;
    gap: var(--s-2);
    margin-bottom: var(--s-5);
    max-width: 32rem;
  }

  label {
    display: grid;
    gap: 3px;
  }

  .eyebrow {
    color: var(--color-panel-ink-dim);
  }

  input,
  textarea {
    background: var(--color-void);
    color: var(--color-ink);
    border: 1px solid var(--color-line);
    padding: 6px 8px;
  }

  button {
    justify-self: start;
    background: var(--color-red);
    color: var(--color-on-red);
    border: 1px solid var(--color-void);
    padding: 7px 16px;
    font-size: var(--t-meta);
    box-shadow: 1px 1px 0 var(--color-void);
    transition:
      transform 150ms var(--ease-out),
      box-shadow 150ms ease;
  }

  button:hover {
    box-shadow: 2px 2px 0 var(--color-void);
    transform: translateY(-1px);
  }

  button:active {
    transform: scale(0.96);
    box-shadow: 1px 1px 0 var(--color-void);
  }

  .thread {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    gap: 10px;
  }

  .nested {
    margin-top: 10px;
    gap: 10px;
  }

  .entry {
    border: 1px solid var(--color-line);
    background: var(--color-void);
    padding: 10px;
    box-shadow: 2px 2px 0 var(--color-shadow);
    animation: riseIn 320ms var(--ease-out);
  }

  .reply {
    margin: 10px 0 0 20px;
    border: 0;
    border-left: 2px solid var(--color-red);
    padding: 0 0 0 10px;
    background: transparent;
    box-shadow: none;
  }

  .entry header {
    display: flex;
    justify-content: space-between;
    gap: var(--s-3);
    font-size: 11px;
    margin-bottom: 5px;
  }

  strong {
    color: var(--color-ink);
  }

  time {
    color: var(--color-ink-dim);
    font-family: var(--font-mono);
  }

  .entry p {
    color: var(--color-ink-dim);
    margin: 0;
    font-size: var(--t-meta);
  }

  @keyframes riseIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @media (prefers-reduced-motion: reduce) {
    .entry { animation: none; }
  }
</style>
