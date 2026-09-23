# Layout and tokens

Two palettes exist in the history. Only the second one is the casual skin
on PR #3. `main` / GitHub Pages still serve the first.

## Palette A — original brief (rust)

Shipped on PR #1. Still what https://dasvr.github.io/spacehey-personal/
renders until PR #3 merges.

```css
--font-display: 'Anton', Impact, sans-serif;
--font-body: 'Trebuchet MS', sans-serif;
--color-bg: #0d0b09;
--color-panel: #161310;
--color-ink: #d9d0c2;
--color-ink-dim: #8f8577;
--color-accent: #7a4a32;
--color-accent-bright: #b06a42;
```

Layout on that skin: title with `[edit]` beside the name, two columns
(avatar + contact left; about / meet / widgets right), then full-width
interests, photo scatter, playlist, blinkies, friends, guestbook, footer.
Nav mode toggle was an underline, not a pill. Dark panels, rust accents.

## Palette B — zip, locked casual (current target)

From `uploads/spacehey-v3-bw-red.html` and the `CASUAL_VARS` block in
`Das Profile.dc.html`. Hex lives only in `src/lib/styles/tokens.css`.

```css
--color-bg: #050505;
--color-panel: #ece7dd;          /* cream cards */
--color-panel-ink: #111111;      /* type on cream */
--color-panel-ink-dim: #4a463f;
--color-ink: #e8e4dc;            /* cream type on black */
--color-ink-dim: #a39c8f;
--color-line: #000000;
--color-red: #e01b2e;
--color-paper: #d8d2c4;
--color-on-void: #e8e4dc;        /* added so pro mode stays readable */
--glitch-r: #ff2d55;
--glitch-c: #2de0ff;
--grain-opacity: 0.3;
--stars-opacity: 0.5;
```

`--color-accent` and `--color-accent-bright` alias `--color-red` so older
component hooks stay red.

### Pro vars (same data, light coat)

```css
--font-display: Georgia, 'Times New Roman', serif;
--font-body: 'Helvetica Neue', Helvetica, Arial, sans-serif;
--color-bg: #f3efe6;
--color-panel: #fffcf7;
--color-panel-ink: #1c1914;
--color-panel-ink-dim: #6b645a;
--color-ink: #1c1914;
--color-red: #b0212f;
--color-void: #000000;           /* tiles stay black */
--color-on-void: #fffcf7;
--grain-opacity: 0;
--stars-opacity: 0;
```

Glitch colors are `transparent` in pro. Polaroids, photo scatter, and
friend tiles lose rotation.

## Layout B, top to bottom

1. Fixed atmosphere: star tile field, then grain (`GrainLayer`).
2. Well, max 960px, horizontal padding.
3. Nav: `dasdev.net / p`, red links (home, blog, friends, layouts),
   pill toggle. The red indicator slides from casual (left) to pro (right).
4. Title: eyebrow “profile name”, glitch `DAS`, barcode `003 963 6663`.
5. Grid `minmax(0, 17.5rem) minmax(0, 1fr)`, gap 16px. Stacks at 800px.
   - Left: polaroid header (`:das:`, red italic mood, location, last login,
     pill tags), links, Contacting Das.
   - Right: About (`[edit]` / `[done]`), Who I’d like to meet, Widgets
     (`[+ add widget]` in red, black cards), Das's Interests.
6. Full width: Pics (absolute scatter, paper polaroids, hover scale),
   Now Playing (150px art, red live dot, hint that speakers are not hooked
   up), Blinkies (black strip, 88×31-style chips cycling paper / cream / red),
   Friend Space (4 columns, slight rotates), Guestbook (black entries),
   footer (6 red digits, member since, fine print).

Barcode patterns live in `src/lib/utils/barcode.ts`: `title` (12 bars),
`compact` (playlist), `friend` (4 bars).

## Critical color rule

`--color-ink` used to mean “all text”. After cream panels it means
“text on the black page”. Anything sitting on `--color-panel` must use
`--color-panel-ink` or `--color-panel-ink-dim`. Anything sitting on
`--color-void` (social tiles, widget cards, guestbook entries, interest
headers) must use `--color-on-void`, not `--color-ink`, because in pro
mode `--color-ink` becomes near-black.
