# References, inspirations, and what was taken

## Named by the build prompt

| Reference | Role |
|-----------|------|
| 2007 SpaceHey / MySpace | Page structure, `[edit]`, contacting buttons, interests table, guestbook, blinkies, friend space, visitor counter |
| Nirvana / Deftones gig flyer | Torn paper, grain, halftone, spray stencil type, restrained glitch |
| `spacehey-hallmark-final.html` | Requested visual reference. **Never attached and not in the repo.** Techniques were copied from the prompt’s CSS snippets instead |
| `DasVR/NIL` | Svelte 5 conventions, not the visual skin |
| `p.dasdev.net` | Intended host. `static/CNAME` is `p.dasdev.net` |
| dasdev.net | Parent site. Portfolio social href is `https://dasdev.net` |
| Anton + Impact | Display face. Google Fonts stylesheet is `family=Anton` |
| Trebuchet MS | Body face, on purpose (2000s default, not a trendy grotesque) |
| Courier New | Mono: barcode digits, blinkies, durations, guestbook times |
| Tailwind | Explicitly rejected. It fights the texture layering |

Avoid list from the prompt: cyberpunk, glassy UI, gray placeholder boxes,
constant looping animation, perfect alignment, inline hex outside the
token file.

Motion that was asked for and built: grain drift, name glitch about every
7 seconds, photo parallax on pointer, `prefers-reduced-motion` honored.
Torn-edge `clip-path` was in the first skin and used sparingly. The cream
reskin dropped torn edges on the main cards so the panels match the
Design Component’s hard rectangles.

## The zip (`Custom profile redesign.zip`)

On the agent disk:
`/home/ubuntu/.cursor/projects/workspace/uploads/Custom_profile_redesign_2bf7.zip`
(about 4.6 MB). Unpacked to `/tmp/redesign/` during the chat. That path
is a VM scratch dir and will not survive. The zip itself was an upload,
not a git file.

| Path in the zip | What it is |
|-----------------|------------|
| `github.md` | Intent note. Last sync `2026-09-15T03:40:16Z`. Maps the Design Component onto the Svelte files |
| `Das Profile.dc.html` | **The layout that was stolen.** One Design Component of this profile |
| `uploads/spacehey-v3-bw-red.html` | Locked black/white/red tokens. Document title `Arriq — Profile v2`. Barcode text `003 963 6663` |
| `screenshots/recheck.png` | Target screenshot of the cream-card layout |
| `.thumbnail` | Small preview of the same layout |
| `uploads/Gemini_Generated_Image_elwctvelwctvelwc.jpg` | Gothic MySpace mood: black/white collage, barcodes, wings. Energy, not a 1:1 layout. Re-attached 2026-09-23 and saved at [assets/mood/gothic-grunge-myspace.jpg](assets/mood/gothic-grunge-myspace.jpg) |
| `uploads/Gemini_Generated_Image_24trlz24trlz24tr (1).jpg` | Narrow wireframe: star tile background, social row, widgets beside interests |
| `image-slot.js`, `support.js` | Design-component runtime. Not ported |

`github.md` said, in substance:

- Recreate the repo’s SpaceHey profile as one Design Component.
- Reskin to the locked black/white/red palette from `spacehey-v3-bw-red.html`, replacing the warm rust tokens.
- Add a social links row (Instagram, X, Discord, Spotify, GitHub, portfolio) “per the linktree request.”
- Photos, avatar, and friends in the DC are image-slot placeholders, not the repo’s static images.
- Screen map: `Das Profile.dc.html` ↔ `+page.svelte`, `src/lib/components/*.svelte`, `profile.ts`, `types.ts`, `tokens.css`, `app.css`, `motion.css`.

The “linktree request” lives in that zip note. It was not a separate typed
chat line.

## Stolen from `Das Profile.dc.html`

- Full-bleed black page, grain overlay, tiled star field (`background-size: 340px 200px`)
- Max width 960px (`--page-max: 60rem`)
- Nav: brand `dasdev.net / p`, links in red, pill mode toggle with a sliding red indicator
- Title row: huge DAS on the left, barcode `003 963 6663` on the right
- Two columns `minmax(0, 280px) 1fr`
- Left: cream polaroid (`rotate(-2.4deg)`), LINKS 3×2, Contacting Das (first button red, rest black, 1px black shadow)
- Right: About with `[edit]` in the header, Who I’d like to meet, black widget cards, interests table (black `th`, cream `td`)
- Full width under that: Pics, Now Playing (barcode in the header), Blinkies on a black strip, Friend Space (barcode in the header), Guestbook (black entries, red left border on replies, red sign button), footer counter with red digits
- Spotify tile is the red accent in the social grid
- Pro vars from the same file: light portfolio skin, grain and stars off, glitch colors transparent

Social marks shipped: IG, X, DC, SP, GH, WWW.

| Mark | Label | href |
|------|-------|------|
| IG | instagram | `https://instagram.com/` placeholder |
| X | twitter | `https://x.com/` placeholder |
| DC | discord | `https://discord.com/` placeholder |
| SP | spotify | `https://open.spotify.com/` placeholder, `accent: true` |
| GH | github | `https://github.com/DasVR` |
| WWW | portfolio | `https://dasdev.net` |

## Kept on purpose

- Generated photos already in the app. The user asked to steal the
  **layout**, and the zip’s slots were empty. Gemini JPGs were not
  installed.
- Guestbook behavior, edit mode, widget add, visitor count, `localStorage`.
- Pages helpers: `assetUrl` / `pageHref`, `BASE_PATH`, workflow that
  strips `CNAME`.
- Svelte 5 / NIL rules and the existing component split.
- Copy voice already in `profile.ts` (see below). The DC reused that copy.

## Not taken

- Zip image-slot placeholders and `image-slot.js`
- The DC’s literal heading string `Das` (the app uses `DAS`)
- A separate `StarField.svelte` (stars are a div in `+layout.svelte`)
- The original rust tokens as the casual skin (they remain only as history)

## Generated stand-in assets

Same files as `static/`, copied into [assets/profile/](assets/profile/)
so this folder has the bytes. They are not real digicam shots. The prompt
asked for real ones before the photo section was styled. They were never
supplied. The gallery is [assets/README.md](assets/README.md).

## Copy voice (pointers, not a second theme)

Casual and pro share one `profile.ts`. Theme is CSS.

- Display name `DAS`, brand `dasdev.net`, username `das`
- Location `Florida · remote`, member since `Jan 20, 2007`
- Mood `currently: compiling a feeling`
- Last login `right now, probably`
- Tags: florida, analog, nil, 2007, homelab
- About: anti-template sites, NIL, a Minecraft box, RouteSim, this page,
  Florida humidity, analog cameras, old web bookmarks, the line
  “Not cyberpunk.”
- Meet: people who still leave comments, SpaceHey
- Playlist `GIG FLYER VOL. 2` / `das · mix`. Default highlighted track is
  Deftones “Change (In the House of Flies)”. A later browser check clicked
  “Be Quiet and Drive (Far Away)” and the hint followed.
- Widgets: Minecraft / homelab, NIL, `p.dasdev.net`
- Guestbook authors (placeholder fiction, not a user script): mossbox,
  lain.local, polebarn, humidkid, das. Threading was the requirement.
- Contact toasts: friend request “they still use AIM”; message points at
  `hello@dasdev.net`; IM says das is idle; forward mentions a group chat
  that still says “lol myspace”.
- Footer line: `p.dasdev.net · not a template · grain is a feature`

## Other repos looked at while building

| Repo | Why |
|------|-----|
| `DasVR/NIL` | Svelte 5 rules. Also has `.claude/skills` (design, brand, frontend taste). Those skills were not the visual source of this page |
| `DasVR/Das-web` | Portfolio. Its Pages workflow was the pattern for `deploy-pages`. Live portfolio cited as dasdev.net and as `https://dasvr.github.io/Das-web/` |
| `DasVR/master-plan` | Personal docs repo. Intended home for this archive. The agent could not push there |
