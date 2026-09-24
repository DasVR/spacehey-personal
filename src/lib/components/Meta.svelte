<script lang="ts">
  import { identity } from '$lib/data/profile';

  interface Props {
    title: string;
    description: string;
    /** Route path, e.g. '/' or '/pro'. */
    path: string;
    /** Static image path, e.g. '/og/casual.png'. */
    image: string;
    imageAlt: string;
  }

  let { title, description, path, image, imageAlt }: Props = $props();

  const abs = (p: string) => `${__SITE_URL__}${p === '/' ? '/' : `${p.replace(/\/$/, '')}/`}`;
  const url = $derived(abs(path));
  const img = $derived(`${__SITE_URL__}${image}`);
</script>

<!-- Rich embeds for Discord, iMessage, Slack, X, etc. The embed colour comes from theme-color. -->
<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <link rel="canonical" href={url} />
  <meta property="og:type" content="profile" />
  <meta property="og:site_name" content="{identity.brand} · {identity.host}" />
  <meta property="og:url" content={url} />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:image" content={img} />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content={imageAlt} />
  <meta property="profile:first_name" content={identity.name} />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={title} />
  <meta name="twitter:description" content={description} />
  <meta name="twitter:image" content={img} />
</svelte:head>
