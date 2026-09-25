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

- **Status:** `casual.statuses`, newest first. Visitors tap the pill to flip
  back through them.
- **The crate (Apple Music):** list songs in `src/lib/data/playlist.json`,
  then run `npm run music`. It looks each one up on Apple and writes
  `music.json` with the real album artwork, a 30-second preview and the
  Apple Music link. Put the playlist's share link in `appleMusicUrl`.
- **Roll:** drop photos into `src/lib/roll/` named
  `YYYY-MM-DD--a-caption.jpg`, or use **`/roll/add/`** on the site: it
  upscales or resizes, sharpens, strips location data, previews the dither,
  and sends the photo and its look to the roll in one tap (the dev server,
  a folder you pick, or a GitHub token kept on that device).
- **Top 8:** give a friend `social: { platform, handle }` and their real
  profile picture is pulled in (Instagram, X, GitHub, TikTok, Bluesky,
  YouTube, Twitch). Without it they get a colour tile.
- **Guestbook:** runs on GitHub Discussions through [giscus](https://giscus.app)
  once it's switched on (see below). Until then it falls back to a
  this-device-only book.

### Turning on the guestbook

1. Repo **Settings → General → Features → Discussions** on.
2. Create a Discussion category called **Guestbook** (type: Announcement,
   so only you can start threads; visitors still comment).
3. Install the [giscus app](https://github.com/apps/giscus) on this repo.
4. On [giscus.app](https://giscus.app), enter `DasVR/spacehey-personal`,
   pick the Guestbook category, and copy `data-repo-id` and
   `data-category-id` into `casual.giscus` in `profile.ts`.

Visitors sign in with GitHub, react, reply, and attach images with
Markdown; you moderate (hide, delete, lock, block) from GitHub.
