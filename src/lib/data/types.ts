export interface NavLink {
  href: string;
  label: string;
}

export interface Tag {
  label: string;
}

export interface SocialLink {
  id: string;
  mark: string;
  label: string;
  href: string;
  accent?: boolean;
}

export type ContactId = 'friend' | 'message' | 'im' | 'forward';

export interface ContactAction {
  id: ContactId;
  label: string;
}

export interface InterestRow {
  label: string;
  value: string;
}

export type WidgetKind = 'game' | 'status' | 'building' | 'custom';

export interface Widget {
  id: string;
  kind: WidgetKind;
  title: string;
  body: string;
  span?: 1 | 2;
}

export interface Photo {
  src: string;
  alt: string;
  rotate: number;
  left: string;
  top: string;
  width: string;
  z: number;
  bleed?: boolean;
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  duration: string;
  playing?: boolean;
}

export interface Blinkie {
  id: string;
  label: string;
  href?: string;
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

export interface Profile {
  brand: string;
  displayName: string;
  username: string;
  location: string;
  memberSince: string;
  mood: string;
  lastLogin: string;
  avatar: { src: string; alt: string };
  tags: Tag[];
  nav: NavLink[];
  barcode: string;
  socials: SocialLink[];
  contacts: ContactAction[];
  about: string;
  meet: string;
  interests: InterestRow[];
  widgets: Widget[];
  photos: Photo[];
  playlist: {
    title: string;
    artist: string;
    art: string;
    tracks: Track[];
  };
  blinkies: Blinkie[];
  friends: Friend[];
  guestbook: GuestbookEntry[];
}
