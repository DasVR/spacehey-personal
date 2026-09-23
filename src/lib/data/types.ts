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
  | 'pin';

export interface Link {
  id: string;
  label: string;
  href: string;
  icon: IconName;
  /** Shown under the label on the card, e.g. a handle. */
  detail?: string;
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

export interface Track {
  id: string;
  title: string;
  artist: string;
  duration: string;
}

export interface Interest {
  label: string;
  value: string;
}

export interface Friend {
  id: string;
  name: string;
  src: string;
  caption: string;
}

export interface GuestbookEntry {
  id: string;
  author: string;
  date: string;
  body: string;
  replies?: GuestbookEntry[];
}

export interface CasualProfile {
  tagline: string;
  status: string;
  lastSeen: string;
  memberSince: string;
  about: string;
  links: Link[];
  roll: Image[];
  playlist: { title: string; artist: string; art: Image; tracks: Track[] };
  interests: Interest[];
  friends: Friend[];
  guestbook: GuestbookEntry[];
}

export type WorkStatus = 'live' | 'building' | 'running';

export interface Work {
  id: string;
  name: string;
  summary: string;
  status: WorkStatus;
  meta: string;
  href?: string;
}

export interface ProProfile {
  role: string;
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
