# spacehey-personal

The chat that built this page is archived in [`docs/claude/`](docs/claude/README.md):
brief, zip, inspirations, pull requests, and what is still open.

Personal contact card for **p.dasdev.net**. Tap an NFC tag (or scan a QR
code), tap the notification, and the card drops in out of a Dynamic
Island–style pill while a dithered WebGL wave rolls down the screen. Save the
contact as a vCard in one tap.

- `/` — casual: night palette, the SpaceHey profile carried forward
- `/pro/` — pro: paper palette, work and contact
- `/tags/` — QR codes and NFC URLs, with Web NFC writing on Android
- `/das.vcf`, `/das-pro.vcf` — prerendered contact cards

Design notes: [`docs/claude/redesign-tap-card.md`](docs/claude/redesign-tap-card.md).

Built with SvelteKit + Svelte 5 (runes) + TypeScript. Hand-styled, no
framework CSS. Static adapter. Conventions follow `DasVR/NIL`.

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

## NFC tags

Write an NDEF URL record per tag:

- casual: `https://p.dasdev.net/?via=nfc`
- pro: `https://p.dasdev.net/pro/?via=nfc`

`/tags/` shows the exact URLs for whatever host it is served from, plus QR
codes (`?via=qr`). Android Chrome can write tags from that page; on iPhone use
an app such as NFC Tools. iPhone XS and newer read tags in the background
while unlocked and show a notification; tapping it opens the card.

## Content and photos

All copy is in `src/lib/data/profile.ts` (`identity`, `casual`, `pro`).
Drop photos in `static/photos/` and reference them there; every image is
dithered at runtime in the mode's colours, so nothing needs retouching.
Guestbook signatures persist in `localStorage`.
