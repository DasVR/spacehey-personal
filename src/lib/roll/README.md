# Roll

Drop photos here and they show up on the page — no code to touch.

- **Name:** `YYYY-MM-DD--a-short-caption.jpg`. The date sorts the roll
  (newest first) and the rest becomes the caption: dashes turn into spaces.
- **Formats:** `.jpg`, `.jpeg`, `.png`, `.webp`, `.avif`.
- **Easiest way:** open `/roll/add/` on the site. It resizes or upscales
  the photo, strips location data, previews the dither, names the file for
  you and opens GitHub's upload page for this folder.

## Per-photo look (optional)

Put a `.json` with the same name next to a photo to tune how it shows:

```json
{
  "caption": "Overrides the one from the file name",
  "note": "A line under the caption in the viewer",
  "dither": true,
  "grain": 4,
  "tones": 2,
  "palette": "ember",
  "focus": [50, 30]
}
```

- **palette:** `theme`, `mono`, `ember`, `ocean`, `mint`, `sepia`, `rose`,
  or your own three colours dark → light: `["#0b0b0b", "#1d4ed8", "#f5f5f5"]`.
- **dither:** `false` shows the plain photo.
- **focus:** where the square crop centres, in percent `[x, y]`.
- Every field is optional. `/roll/add/` builds this file for you.
