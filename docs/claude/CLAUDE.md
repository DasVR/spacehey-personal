# CLAUDE.md — p.dasdev.net profile

Standing context for any Claude (or Cursor) session that touches
`DasVR/spacehey-personal`. The long archive is the other files in this
folder. `.claude/CLAUDE.md` points here when this directory is the project
root.

> **Current direction (23 Sep 2026): the tap card.** The UI was redesigned
> from scratch as an NFC/QR contact card with a WebGL dithered field and two
> routes (`/` casual, `/pro/` pro). Read [redesign-tap-card.md](redesign-tap-card.md)
> first. The sections below describe the SpaceHey build that came before; its
> content lives on in the casual card, its layout rules do not.

## What this was

A 2007 SpaceHey / MySpace profile crossed with a Nirvana / Deftones gig
flyer, for **p.dasdev.net**. Dark, textured, a little chaotic, alive.
Not cyberpunk. Not glassy. Not Tailwind.

The first build used a warm rust palette and a SpaceHey section order.
A later zip replaced that look. The layout to keep is the zip's Design
Component: black page, cream cards, red `#e01b2e`, barcode, 3×2 social
grid, interests in the right column.

## Stack

- SvelteKit + Svelte 5 runes (`$state`, `$derived`, `$effect`) + TypeScript
- Static adapter, prerender, `trailingSlash: 'always'`
- Conventions from `DasVR/NIL`
- Hex only in `src/lib/styles/tokens.css`
- Content only in `src/lib/data/profile.ts`
- `npm run check`, `npm test`, `npm run build`, `npm run build:pages`

## Two skins, one dataset

`document.documentElement.dataset.theme` is `casual` or `pro`.

- **Casual** is the grunge page (now black / cream / red).
- **Pro** is a light portfolio coat on the same data. The original prompt
  called pro out of scope. It was built anyway. Keep it.

## Do not regress

- `[edit]` lives in the About header, not beside DAS.
- Section titles on cream use `--color-panel-ink`.
- Black tiles (social, widgets, guestbook, interest headers) use
  `--color-on-void` so pro mode does not paint dark type on black.
- Photo scatter must not cover Now Playing.
- GitHub Pages build strips `build/CNAME` so github.io does not redirect
  to `p.dasdev.net`. `static/CNAME` stays `p.dasdev.net` for the real host.
- `BASE_PATH=/spacehey-personal` for the project-site preview.

## Read next

[redesign-tap-card.md](redesign-tap-card.md), [conversation.md](conversation.md), [inspirations.md](inspirations.md),
[shipped.md](shipped.md), [layout-and-tokens.md](layout-and-tokens.md),
[not-done.md](not-done.md), [verification.md](verification.md).
