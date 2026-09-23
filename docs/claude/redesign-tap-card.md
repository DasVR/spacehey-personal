# Redesign: the tap card

Asked 23 Sep 2026 (Claude Code session), verbatim:

> Redesign the UI entirely based on the repository, The whole SpaceHey chat is
> now a Claude project at docs/claude/ in the profile repo. I want to build a
> casual and professional profiles, that I can scan with insanely nice shaders
> for all devices. Including an animation similar to iOS with tap for
> airdropping and contact information and such, that would work best from NFC
> tags. on iPhone, you click a notification afterwards. I want dithering and
> more like Claude, Cursor, Linear, Vercel and more. There are photos as well
> for more inspiration. Include your own creative interpretation, do not rely
> entirely on the documentation

This replaces the cream-card SpaceHey layout (PR #3, never merged). The
SpaceHey content carries forward inside the casual card; the look does not.

## Idea

The page is a contact card you receive, not a page you browse. A tag on a
keychain or business card holds `…/?via=nfc`. On iPhone the tag raises a
notification, the notification opens Safari, and the page plays the arrival:

1. An island pill (Dynamic Island–style, always black) expands at the top:
   dithered avatar, name, "Tapped · p.dasdev.net".
2. The WebGL field sends a luminous wave down from the top edge — where the
   phones touched — plus a ring from the same point.
3. The card grows out of the island (scale 0.22 → 1, blur 12 → 0) and its
   parts stagger in 100ms apart.
4. Android gets a short haptic (`navigator.vibrate`); iOS ignores it.
5. `via` is stripped from the URL afterwards so reloads and re-shares don't replay.

`?via=qr` plays the same sequence labelled "Scanned". "Replay tap" in the
footer runs it on demand.

## Two modes, two URLs

| Mode | URL | Look |
|------|-----|------|
| Casual | `/` | Night: black, cream, the old flyer red. Anton poster name over a dithered portrait. Mood, now playing, roll, interests, top 8, guestbook |
| Pro | `/pro/` | Paper: warm off-white, graphite, one clay accent. Instrument Serif name, role, availability, selected work, capabilities, tools, contact |

Separate routes (not a toggle) so each NFC tag or QR can point at one mode.
The switch in the top bar navigates between them with a view transition.
`hooks.server.ts` writes the right `data-theme` into prerendered HTML so
`/pro/` never flashes dark.

## Dithering everywhere

- **Field** (`src/lib/gl/field.ts`): one fragment shader. Two-pass domain-warped
  simplex fBm, a swaying horizon glow, a pointer lamp, the tap wave, then an
  8×8 Bayer ordered dither into four token colours. Renders at 1/3 (casual)
  or 1/2 (pro) of CSS resolution and upscales with `image-rendering:
  pixelated`, so phones shade a few thousand pixels a frame. Capped at 30fps
  (24 on ≤4 cores), paused when hidden, one still frame under reduced motion,
  a CSS gradient if WebGL is missing. Dims as you scroll past the card.
- **Images** (`DitherImage.svelte`): every photo is dithered on a 2D canvas
  with the same Bayer matrix and the mode's ink/paper colours. Hover (or
  press and hold on touch) "develops" it back into the photo.
- **QR** (`QrCode.svelte`): rounded modules, solid finders, dark on light so it scans.

## Contact

`/das.vcf` and `/das-pro.vcf` are prerendered vCard 3.0 files with the
avatar embedded. Opening one on iPhone shows the Add Contact sheet. Casual
lists socials; pro adds title and org. Share uses the Web Share sheet,
falling back to copying the link.

## Tags page

`/tags/` shows both QR codes and the NFC URLs, with copy buttons, and a
"Write to tag" button where Web NFC exists (Android Chrome). iPhone users
write with an app such as NFC Tools. NTAG213 is enough.

## References taken

Claude (warm paper, serif display, clay accent), Linear (hairline rows, mono
indices, restraint), Vercel / Cursor (dark field with a glow horizon, one-bit
texture), iOS NameDrop / Contact Posters / Dynamic Island (the arrival), the
gothic MySpace mood board (black/white/red, barcodes, collage energy — kept as
the serial number and the red). Motion values follow the `better-ui` skill:
`cubic-bezier(0.2, 0, 0, 1)`, press scale 0.96, icon swaps scale 0.25 →
1 with 4px blur, exact transition properties.

## Still open

- Pro copy (role, availability, RouteSim summary) is a draft. Confirm it.
- Social URLs other than GitHub and dasdev.net are still homepages.
- Photos are still the generated stand-ins.
- Real audio for Now Playing.
- `p.dasdev.net` DNS.

## Update: the dasdev mark

- The business icon is traced to `static/brand/mark.svg` and used as the
  favicon, the top-bar logo (`Logo.svelte`) and the avatar (which also
  feeds the vCard photo and the arrival island). The masked-face photo
  stand-ins are gone; the avatar is the mark on a lit backdrop and the
  Top 8 are colourful initial tiles.
- A bento/mood-board panel layout was tried and reverted; the casual page
  keeps its original Section-based layout.

## Update: crate, roll, interests, Top 8, guestbook (Arriq)

- Owner is **Arriq** of **DasDev.net**; the card, vCards and island say so.
- The "mood" line is now a status pill: icon, text, "2h ago", tap to flip
  back through recent statuses.
- The card adds live local time (with the offset from the visitor) and a
  QR sheet for face-to-face sharing.
- Now playing is **the crate**: real sleeves from Apple (via
  `npm run music`) that lean away as you swipe, cover-flow style; the
  vinyl slides out and spins while the 30s Apple preview plays, and it
  keeps playing as you flip.
- **Roll** reads `src/lib/roll/` at build time. Tap a photo for a lightbox
  with Dither/Photo, grain size and 1-bit/3-tone. Dithered images now
  "develop" from the finger/cursor with an animated mask. `/roll/add/` is
  the owner's upload tool.
- The mood-board image is gone: it was design reference, not content.
- **Interests** are a tab strip with a sliding pill, synced to a swipeable
  card carousel.
- **Top 8** pulls real avatars from socials through unavatar.io.
- **Guestbook** is giscus (GitHub Discussions) once configured; the local
  fallback gets reactions, input cleaning and a 30s rate limit.
