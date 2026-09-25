import { describe, expect, it } from 'vitest';
import { assertRollFileName, blobToBase64, lookMatchesPhoto, publishToGithub, RollSendError, tokenCanReadRoll } from './roll-send';

describe('assertRollFileName', () => {
  it('accepts a roll photo and its look', () => {
    expect(assertRollFileName('2026-09-25--soundcheck.webp', 'photo')).toBe('2026-09-25--soundcheck.webp');
    expect(assertRollFileName('2026-09-25--soundcheck.jpg', 'photo')).toBe('2026-09-25--soundcheck.jpg');
    expect(assertRollFileName('2026-09-25--soundcheck.json', 'look')).toBe('2026-09-25--soundcheck.json');
  });

  it('rejects paths and odd names', () => {
    expect(() => assertRollFileName('../secret.webp', 'photo')).toThrow(RollSendError);
    expect(() => assertRollFileName('src/lib/roll/2026-09-25--a.webp', 'photo')).toThrow(RollSendError);
    expect(() => assertRollFileName('2026-09-25--Soundcheck.webp', 'photo')).toThrow(RollSendError);
    expect(() => assertRollFileName('2026-09-25--soundcheck.txt', 'look')).toThrow(RollSendError);
  });
});

describe('lookMatchesPhoto', () => {
  it('pairs a sidecar with its photo', () => {
    expect(lookMatchesPhoto('2026-09-25--night.webp', '2026-09-25--night.json')).toBe(true);
    expect(lookMatchesPhoto('2026-09-25--night.webp', '2026-09-25--day.json')).toBe(false);
  });
});

describe('blobToBase64', () => {
  it('round-trips bytes', async () => {
    const blob = new Blob([Uint8Array.from([0, 255, 10])]);
    expect(await blobToBase64(blob)).toBe(btoa('\0ÿ\n'));
  });
});

function mockFetch(handler: (url: string, init?: RequestInit) => { status?: number; body?: unknown }): {
  fetch: typeof fetch;
  calls: { url: string; init?: RequestInit }[];
} {
  const calls: { url: string; init?: RequestInit }[] = [];
  const fetchImpl: typeof fetch = async (input, init) => {
    const url = String(input);
    calls.push({ url, init });
    const result = handler(url, init);
    const status = result.status ?? 200;
    return new Response(result.body === undefined ? '' : JSON.stringify(result.body), { status });
  };
  return { fetch: fetchImpl, calls };
}

describe('publishToGithub', () => {
  it('commits the photo and the look in one step', async () => {
    const { fetch: fetchImpl, calls } = mockFetch((url) => {
      if (url.endsWith('/git/ref/heads/main')) return { body: { object: { sha: 'parent' } } };
      if (url.endsWith('/git/commits/parent')) return { body: { tree: { sha: 'tree0' } } };
      if (url.endsWith('/git/blobs')) return { body: { sha: url.includes('unused') ? 'x' : `blob-${calls.length}` } };
      if (url.endsWith('/git/trees')) return { body: { sha: 'tree1' } };
      if (url.endsWith('/git/commits')) return { body: { sha: 'commit1' } };
      if (url.endsWith('/git/refs/heads/main')) return { body: { ref: 'refs/heads/main' } };
      return { status: 404, body: {} };
    });

    const sha = await publishToGithub(
      'token',
      { photoName: '2026-09-25--night.webp', photoBase64: 'abc', lookName: '2026-09-25--night.json', lookText: '{}\n' },
      fetchImpl,
    );
    expect(sha).toBe('commit1');

    const commit = calls.find((c) => c.url.endsWith('/git/commits') && c.init?.method === 'POST');
    const body = JSON.parse(String(commit?.init?.body)) as { message: string; parents: string[]; tree: string };
    expect(body.message).toBe('Add 2026-09-25--night.webp to the roll');
    expect(body.parents).toEqual(['parent']);
    expect(body.tree).toBe('tree1');

    const tree = calls.find((c) => c.url.endsWith('/git/trees'));
    const treeBody = JSON.parse(String(tree?.init?.body)) as { tree: { path: string }[] };
    expect(treeBody.tree.map((item) => item.path)).toEqual([
      'src/lib/roll/2026-09-25--night.webp',
      'src/lib/roll/2026-09-25--night.json',
    ]);

    const patch = calls.find((c) => c.init?.method === 'PATCH');
    expect(JSON.parse(String(patch?.init?.body))).toEqual({ sha: 'commit1' });
    expect(commit?.init?.headers).toMatchObject({ Authorization: 'Bearer token' });
  });

  it('turns a rejected token into a short error', async () => {
    const { fetch: fetchImpl } = mockFetch(() => ({ status: 401, body: { message: 'bad' } }));
    await expect(tokenCanReadRoll('nope', fetchImpl)).rejects.toThrow('GitHub rejected that token');
  });
});
