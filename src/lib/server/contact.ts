import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { casual, identity, pro } from '$lib/data/profile';
import type { ContactCard, Mode } from '$lib/data/types';
import { buildVCard } from '$lib/utils/vcard';

function avatar(): ContactCard['photo'] {
  try {
    const file = readFileSync(resolve('static', identity.avatar.src.replace(/^\//, '')));
    return { mime: 'JPEG', base64: file.toString('base64') };
  } catch {
    return undefined;
  }
}

function card(mode: Mode): ContactCard {
  const origin = `https://${identity.host}`;
  switch (mode) {
    case 'casual':
      return {
        mode,
        name: identity.name,
        nickname: identity.handle,
        email: identity.email,
        url: `${origin}/`,
        location: identity.location,
        note: `${casual.tagline}. Saved from a tap on ${identity.host}.`,
        socials: casual.links
          .filter((l) => l.icon !== 'globe')
          .map((l) => ({ type: l.label.toLowerCase(), url: l.href })),
        photo: avatar(),
      };
    case 'pro':
      return {
        mode,
        name: identity.name,
        nickname: identity.handle,
        title: pro.role,
        org: identity.brand,
        email: identity.email,
        url: `${origin}/pro/`,
        location: identity.location,
        note: `${pro.availability}. Saved from ${identity.host}/pro.`,
        socials: [{ type: 'github', url: 'https://github.com/DasVR' }],
        photo: avatar(),
      };
    default: {
      const _never: never = mode;
      return _never;
    }
  }
}

export function vcardResponse(mode: Mode): Response {
  return new Response(buildVCard(card(mode)), {
    headers: {
      'content-type': 'text/vcard; charset=utf-8',
      'content-disposition': `inline; filename="${mode === 'pro' ? 'das-pro' : 'das'}.vcf"`,
    },
  });
}
