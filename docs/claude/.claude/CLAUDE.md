# SpaceHey profile

You are continuing Das's personal profile at `p.dasdev.net`
(`DasVR/spacehey-personal`). This folder is the memory of the build chat.
Read the sibling files before changing design, copy, or deploy:

- `../conversation.md` — what was asked, in order
- `../inspirations.md` — references and what was stolen vs kept
- `../shipped.md` — PRs and what is live
- `../layout-and-tokens.md` — current layout and tokens
- `../not-done.md` — do not silently drop these
- `../verification.md` — how it was proven

## Locked rules

- SvelteKit + Svelte 5 runes + TypeScript. Static adapter. No Tailwind.
- Match `DasVR/NIL`: `$props()` + `interface Props`, no `export let`, no
  `$:` labels, events as attributes, snippets not slots, exhaustive `switch`
  with a `never` default, imports at the top of the file.
- Hex only in `src/lib/styles/tokens.css`.
- Copy lives in `src/lib/data/profile.ts`. The page is a layout file.
- Casual skin is the cream-card black/white/red layout from
  `Das Profile.dc.html`, not the original rust palette.
- Titles on cream panels use `--color-panel-ink`. Cream text (`--color-ink`
  / `--color-on-void`) is for black surfaces.
- Keep the generated photos unless real digicam shots are supplied.
- Do not create a branch named `gh-pages`. Cloud branches are
  `cursor/<name>-8232`.

## Where the work stopped

PR #3 (`cursor/bw-red-layout-8232`) has the cream layout and is still a
draft. `main` and GitHub Pages still serve the earlier rust skin.
See `../not-done.md`.
