import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

// GitHub Pages project URL is /spacehey-personal/. Empty for p.dasdev.net
// at the domain root. SvelteKit requires '' or a leading slash.
const rawBasePath = process.env.BASE_PATH ?? '';
if (rawBasePath !== '' && !rawBasePath.startsWith('/')) {
  throw new Error(`BASE_PATH must start with "/" or be empty, got: ${JSON.stringify(rawBasePath)}`);
}
/** @type {'' | `/${string}`} */
const basePath = /** @type {any} */ (rawBasePath);

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: undefined,
      precompress: false,
      strict: true,
    }),
    paths: {
      base: basePath,
    },
    alias: {
      $lib: './src/lib',
    },
  },
};

export default config;
