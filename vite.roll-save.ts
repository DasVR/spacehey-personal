import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Plugin } from 'vite';
import { assertRollFileName, lookMatchesPhoto } from './src/lib/utils/roll-send.ts';

const MAX = 12_000_000;

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let size = 0;
    req.on('data', (chunk: Buffer) => {
      size += chunk.length;
      if (size > MAX) {
        reject(new Error('too big'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function send(res: ServerResponse, status: number, body: unknown): void {
  res.statusCode = status;
  res.setHeader('content-type', 'application/json');
  res.end(JSON.stringify(body));
}

/** Dev-only: POST /roll/save writes the photo and look into src/lib/roll. */
export function rollSavePlugin(): Plugin {
  const rollDir = path.resolve('src/lib/roll');
  return {
    name: 'roll-save',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/roll/save', (req, res, next) => {
        if (req.method === 'GET') {
          send(res, 200, { ok: true });
          return;
        }
        if (req.method !== 'POST') {
          next();
          return;
        }
        readBody(req)
          .then(async (raw) => {
            const body = JSON.parse(raw) as { photoName?: string; photo?: string; lookName?: string; look?: string };
            if (!body.photoName || !body.photo) throw new Error('missing photo');
            const photoName = assertRollFileName(body.photoName, 'photo');
            const photoPath = path.resolve(rollDir, photoName);
            if (!photoPath.startsWith(rollDir + path.sep)) throw new Error('path');
            await mkdir(rollDir, { recursive: true });
            await writeFile(photoPath, Buffer.from(body.photo, 'base64'));
            if (body.lookName) {
              const lookName = assertRollFileName(body.lookName, 'look');
              if (!lookMatchesPhoto(photoName, lookName) || body.look == null) throw new Error('look');
              const lookPath = path.resolve(rollDir, lookName);
              if (!lookPath.startsWith(rollDir + path.sep)) throw new Error('path');
              await writeFile(lookPath, body.look);
            }
            send(res, 200, { ok: true });
          })
          .catch(() => send(res, 400, { ok: false }));
      });
    },
  };
}
