<script lang="ts">
  import GrainLayer from './GrainLayer.svelte';
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
  <GrainLayer />
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
  <article class="entry" style:margin-left="{depth * 1.25}rem">
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
    position: relative;
    overflow: hidden;
    background: var(--color-panel);
    border: 1px solid var(--color-line);
    padding: var(--s-4);
  }

  form {
    display: grid;
    gap: var(--s-2);
    margin-bottom: var(--s-5);
  }

  label {
    display: grid;
    gap: var(--s-1);
  }

  input,
  textarea {
    background: var(--color-bg);
    border: 1px solid var(--color-line);
    padding: var(--s-2);
  }

  button {
    justify-self: start;
    background: var(--color-accent);
    color: var(--color-ink);
    border: 1px solid var(--color-void);
    padding: 0.4rem 0.8rem;
  }

  .thread {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    gap: var(--s-3);
  }

  .nested {
    margin-top: var(--s-3);
    border-left: 2px solid var(--color-accent);
    padding-left: var(--s-3);
  }

  .entry header {
    display: flex;
    justify-content: space-between;
    gap: var(--s-3);
    font-size: var(--t-meta);
    margin-bottom: var(--s-1);
  }

  time {
    color: var(--color-ink-dim);
    font-family: var(--font-mono);
  }

  .entry p {
    color: var(--color-ink-soft);
  }
</style>
