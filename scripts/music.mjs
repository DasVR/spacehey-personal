#!/usr/bin/env node
/*
 * Resolve src/lib/data/playlist.json against the iTunes Search API and write
 * src/lib/data/music.json: real album artwork, 30s previews and Apple Music
 * links. Run after editing the playlist:  npm run music
 *
 * The result is committed, so builds never depend on Apple being reachable.
 */
import { readFileSync, writeFileSync } from 'node:fs';

const src = new URL('../src/lib/data/playlist.json', import.meta.url);
const out = new URL('../src/lib/data/music.json', import.meta.url);
const playlist = JSON.parse(readFileSync(src, 'utf8'));

const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

async function resolve({ title, artist }) {
  const term = encodeURIComponent(`${artist} ${title}`);
  const res = await fetch(`https://itunes.apple.com/search?term=${term}&entity=song&limit=10&country=US`);
  if (!res.ok) throw new Error(`iTunes ${res.status} for ${artist} – ${title}`);
  const { results } = await res.json();
  // Prefer the original studio album over live cuts and compilations.
  const want = norm(title);
  const hit =
    results.find((r) => norm(r.artistName) === norm(artist) && norm(r.trackName) === want && !/live|greatest|best of|hits/i.test(r.collectionName)) ??
    results.find((r) => norm(r.artistName) === norm(artist) && norm(r.trackName).startsWith(want.split(' ')[0])) ??
    results[0];
  if (!hit) throw new Error(`No match for ${artist} – ${title}`);
  const secs = Math.round(hit.trackTimeMillis / 1000);
  return {
    id: String(hit.trackId),
    title: hit.trackName,
    artist: hit.artistName,
    album: hit.collectionName,
    year: hit.releaseDate?.slice(0, 4) ?? '',
    genre: hit.primaryGenreName,
    duration: `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`,
    artwork: hit.artworkUrl100.replace('100x100bb', '1000x1000bb'),
    preview: hit.previewUrl ?? '',
    url: hit.trackViewUrl,
  };
}

const tracks = [];
for (const t of playlist.tracks) {
  const r = await resolve(t);
  console.log(`✓ ${r.artist} — ${r.title}  (${r.album}, ${r.year})`);
  tracks.push(r);
}

writeFileSync(
  out,
  JSON.stringify({ title: playlist.title, curator: playlist.curator, appleMusicUrl: playlist.appleMusicUrl, tracks }, null, 2) + '\n',
);
console.log(`wrote ${tracks.length} records → src/lib/data/music.json`);
