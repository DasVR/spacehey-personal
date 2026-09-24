<script lang="ts">
  import Icon from './Icon.svelte';

  interface Props {
    email: string;
    types: string[];
  }

  let { email, types }: Props = $props();

  const budgets = ['< $1k', '$1–3k', '$3–8k', '$8k+', 'Not sure yet'];
  const timings = ['ASAP', 'This month', 'This season', 'Just exploring'];

  let kind = $state<string | null>(null);
  let budget = $state<string | null>(null);
  let timing = $state<string | null>(null);
  let business = $state('');

  const ready = $derived(Boolean(kind));
  const href = $derived.by(() => {
    const subject = `${kind ?? 'A project'}${business.trim() ? ` for ${business.trim()}` : ''}`;
    const body = [
      'Hey Arriq,',
      '',
      `I'm after: ${kind ?? '—'}`,
      business.trim() ? `Business: ${business.trim()}` : '',
      budget ? `Budget: ${budget}` : '',
      timing ? `Timing: ${timing}` : '',
      '',
      'A bit more about it:',
      '',
    ]
      .filter((l, i, a) => l !== '' || a[i - 1] !== '')
      .join('\n');
    return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
</script>

<!-- Three taps and a name, then your mail app opens with the brief already written. -->
<div class="composer">
  {#snippet group(label: string, options: string[], value: string | null, set: (v: string | null) => void)}
    <fieldset>
      <legend>{label}</legend>
      <div class="opts">
        {#each options as o (o)}
          <button type="button" class:on={value === o} aria-pressed={value === o} onclick={() => set(value === o ? null : o)}>{o}</button>
        {/each}
      </div>
    </fieldset>
  {/snippet}

  {@render group('What are we making?', types, kind, (v) => (kind = v))}
  <label class="biz">
    <span>Business name <small>(optional)</small></span>
    <input bind:value={business} placeholder="Joe’s Bait & Tackle" maxlength="60" autocomplete="organization" />
  </label>
  {@render group('Budget', budgets, budget, (v) => (budget = v))}
  {@render group('Timing', timings, timing, (v) => (timing = v))}

  <a class="send press" class:ready href={ready ? href : undefined} aria-disabled={!ready}>
    <Icon name="mail" size={18} stroke={2} />
    {ready ? 'Write the email' : 'Pick what we’re making'}
    <Icon name="arrow" size={16} />
  </a>
  <p class="or">or just write to <a href="mailto:{email}">{email}</a></p>
</div>

<style>
  .composer {
    display: grid;
    gap: var(--s-4);
    padding: var(--r-card-pad);
    border-radius: var(--r-card);
    background: var(--color-surface);
    box-shadow: var(--shadow-card);
  }

  fieldset {
    display: grid;
    gap: var(--s-2);
    border: 0;
    padding: 0;
    margin: 0;
  }

  legend,
  .biz span {
    margin-bottom: var(--s-2);
    font-size: var(--t-meta);
    font-weight: 600;
    color: var(--color-ink-dim);
  }

  small {
    font-weight: 400;
    color: var(--color-ink-faint);
  }

  .opts {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .opts button {
    min-height: 36px;
    padding-inline: 14px;
    border-radius: var(--r-pill);
    font-size: var(--t-small);
    color: var(--color-ink);
    box-shadow: 0 0 0 1px var(--color-line-strong);
    transition-property: background-color, color, scale, box-shadow;
    transition-duration: 250ms;
    transition-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .opts button:active {
    scale: 0.94;
  }

  .opts button.on {
    color: var(--color-on-accent);
    background: var(--color-accent);
    box-shadow: none;
  }

  .biz {
    display: grid;
  }

  .biz input {
    min-height: 44px;
    padding-inline: var(--s-3);
    border-radius: var(--r-control);
    font: inherit;
    color: var(--color-ink);
    background: var(--color-bg);
    border: 1px solid var(--color-line-strong);
  }

  .send {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--s-2);
    min-height: 50px;
    border-radius: var(--r-control);
    font-weight: 600;
    color: var(--color-ink-faint);
    background: var(--color-raised);
    text-decoration: none;
    pointer-events: none;
    transition-property: background-color, color, scale;
    transition-duration: 300ms;
  }

  .send.ready {
    color: var(--color-on-accent);
    background: var(--color-accent);
    pointer-events: auto;
  }

  .or {
    text-align: center;
    font-size: var(--t-small);
    color: var(--color-ink-dim);
  }

  .or a {
    color: var(--color-ink);
  }
</style>
