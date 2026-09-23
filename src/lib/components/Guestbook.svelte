<script lang="ts">
  import { app, REACTIONS } from '$lib/app.svelte.ts';
  import type { GuestbookEntry } from '$lib/data/types';

  let author = $state('');
  let body = $state('');

  function submit(event: SubmitEvent): void {
    event.preventDefault();
    const error = app.sign(author, body);
    if (error) {
      app.say(error);
      return;
    }
    body = '';
    app.say('Signed. It lives in this browser.');
  }

  /** A stable starting count per entry so the book doesn't look empty. */
  function seed(id: string, r: string): number {
    let h = 0;
    for (const ch of id + r) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    return h % 5;
  }
</script>

{#snippet entry(item: GuestbookEntry, depth: number)}
  <li class="entry" style="--depth: {depth}">
    <p class="who"><strong>{item.author}</strong><span>{item.date}</span></p>
    <p class="said">{item.body}</p>
    {#if depth === 0}
      <div class="reacts" role="group" aria-label="Reactions">
        {#each REACTIONS as r (r)}
          {@const mine = app.reacted[item.id]?.includes(r) ?? false}
          {@const n = seed(item.id, r) + (mine ? 1 : 0)}
          <button type="button" class="react press" class:mine aria-pressed={mine} onclick={() => app.react(item.id, r)}>
            <span>{r}</span>{#if n > 0}<span class="n">{n}</span>{/if}
          </button>
        {/each}
      </div>
    {/if}
    {#if item.replies?.length}
      <ul>
        {#each item.replies as reply (reply.id)}
          {@render entry(reply, depth + 1)}
        {/each}
      </ul>
    {/if}
  </li>
{/snippet}

<form class="sign" onsubmit={submit}>
  <input name="name" placeholder="name" autocomplete="nickname" maxlength="32" bind:value={author} aria-label="Your name" />
  <textarea name="comment" rows="2" placeholder="leave something" maxlength="400" bind:value={body} aria-label="Comment"></textarea>
  <button type="submit" class="press" disabled={body.trim().length < 2}>Sign</button>
</form>

<ul class="book">
  {#each app.guestbook as item (item.id)}
    {@render entry(item, 0)}
  {/each}
</ul>

<style>
  .sign {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: var(--s-2);
    padding: var(--s-2);
    border-radius: 16px;
    background: var(--color-surface);
    box-shadow: 0 0 0 1px var(--color-line);
  }

  input,
  textarea {
    grid-column: 1 / -1;
    width: 100%;
    padding: 10px var(--s-3);
    border-radius: 8px;
    background: transparent;
    color: var(--color-ink);
    font-size: 16px;
    resize: none;
  }

  input {
    border-bottom: 1px solid var(--color-line);
    border-radius: 8px 8px 0 0;
  }

  input::placeholder,
  textarea::placeholder {
    color: var(--color-ink-faint);
  }

  input:focus-visible,
  textarea:focus-visible {
    outline: none;
    background: var(--color-hover);
  }

  button {
    grid-column: 2;
    height: 40px;
    padding-inline: var(--s-4);
    border-radius: 8px;
    font-size: var(--t-small);
    font-weight: 600;
    color: var(--color-on-accent);
    background: var(--color-accent);
    transition-property: opacity, scale;
    transition-duration: 150ms;
  }

  button:disabled {
    opacity: 0.4;
  }

  .book,
  .book :global(ul) {
    list-style: none;
    display: grid;
  }

  .entry {
    padding-block: var(--s-3);
  }

  .book > .entry + .entry {
    border-top: 1px solid var(--color-line);
  }

  .entry .entry {
    margin-left: var(--s-3);
    padding-left: var(--s-3);
    padding-bottom: 0;
    box-shadow: -1px 0 0 0 color-mix(in oklch, var(--color-accent) 60%, transparent);
  }

  .who {
    display: flex;
    align-items: baseline;
    gap: var(--s-2);
    font-size: var(--t-small);
    color: var(--color-ink);
  }

  .who strong {
    font-weight: 600;
  }

  .who span {
    font-family: var(--font-mono);
    font-size: var(--t-micro);
    color: var(--color-ink-faint);
  }

  .reacts {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: var(--s-2);
  }

  .react {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    height: 28px;
    padding-inline: 10px;
    border-radius: var(--r-pill);
    font-size: var(--t-small);
    background: var(--color-raised);
    box-shadow: 0 0 0 1px var(--color-line);
    transition-property: background-color, box-shadow, scale;
    transition-duration: 150ms;
  }

  .react .n {
    font-family: var(--font-mono);
    font-size: var(--t-micro);
    color: var(--color-ink-dim);
    font-variant-numeric: tabular-nums;
  }

  .react.mine {
    background: color-mix(in oklch, var(--color-accent) 18%, var(--color-raised));
    box-shadow: 0 0 0 1px color-mix(in oklch, var(--color-accent) 60%, transparent);
  }

  .said {
    margin-top: 2px;
    font-size: var(--t-body);
    line-height: 1.5;
    color: var(--color-ink-dim);
    text-wrap: pretty;
  }
</style>
