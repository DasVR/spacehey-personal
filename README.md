# spacehey-personal

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
