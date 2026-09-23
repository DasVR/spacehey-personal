import { vcardResponse } from '$lib/server/contact';

export const prerender = true;
export const trailingSlash = 'never';

export function GET(): Response {
  return vcardResponse('pro');
}
