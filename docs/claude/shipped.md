# What shipped

Repo: https://github.com/DasVR/spacehey-personal

Package scripts: `dev`, `build`, `build:pages` (`BASE_PATH=/spacehey-personal`),
`preview`, `check`, `test`.

The repo started as a README. Three pull requests followed.

## PR #1 — merged

https://github.com/DasVR/spacehey-personal/pull/1

- Branch `cursor/y2k-grunge-profile-8232`
- Ready for review, then merged by DasVR at `2026-09-15T00:53:50Z`
- Merge commit `c0958d8`

Commits:

- `6ac1d1f` Build a SpaceHey × gig-flyer profile as a static SvelteKit site
- `a510b07` Widen the interests table and give the photo scatter room
- `e03722f` Keep the photo pile from covering Now Playing

What that PR was: rust-token grunge skin, casual/pro via `data-theme`,
content in `profile.ts`, `[edit]` originally beside the name, guestbook
and widgets in `localStorage`, generated photos, stub routes
`/blog`, `/friends`, `/layouts`, CI workflow, `static/CNAME`.

Rule file: `.cursor/rules/profile-design.mdc`.

## PR #2 — merged

https://github.com/DasVR/spacehey-personal/pull/2

- Branch `cursor/github-pages-preview-8232`
- Merged `2026-09-15T01:00:06Z` (the chat summary at the time still called
  it open; GitHub now shows it merged)

Commits:

- `1729108` Deploy a GitHub Pages preview at dasvr.github.io/spacehey-personal
- `178ab96` Point the Pages workflow at this branch and document enabling Pages

`.github/workflows/pages.yml` runs on push to `main` and to
`cursor/github-pages-preview-8232`, plus `workflow_dispatch`. It runs
`npm run build:pages`, deletes `build/CNAME`, uploads the artifact, and
deploys with `actions/deploy-pages`. `joinBase` / `joinPage` prefix asset
and nav URLs. `trailingSlash: 'always'` so routes are `blog/index.html`.

## PR #3 — open draft

https://github.com/DasVR/spacehey-personal/pull/3

- Branch `cursor/bw-red-layout-8232`
- Branched from the Pages line, so it contains PR #2’s commits plus the reskin
- Not merged as of 2026-09-23

Commits:

- `c812310` Reskin the profile to the uploaded cream-card layout
- `95b3297` Keep cream type on black tiles in pro mode

New files: `Barcode.svelte`, `SocialLinks.svelte`, `src/lib/utils/barcode.ts`,
`barcode.test.ts`.

The design rule file was rewritten so the zip’s Design Component is the
layout source of truth and the locked casual hex is black/cream/red.

## What is actually live

https://dasvr.github.io/spacehey-personal/

Checked 2026-09-23: HTTP 200, `last-modified: Tue, 15 Sep 2026 01:01:14 GMT`.
The HTML still contains the **rust** token `--color-bg: #0d0b09`. That is
`main` after PR #2, before the cream reskin.

Successful Pages run on `main`:
https://github.com/DasVR/spacehey-personal/actions/runs/34915479674

Earlier failures, for the record:

| Run | Branch | Result |
|-----|--------|--------|
| [34915350280](https://github.com/DasVR/spacehey-personal/actions/runs/34915350280) | `cursor/y2k-grunge-profile-8232` | cancelled. `deploy-pages` had returned Not Found because Pages was not enabled |
| [34915439159](https://github.com/DasVR/spacehey-personal/actions/runs/34915439159) | `cursor/github-pages-preview-8232` | failure, just before the merge |
| [34915479674](https://github.com/DasVR/spacehey-personal/actions/runs/34915479674) | `main` | success, after PR #2 merged |

CI on the cream branch also went green:
https://github.com/DasVR/spacehey-personal/actions/runs/34929368011

`p.dasdev.net` is still only a CNAME file. Nothing in the chat showed that
subdomain serving the build.

As of this archive the GitHub repo is publicly listed. During the Pages
work it was treated as private, which is why the notes say GitHub Free
cannot serve Pages for a private repo (Pro/Team, or make it public).

## Component map (after PR #3)

| Piece | File |
|-------|------|
| Page composition | `src/routes/+page.svelte` |
| Nav + pill toggle | `ProfileNav.svelte` |
| DAS + barcode | `ProfileTitle.svelte`, `Barcode.svelte` |
| Polaroid header | `ProfileHeader.svelte` |
| Social 3×2 | `SocialLinks.svelte` |
| Contacting Das | `ContactButtons.svelte` |
| About / meet, `[edit]` on About | `Blurb.svelte` |
| Widgets | `WidgetGrid.svelte` |
| Interests | `InterestsTable.svelte` |
| Pics | `PhotoScatter.svelte` |
| Now Playing | `PlaylistWidget.svelte` |
| Blinkies | `BlinkieRow.svelte` |
| Friends | `FriendGrid.svelte` |
| Guestbook | `Guestbook.svelte` |
| Visitor counter | `ProfileFooter.svelte` |
| Grain + stars | `GrainLayer.svelte` inside `+layout.svelte` |
| Theme | `src/lib/theme.svelte.ts` (`localStorage` key `profile-theme`) |
| Edit / guestbook / widgets / visitors | `src/lib/profile.svelte.ts` |
| Tokens / motion / base CSS | `src/lib/styles/tokens.css`, `motion.css`, `app.css` |

Inner pages `/blog`, `/friends`, `/layouts` use `InnerPage.svelte`.
Friends reuses `FriendGrid`.

## Corrections made along the way

1. Interests table was cramped and the photo pile was clipped. The table
   was widened and the stage grew.
2. Photos still covered the Now Playing header. Side bleed stayed; the
   next section starts below the pile (`z-index` on the player, taller stage).
3. An empty `<audio>` bar was hidden so it would not look broken or request
   the page URL.
4. Cream reskin: titles moved from `--color-ink` to `--color-panel-ink`
   so they are not cream-on-cream.
5. `[edit]` moved from beside DAS into the About header, matching the DC.
6. Pro mode painted dark marks on black social tiles. `--color-on-void`
   is cream (casual) or near-white (pro) and is what black tiles use.
