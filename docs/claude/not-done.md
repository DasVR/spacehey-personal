# Not done yet

Items the chat left open. Do not treat the cream layout as live just
because the branch exists.

## Deploy

- [ ] Merge PR #3 so the cream-card layout replaces the rust skin on `main`.
      It is still a draft: https://github.com/DasVR/spacehey-personal/pull/3
- [ ] After that merge, confirm the `pages` workflow deploys the new skin.
      https://dasvr.github.io/spacehey-personal/ was HTTP 200 on 2026-09-23
      but still served `--color-bg: #0d0b09`.
- [ ] Point `p.dasdev.net` at the static build. `static/CNAME` already says
      `p.dasdev.net`. The Pages workflow deletes `CNAME` from the github.io
      artifact on purpose. The subdomain itself was never shown serving.
- [x] Enable GitHub Pages (source: GitHub Actions). This blocked the first
      deploys. The `main` workflow after PR #2 succeeded, and the github.io
      URL returns 200. Leave this checked unless Pages is turned off again.
- [x] Repo visibility. During the chat it was described as private (Pages
      on a private repo needs GitHub Pro/Team). On 2026-09-23 it is publicly
      listed. If it is made private again, Pages will break on Free.

## Content the prompt asked for and did not get

- [ ] Real digicam / moodboard photos in `static/photos/`. The committed
      JPGs are generated stand-ins (avatar, gig lights, torn flyer, night
      road, cassette, desk glow, window rain, eight friends, album tile).
- [ ] `spacehey-hallmark-final.html` was the requested visual reference
      and was never provided. Do not invent it.
- [ ] Real URLs for Instagram, X, Discord, and Spotify. They are homepages.
      GitHub is `https://github.com/DasVR`. Portfolio is `https://dasdev.net`.
- [ ] The zip’s Gemini images were mood only. They were not placed on the page.
      The zip itself is no longer on the agent disk, so `recheck.png`,
      the two Gemini JPGs, and `Das Profile.dc.html` are not in
      `docs/claude/assets/`. Re-attach the zip to add them.

## Explicitly later

- [ ] Real audio. Spotify / Apple Music embed, or an `<audio>` file.
      The row highlights and the hint says the speakers are not hooked up.
      An empty audio element was removed because it looked broken.
- [ ] A real customizer: edit the underlying data, not the markup. What
      exists is in-page `[edit]` for about, meet, mood, and widgets, plus
      `localStorage` for guestbook (`profile-guestbook`), widgets
      (`profile-widgets`), visitor count (`profile-visitor-count`), and
      theme (`profile-theme`).
- [ ] Layouts page copy still describes the toggle. It is not a layout
      editor.

## Product notes that are easy to “fix” and should not be

- Placeholder guestbook fiction can be replaced when real entries exist.
  Threading has to stay.
- Barcode digits `003 963 6663` are a design motif from the zip, not a
      phone number to look up.
- Friend names (arriq, mossbox, lain.local, polebarn, humidkid, scanline,
  slowdrive, nil-finn) are profile fiction.
- Do not add a branch named `gh-pages`. Deploy stays on GitHub Actions.
- Do not put the rust palette back as casual unless someone asks. It is
  history, and it is what Pages shows only because PR #3 is unmerged.
