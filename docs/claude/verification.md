# Verification

## Commands that passed

`npm run check` (`svelte-kit sync && svelte-check`) reported 0 errors and
0 warnings after the first skin, after the Pages base path, after the
cream reskin, and after the pro `on-void` fix.

Vitest:

| When | Result |
|------|--------|
| First skin | `randomRotate.test.ts`, 1 test |
| After Pages helpers | `randomRotate` + `joinBase.test.ts`, 4 tests |
| After cream layout and again after the contrast fix | those plus `barcode.test.ts`, 6 tests |

`vite build` (static adapter) succeeded for the first skin and again after
the cream reskin. `npm run build:pages` succeeded before PR #2. A fresh
production build of commit `95b3297` was not recorded in the chat after
the contrast tweak; `svelte-check` and vitest were.

## GitHub Actions

- `6ac1d1f` on the first branch: checks succeeded. The agent also called
  HEAD `e03722f` green (check + GitGuardian).
- Pages: see the run table in [shipped.md](shipped.md). `main` after PR #2
  deployed. The cream branch’s `ci` workflow succeeded. Cream is not what
  Pages serves.

## Browser, rust skin (PR #1)

Exercised, not just a screenshot: casual/pro, edit, contact toast,
guestbook sign, playlist highlight, nav to blog / friends / layouts,
mobile stack. Photo scatter overlapping Now Playing was found and fixed
(`e03722f`).

Artifacts from that pass (agent VM, not in git):

- `profile_casual_top.webp`, `profile_contact_toast.webp`,
  `profile_guestbook.webp`, `profile_interests_and_pics.webp`,
  `profile_now_playing.webp`, `profile_photo_scatter.webp`,
  `profile_pro_theme.webp`, `profile_pics_cleared.png`,
  `profile_full_after_contain.png`
- `profile_casual_pro_edit_guestbook.mp4`
- `profile_interests_and_photo_scatter.mp4`

## Browser, cream skin (PR #3)

Computer-use hit an image cap, so the pass was headed Chrome on the dev
server (`http://127.0.0.1:5173`) driven with puppeteer-core against the
remote debugging port.

Script results:

- H1 text `DAS`, barcode `003 963 6663` present
- Social marks: IG instagram, X twitter, DC discord, SP spotify, GH github, WWW portfolio
- `[edit]` inside the first About blurb, not beside the title
- Interests inside `.col-right`
- SP tile has the accent class
- `[edit]` became `[done]`; typing `[layout-check]` into About persisted
- Toast: `friend request queued. they still use AIM.`
- Track click moved the hint to `Be Quiet and Drive (Far Away) — audio hookup later…`
- Guestbook accepted name `layout-bot` and comment `cream cards on black`
- Pro set `documentElement.dataset.theme` to `pro`, casual set it back
- `/blog/`, `/friends/`, `/layouts/` rendered Blog, Friends, Layouts
- At 390×844, `.columns` computed to one grid column

Screenshots then showed pro mode social marks in a dark color on black
tiles. That was fixed. A second capture computed pro social mark colors
as `rgb(255, 252, 247)` except the red SP tile, which stayed white.

Artifacts:

- `desktop_casual_top.png`, `desktop_casual_mid.png`, `desktop_casual_hero.png`
- `desktop_after_edit.png`, `desktop_contact_toast.png`, `desktop_guestbook.png`
- `desktop_pro_mode.png`, `desktop_pro_social.png`
- `mobile_casual_top.png`, `mobile_casual_mid.png`
- `cream_card_layout_browser_pass.mp4`

Those files lived under `/opt/cursor/artifacts/` on the agent VM. They are
not in either git repo. The PR body on PR #3 referenced the hero shot and
the video.

## What was not verified

- `p.dasdev.net` DNS and hosting
- Real audio playback
- A second machine’s `localStorage` (guestbook/widget persistence was
  exercised in one Chrome profile)
- The cream layout on GitHub Pages (it is not on `main`)
