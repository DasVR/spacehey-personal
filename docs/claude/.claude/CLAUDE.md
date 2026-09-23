# p.dasdev.net tap card

You are continuing Das's personal card at `p.dasdev.net`
(`DasVR/spacehey-personal`). Read `../redesign-tap-card.md` first — it is the
current design. The other sibling files are the history of the SpaceHey
build it replaced.

## Locked rules

- SvelteKit + Svelte 5 runes + TypeScript. Static adapter. No Tailwind.
- Match `DasVR/NIL`: `$props()` + `interface Props`, no `export let`, no
  `$:` labels, events as attributes, snippets not slots, exhaustive `switch`
  with a `never` default, imports at the top of the file.
- Hex only in `src/lib/styles/tokens.css` (plus `THEME_COLOR` in
  `src/lib/theme.ts`, which mirrors `--color-bg` for the meta tag). The shader
  and dithered images read `--shader-*` / `--dither-*` tokens at runtime.
- Copy lives in `src/lib/data/profile.ts`. Routes compose components.
- Two routes, two modes: `/` casual (night), `/pro/` pro (paper). Tags and QR
  codes append `?via=nfc` / `?via=qr` to play the arrival.
- Motion: `cubic-bezier(0.2, 0, 0, 1)`, press `scale(0.96)`, name exact
  transition properties, honour `prefers-reduced-motion`.
- Keep the generated photos unless real ones are supplied.
- Do not create a branch named `gh-pages`.
