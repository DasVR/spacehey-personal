export type Mode = 'casual' | 'pro';

export type IconName =
  | 'github'
  | 'globe'
  | 'mail'
  | 'instagram'
  | 'x'
  | 'discord'
  | 'spotify'
  | 'share'
  | 'contact'
  | 'copy'
  | 'check'
  | 'nfc'
  | 'qr'
  | 'arrow'
  | 'play'
  | 'pause'
  | 'pin'
  | 'music'
  | 'code'
  | 'moon'
  | 'coffee'
  | 'camera'
  | 'game'
  | 'film'
  | 'star'
  | 'plus'
  | 'upload'
  | 'download'
  | 'close'
  | 'chevron-left'
  | 'chevron-right'
  | 'clock'
  | 'image'
  | 'sparkle'
  | 'tiktok'
  | 'bluesky'
  | 'youtube'
  | 'twitch';

export interface Link {
  id: string;
  label: string;
  href: string;
  icon: IconName;
  /** Shown under the label on the card, e.g. a handle. */
  detail?: string;
  /** Pinned to the top as the big accent button. */
  featured?: boolean;
}

export interface Image {
  src: string;
  alt: string;
}

export interface Identity {
  name: string;
  handle: string;
  brand: string;
  host: string;
  email: string;
  location: string;
  avatar: Image;
}

export interface Record {
  id: string;
  title: string;
  artist: string;
  album: string;
  year: string;
  genre: string;
  duration: string;
  /** Apple artwork, 1000×1000. */
  artwork: string;
  /** 30-second Apple preview. */
  preview: string;
  /** Apple Music link for the track. */
  url: string;
}

export interface Crate {
  title: string;
  curator: string;
  /** The whole playlist on Apple Music, when set. */
  appleMusicUrl: string;
  tracks: Record[];
}

export type StatusGlyph = 'code' | 'music' | 'moon' | 'coffee' | 'camera' | 'game';

export interface Status {
  glyph: StatusGlyph;
  text: string;
  /** ISO date-time; shown as "2h ago". */
  since: string;
}

export interface InterestGroup {
  id: string;
  label: string;
  icon: IconName;
  blurb: string;
  items: string[];
}

export type SocialPlatform = 'instagram' | 'x' | 'github' | 'tiktok' | 'bluesky' | 'youtube' | 'twitch';

export interface Friend {
  id: string;
  name: string;
  caption: string;
  /** Pulls their real profile picture. Without it the friend gets a colour tile. */
  social?: { platform: SocialPlatform; handle: string };
  /** Colour tile used when there is no social avatar (or it fails to load). */
  tile: string;
}

export interface GuestbookEntry {
  id: string;
  author: string;
  date: string;
  body: string;
  replies?: GuestbookEntry[];
}

/** Giscus: GitHub Discussions behind the guestbook. Empty ids = not set up yet. */
export interface GiscusConfig {
  repo: string;
  repoId: string;
  category: string;
  categoryId: string;
}

export interface CasualProfile {
  tagline: string;
  statuses: Status[];
  lastSeen: string;
  memberSince: string;
  timezone: string;
  about: string;
  links: Link[];
  interests: InterestGroup[];
  friends: Friend[];
  guestbook: GuestbookEntry[];
  giscus: GiscusConfig;
}

export type WorkStatus = 'live' | 'building' | 'running';

export interface Work {
  id: string;
  name: string;
  summary: string;
  status: WorkStatus;
  meta: string;
  href?: string;
  /** Shown when the row is expanded. */
  details?: string;
  tags?: string[];
}

export interface ProProfile {
  role: string;
  /** Project types for the "start a project" composer. */
  projectTypes: string[];
  availability: string;
  summary: string;
  links: Link[];
  work: Work[];
  capabilities: string[];
  stack: string[];
}

/** What goes into the downloadable vCard for a mode. */
export interface ContactCard {
  mode: Mode;
  name: string;
  nickname: string;
  title?: string;
  org?: string;
  email: string;
  url: string;
  note: string;
  location: string;
  socials: { type: string; url: string }[];
  photo?: { mime: string; base64: string };
}
