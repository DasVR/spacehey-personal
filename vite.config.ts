import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],
  define: {
    // Absolute origin for share embeds (Discord, iMessage, X need full URLs).
    // Origin + base path, e.g. https://dasvr.github.io/spacehey-personal.
    __SITE_URL__: JSON.stringify((process.env.SITE_ORIGIN ?? 'https://p.dasdev.net') + (process.env.BASE_PATH ?? '')),
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
  },
});
