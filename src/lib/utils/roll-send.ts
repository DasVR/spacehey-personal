/**
 * Send a prepared photo (and its look sidecar) onto the roll in one commit.
 * The token stays in the browser; this only writes under src/lib/roll.
 */

export const ROLL_REPO = {
  owner: 'DasVR',
  repo: 'spacehey-personal',
  branch: 'main',
  dir: 'src/lib/roll',
} as const;

const PHOTO_NAME = /^\d{4}-\d{2}-\d{2}--[a-z0-9]+(?:-[a-z0-9]+)*\.(webp|jpe?g|png)$/;
const LOOK_NAME = /^\d{4}-\d{2}-\d{2}--[a-z0-9]+(?:-[a-z0-9]+)*\.json$/;

export class RollSendError extends Error {
  readonly status: number | undefined;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'RollSendError';
    this.status = status;
  }
}

/** Reject anything that is not a roll file name. */
export function assertRollFileName(name: string, kind: 'photo' | 'look'): string {
  const ok = kind === 'photo' ? PHOTO_NAME.test(name) : LOOK_NAME.test(name);
  if (!ok || name.includes('/') || name.includes('\\') || name.includes('..')) {
    throw new RollSendError(kind === 'photo' ? 'That photo name is not a roll file' : 'That look name is not a roll file');
  }
  return name;
}

export function lookMatchesPhoto(photoName: string, lookName: string): boolean {
  return photoName.replace(/\.[^.]+$/, '') === lookName.replace(/\.[^.]+$/, '');
}

export async function blobToBase64(blob: Blob): Promise<string> {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

export interface RollPayload {
  photoName: string;
  photoBase64: string;
  lookName?: string;
  lookText?: string;
}

async function gh<T>(fetchImpl: typeof fetch, token: string, path: string, init?: RequestInit): Promise<T> {
  const res = await fetchImpl(`https://api.github.com${path}`, {
    ...init,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...init?.headers,
    },
  });
  const text = await res.text();
  if (!res.ok) throw new RollSendError(friendly(res.status), res.status);
  return (text ? JSON.parse(text) : undefined) as T;
}

function friendly(status: number): string {
  if (status === 401) return 'GitHub rejected that token';
  if (status === 403) return 'That token can’t write to the roll';
  if (status === 409) return 'The roll changed while sending — try again';
  return 'Couldn’t send to the roll';
}

/** Confirm the token can see the roll folder before we keep it. */
export async function tokenCanReadRoll(token: string, fetchImpl: typeof fetch = fetch): Promise<void> {
  await gh<unknown>(
    fetchImpl,
    token,
    `/repos/${ROLL_REPO.owner}/${ROLL_REPO.repo}/contents/${ROLL_REPO.dir}?ref=${ROLL_REPO.branch}`,
  );
}

/**
 * One commit: the photo, and the look sidecar when there is one.
 * Returns the new commit sha.
 */
export async function publishToGithub(token: string, files: RollPayload, fetchImpl: typeof fetch = fetch): Promise<string> {
  const photoName = assertRollFileName(files.photoName, 'photo');
  const lookName = files.lookName ? assertRollFileName(files.lookName, 'look') : undefined;
  if (lookName && !lookMatchesPhoto(photoName, lookName)) throw new RollSendError('The look doesn’t match the photo');
  if (lookName && files.lookText == null) throw new RollSendError('Missing look');

  const base = `/repos/${ROLL_REPO.owner}/${ROLL_REPO.repo}`;
  const ref = await gh<{ object: { sha: string } }>(fetchImpl, token, `${base}/git/ref/heads/${ROLL_REPO.branch}`);
  const parent = await gh<{ tree: { sha: string } }>(fetchImpl, token, `${base}/git/commits/${ref.object.sha}`);

  const photoBlob = await gh<{ sha: string }>(fetchImpl, token, `${base}/git/blobs`, {
    method: 'POST',
    body: JSON.stringify({ content: files.photoBase64, encoding: 'base64' }),
  });

  const tree: { path: string; mode: '100644'; type: 'blob'; sha: string }[] = [
    { path: `${ROLL_REPO.dir}/${photoName}`, mode: '100644', type: 'blob', sha: photoBlob.sha },
  ];

  if (lookName && files.lookText != null) {
    const lookBlob = await gh<{ sha: string }>(fetchImpl, token, `${base}/git/blobs`, {
      method: 'POST',
      body: JSON.stringify({ content: files.lookText, encoding: 'utf-8' }),
    });
    tree.push({ path: `${ROLL_REPO.dir}/${lookName}`, mode: '100644', type: 'blob', sha: lookBlob.sha });
  }

  const nextTree = await gh<{ sha: string }>(fetchImpl, token, `${base}/git/trees`, {
    method: 'POST',
    body: JSON.stringify({ base_tree: parent.tree.sha, tree }),
  });
  const commit = await gh<{ sha: string }>(fetchImpl, token, `${base}/git/commits`, {
    method: 'POST',
    body: JSON.stringify({
      message: `Add ${photoName} to the roll`,
      tree: nextTree.sha,
      parents: [ref.object.sha],
    }),
  });
  await gh<unknown>(fetchImpl, token, `${base}/git/refs/heads/${ROLL_REPO.branch}`, {
    method: 'PATCH',
    body: JSON.stringify({ sha: commit.sha }),
  });
  return commit.sha;
}
