import type { CasualProfile, Identity, ProProfile } from './types';

/*
 * All copy lives here. Components take props; routes compose.
 * Casual carries the SpaceHey profile forward. Pro is the same person on paper.
 */

export const identity: Identity = {
  name: 'Arriq',
  handle: 'arriq',
  brand: 'DasDev.net',
  host: 'p.dasdev.net',
  email: 'hello@dasdev.net',
  location: 'Florida · remote',
  avatar: {
    src: '/photos/avatar.jpg',
    alt: 'The dasdev mark: two strokes inside a broken ring',
  },
};

export const casual: CasualProfile = {
  tagline: 'websites that don’t come out of a template drawer',
  // Newest first. The card shows the first and lets visitors flip back through.
  statuses: [
    { glyph: 'code', text: 'Shipping the tap card', since: '2026-09-23T15:00:00-04:00' },
    { glyph: 'music', text: 'White Pony on repeat', since: '2026-09-23T09:30:00-04:00' },
    { glyph: 'moon', text: 'Homelab after dark', since: '2026-09-22T23:10:00-04:00' },
  ],
  lastSeen: 'right now, probably',
  memberSince: 'Jan 20, 2007',
  timezone: 'America/New_York',
  about:
    'I build for small businesses and for myself — NIL, a Minecraft box that stays up, RouteSim, this page. Florida humidity on the windows, analog cameras in a drawer, old web in the bookmarks. A room with the lights down and a flyer on the wall.',
  links: [
    { id: 'ig', label: 'Instagram', href: 'https://instagram.com/', icon: 'instagram' },
    { id: 'x', label: 'X', href: 'https://x.com/', icon: 'x' },
    { id: 'dc', label: 'Discord', href: 'https://discord.com/', icon: 'discord' },
    { id: 'am', label: 'Apple Music', href: 'https://music.apple.com/', icon: 'music' },
    { id: 'gh', label: 'GitHub', href: 'https://github.com/DasVR', icon: 'github', detail: 'DasVR' },
    { id: 'www', label: 'DasDev.net', href: 'https://dasdev.net', icon: 'globe' },
  ],
  interests: [
    {
      id: 'music',
      label: 'Music',
      icon: 'music',
      blurb: 'Whatever was on the mix CD in the glovebox. Loud, then very quiet.',
      items: ['Deftones', 'Nirvana', 'Have a Nice Life', 'Slowdive', 'Type O Negative', 'shoegaze', 'late-night drives'],
    },
    {
      id: 'making',
      label: 'Making',
      icon: 'code',
      blurb: 'Websites that feel inhabited, and the machines that keep them up.',
      items: ['SvelteKit', 'WebGL shaders', 'NIL', 'RouteSim', 'homelab', 'self-hosting', 'small-business sites'],
    },
    {
      id: 'analog',
      label: 'Analog',
      icon: 'camera',
      blurb: 'Film cameras in a drawer and a soft spot for anything with a dial.',
      items: ['35mm film', 'disposables', 'cassettes', 'CRTs', 'flyers on telephone poles'],
    },
    {
      id: 'watching',
      label: 'Watching',
      icon: 'film',
      blurb: 'Stuff that felt like it came through the TV at 2am.',
      items: ['Donnie Darko', 'Serial Experiments Lain', 'Adult Swim bumpers', 'concert docs on cheap cameras'],
    },
    {
      id: 'playing',
      label: 'Playing',
      icon: 'game',
      blurb: 'The server is always up. Building in the dark with the rain on.',
      items: ['Minecraft', 'modded servers', 'co-op anything', 'old handhelds'],
    },
    {
      id: 'heroes',
      label: 'Heroes',
      icon: 'star',
      blurb: 'The people who made the old web weird on purpose.',
      items: ['whoever left a 2004 guestbook entry that still loads', 'the inventor of the 88×31 blinkie', 'Florida storms'],
    },
  ],
  // Add `social: { platform, handle }` to pull a friend's real profile picture.
  friends: [
    { id: 'f1', name: 'mossbox', caption: 'brings the aux', tile: '/friends/f2.jpg' },
    { id: 'f2', name: 'lain.local', caption: 'wired', tile: '/friends/f3.jpg' },
    { id: 'f3', name: 'polebarn', caption: 'flyer thief', tile: '/friends/f4.jpg' },
    { id: 'f4', name: 'humidkid', caption: 'florida', tile: '/friends/f5.jpg' },
    { id: 'f5', name: 'scanline', caption: 'crt loyalist', tile: '/friends/f6.jpg' },
    { id: 'f6', name: 'slowdrive', caption: 'reverb', tile: '/friends/f7.jpg' },
    { id: 'f7', name: 'nil-finn', caption: 'on-device', tile: '/friends/f8.jpg' },
    { id: 'f8', name: 'DasVR', caption: 'the studio', tile: '/friends/f1.jpg', social: { platform: 'github', handle: 'DasVR' } },
  ],
  guestbook: [
    {
      id: 'g1',
      author: 'mossbox',
      date: 'Sep 12, 2026',
      body: 'tapped my phone on your keychain and it did the thing. do not clean it up.',
      replies: [{ id: 'g1a', author: 'arriq', date: 'Sep 12, 2026', body: 'that is the assignment. dither stays.' }],
    },
    {
      id: 'g2',
      author: 'lain.local',
      date: 'Sep 10, 2026',
      body: 'pro mode is a jump scare. put the flyer back.',
    },
    {
      id: 'g3',
      author: 'polebarn',
      date: 'Sep 8, 2026',
      body: 'saw a Deftones poster on 19 that looked exactly like your album tile. coincidence is a kind of design.',
      replies: [
        { id: 'g3a', author: 'humidkid', date: 'Sep 8, 2026', body: 'it is never a coincidence down here.' },
        { id: 'g3b', author: 'arriq', date: 'Sep 9, 2026', body: 'bring me the poster.' },
      ],
    },
  ],
  // Fill these in from giscus.app once Discussions + the giscus app are on the repo.
  giscus: {
    repo: 'DasVR/spacehey-personal',
    repoId: '',
    category: 'Guestbook',
    categoryId: '',
  },
};

export const pro: ProProfile = {
  role: 'Web developer & design engineer',
  availability: 'Open to small-business sites',
  summary:
    'I design and build websites for small businesses that don’t look like they came out of a template drawer — fast, hand-styled, and easy to keep running. On the side I build tools I want to exist.',
  links: [
    { id: 'mail', label: 'Email', href: 'mailto:hello@dasdev.net', icon: 'mail', detail: 'hello@dasdev.net' },
    { id: 'www', label: 'Portfolio', href: 'https://dasdev.net', icon: 'globe', detail: 'dasdev.net' },
    { id: 'gh', label: 'GitHub', href: 'https://github.com/DasVR', icon: 'github', detail: 'DasVR' },
  ],
  work: [
    {
      id: 'dasdev',
      name: 'dasdev.net',
      summary: 'Portfolio and studio front door. Client sites for small businesses.',
      status: 'live',
      meta: 'Studio',
      href: 'https://dasdev.net',
    },
    {
      id: 'nil',
      name: 'NIL',
      summary: 'A terminal-first workstation. Svelte 5, on-device, opinionated.',
      status: 'building',
      meta: 'Product',
    },
    {
      id: 'routesim',
      name: 'RouteSim',
      summary: 'A simulation side project that keeps earning more weekends.',
      status: 'building',
      meta: 'Side project',
    },
    {
      id: 'homelab',
      name: 'Homelab',
      summary: 'Self-hosted services and a Minecraft box that stays up through Florida storms.',
      status: 'running',
      meta: 'Infra',
    },
    {
      id: 'card',
      name: 'p.dasdev.net',
      summary: 'This card. WebGL dithering, NFC tap-to-share, a vCard in one tap.',
      status: 'live',
      meta: 'Identity',
    },
  ],
  capabilities: ['Marketing sites', 'Design systems', 'Front-end engineering', 'Motion & WebGL', 'Self-hosting'],
  stack: ['SvelteKit', 'Svelte 5', 'TypeScript', 'WebGL', 'Node', 'Linux'],
};
