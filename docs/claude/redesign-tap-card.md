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

## Update: mood-board bento and the dasdev mark

- The casual page is the gothic MySpace mood board rebuilt: paper panels
  with black title bars (Blurbs, Interests, My Music, Friend Space, Roll,
  Mood board, Comments), barcode stickers, a red "Add as friend" button.
  One column on phones, two on tablets, three on laptops with My Music
  running tall down the side.
- On laptops the card is sticky and sized to the window, so it never
  needs scrolling.
- The masked-face stand-ins are gone. The avatar is the dasdev mark
  (`static/brand/mark.svg`, also the favicon and top-bar logo), and the
  Top 8 are colourful initial tiles.
