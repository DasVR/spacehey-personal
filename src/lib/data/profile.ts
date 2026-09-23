import type { CasualProfile, Identity, ProProfile } from './types';

/*
 * All copy lives here. Components take props; routes compose.
 * Casual carries the SpaceHey profile forward. Pro is the same person on paper.
 */

export const identity: Identity = {
  name: 'Das',
  handle: 'das',
  brand: 'dasdev.net',
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
  status: 'compiling a feeling',
  lastSeen: 'right now, probably',
  memberSince: 'Jan 20, 2007',
  about:
    'I build for small businesses and for myself — NIL, a Minecraft box that stays up, RouteSim, this page. Florida humidity on the windows, analog cameras in a drawer, old web in the bookmarks. A room with the lights down and a flyer on the wall.',
  links: [
    { id: 'ig', label: 'Instagram', href: 'https://instagram.com/', icon: 'instagram' },
    { id: 'x', label: 'X', href: 'https://x.com/', icon: 'x' },
    { id: 'dc', label: 'Discord', href: 'https://discord.com/', icon: 'discord' },
    { id: 'sp', label: 'Spotify', href: 'https://open.spotify.com/', icon: 'spotify' },
    { id: 'gh', label: 'GitHub', href: 'https://github.com/DasVR', icon: 'github', detail: 'DasVR' },
    { id: 'www', label: 'dasdev.net', href: 'https://dasdev.net', icon: 'globe' },
  ],
  roll: [
    { src: '/photos/gig-lights.jpg', alt: 'Crowd silhouettes under orange stage lights' },
    { src: '/photos/torn-flyer.jpg', alt: 'A torn gig flyer taped to a brick wall' },
    { src: '/photos/night-road.jpg', alt: 'A Florida night road under one streetlight' },
    { src: '/photos/cassette.jpg', alt: 'A cassette resting on a wooden desk' },
    { src: '/photos/desk-glow.jpg', alt: 'A dim workstation with a glowing monitor' },
    { src: '/photos/window-rain.jpg', alt: 'Rain on a night window' },
  ],
  wall: {
    src: '/photos/mood-board.jpg',
    alt: 'Gothic MySpace mood board: black-and-white collage, barcodes, wings, a dense friend grid',
  },
  playlist: {
    title: 'Gig Flyer Vol. 2',
    artist: 'das · mix',
    art: { src: '/album/gig-flyer-vol2.jpg', alt: 'Gig Flyer Vol. 2 cover' },
    tracks: [
      { id: 't1', title: 'Change (In the House of Flies)', artist: 'Deftones', duration: '4:59' },
      { id: 't2', title: 'Heart-Shaped Box', artist: 'Nirvana', duration: '4:41' },
      { id: 't3', title: 'Be Quiet and Drive (Far Away)', artist: 'Deftones', duration: '5:08' },
      { id: 't4', title: 'Bloodhail', artist: 'Have a Nice Life', duration: '6:13' },
      { id: 't5', title: 'When the Sun Hits', artist: 'Slowdive', duration: '4:47' },
      { id: 't6', title: 'Love You to Death', artist: 'Type O Negative', duration: '7:08' },
    ],
  },
  interests: [
    {
      label: 'General',
      value: 'homelab nights, analog cameras, Florida storms, websites that feel inhabited',
    },
    {
      label: 'Music',
      value: 'Deftones, Nirvana, Have a Nice Life, Slowdive, Type O Negative, the mix CD in the glovebox',
    },
    {
      label: 'Watching',
      value: 'Donnie Darko, Serial Experiments Lain, old Adult Swim bumpers, concert docs on cheap cameras',
    },
    {
      label: 'Heroes',
      value: 'whoever left a 2004 guestbook entry that still loads, the inventor of the 88×31 blinkie',
    },
  ],
  friends: [
    { id: 'f1', name: 'arriq', src: '/friends/f1.jpg', caption: 'top 8 forever' },
    { id: 'f2', name: 'mossbox', src: '/friends/f2.jpg', caption: 'brings the aux' },
    { id: 'f3', name: 'lain.local', src: '/friends/f3.jpg', caption: 'wired' },
    { id: 'f4', name: 'polebarn', src: '/friends/f4.jpg', caption: 'flyer thief' },
    { id: 'f5', name: 'humidkid', src: '/friends/f5.jpg', caption: 'florida' },
    { id: 'f6', name: 'scanline', src: '/friends/f6.jpg', caption: 'crt loyalist' },
    { id: 'f7', name: 'slowdrive', src: '/friends/f7.jpg', caption: 'reverb' },
    { id: 'f8', name: 'nil-finn', src: '/friends/f8.jpg', caption: 'on-device' },
  ],
  guestbook: [
    {
      id: 'g1',
      author: 'mossbox',
      date: 'Sep 12, 2026',
      body: 'tapped my phone on your keychain and it did the thing. do not clean it up.',
      replies: [{ id: 'g1a', author: 'das', date: 'Sep 12, 2026', body: 'that is the assignment. dither stays.' }],
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
        { id: 'g3b', author: 'das', date: 'Sep 9, 2026', body: 'bring me the poster.' },
      ],
    },
  ],
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
