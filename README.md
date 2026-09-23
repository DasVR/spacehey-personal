# spacehey-personal

The chat that built this page is archived in [`docs/claude/`](docs/claude/README.md):
brief, zip, inspirations, pull requests, and what is still open.

Personal profile for **p.dasdev.net** — a 2007 SpaceHey page crossed with a
gig flyer. Torn paper, grain, halftone, stencil type, a rare glitch on the
name. Not cyberpunk. Not glassy.

Built with SvelteKit + Svelte 5 (runes) + TypeScript. Hand-styled. Static
adapter. Conventions follow `DasVR/NIL` (runes, token file, exhaustive
switches, no inline hex in components).

## Develop

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

```bash
npm run check
npm run test
npm run build
```

Static output lands in `build/`. Point the `p.dasdev.net` host at that
directory (`static/CNAME` is already set).

### GitHub Pages preview

Pushes to this branch (and to `main`) deploy a project-page preview:

**https://dasvr.github.io/spacehey-personal/**

That build sets `BASE_PATH=/spacehey-personal` so assets and nav work under
the repo subpath. Local equivalent:

```bash
npm run build:pages
```

The github.io artifact omits `CNAME`, so the preview stays on github.io
instead of jumping to `p.dasdev.net`. **Pages is not on yet** — the first
deploy failed with 404 until Pages is enabled:

1. Open [Settings → Pages](https://github.com/DasVR/spacehey-personal/settings/pages)
2. Set Source to **GitHub Actions**
3. Re-run the `pages` workflow (or push again)

The repo is private. GitHub Pages on a private repo needs GitHub Pro/Team,
or make the repo public, or the preview is only visible to collaborators.

## Casual / pro

The toggle in the nav writes `data-theme="casual" | "pro"` on `<html>`.
Casual is the grunge profile. Pro is a separate clean portfolio skin using
the same content.

## Adding photos

Drop files in `static/photos/` and append an object to `photos` in
`src/lib/data/profile.ts`:

```ts
{ src: '/photos/your-shot.jpg', alt: '…', rotate: -2, left: '10%', top: '12%', width: '36%', z: 3 }
```

`PhotoScatter.svelte` applies grain, contrast, halftone, and the rotation.
No per-image retouching.

Click `[edit]` on the profile name to change blurbs, mood, and widgets in
the page. Guestbook signatures and widgets persist in `localStorage`.
