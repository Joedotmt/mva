import type { Handle } from '@sveltejs/kit/hooks';
import { pages } from '#lib/data/pages.ts';

export const handle: Handle = ({ event, resolve }) =>
  resolve(event, {
    transformPageChunk: ({ html }) =>
      html.replace('%mva.body_class%', pages[event.route.id ?? '']?.bodyClass ?? '')
  });
