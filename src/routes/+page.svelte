<script lang="ts">
  import ContactCard from '$lib/components/ContactCard.svelte';
  import GiscusThread from '$lib/components/GiscusThread.svelte';
  import Guestbook from '$lib/components/Guestbook.svelte';
  import InterestPicker from '$lib/components/InterestPicker.svelte';
  import Roll from '$lib/components/Roll.svelte';
  import Section from '$lib/components/Section.svelte';
  import SiteFooter from '$lib/components/SiteFooter.svelte';
  import Split from '$lib/components/Split.svelte';
  import TopFriends from '$lib/components/TopFriends.svelte';
  import VinylCrate from '$lib/components/VinylCrate.svelte';
  import { app } from '$lib/app.svelte.ts';
  import music from '$lib/data/music.json';
  import { casual, identity } from '$lib/data/profile';
  import type { Crate } from '$lib/data/types';
  import { roll } from '$lib/roll';
  import { assetUrl } from '$lib/utils/urls';

  const crate = music as Crate;
  const giscusReady = Boolean(casual.giscus.repoId && casual.giscus.categoryId);
</script>

<svelte:head>
  <title>{identity.name} · {identity.host}</title>
  <meta name="description" content="{identity.name} — {casual.tagline}. Tap to save the contact." />
  <meta property="og:title" content="{identity.name} · {identity.host}" />
  <meta property="og:description" content={casual.tagline} />
  <meta property="og:image" content={assetUrl(identity.avatar.src)} />
</svelte:head>

<Split>
  {#snippet card()}
    <ContactCard
      mode="casual"
      {identity}
      headline={casual.tagline}
      status={casual.statuses[0]?.text ?? ''}
      statuses={casual.statuses}
      timezone={casual.timezone}
      links={casual.links}
      facts={[
        { label: 'Where', value: identity.location },
        { label: 'Last seen', value: casual.lastSeen },
      ]}
    />
  {/snippet}

  <Section index="01" title="About">
    <p class="about">{casual.about}</p>
  </Section>

  <Section index="02" title="The crate">
    {#snippet aside()}{crate.tracks.length} records · Apple Music{/snippet}
    <VinylCrate {crate} />
  </Section>

  <Section index="03" title="Roll">
    {#snippet aside()}{roll.length} photos · tap to open{/snippet}
    <Roll photos={roll} />
  </Section>

  <Section index="04" title="Interests">
    <InterestPicker groups={casual.interests} />
  </Section>

  <Section index="05" title="Top 8">
    <TopFriends friends={casual.friends} />
  </Section>

  <Section index="06" title="Guestbook">
    {#snippet aside()}{giscusReady ? 'signed in with GitHub' : `${app.guestbook.length} entries`}{/snippet}
    {#if giscusReady}
      <GiscusThread config={casual.giscus} />
    {:else}
      <Guestbook />
    {/if}
  </Section>

  <SiteFooter mode="casual" host={identity.host} since={casual.memberSince} />
</Split>

<style>
  .about {
    font-size: var(--t-lead);
    line-height: 1.6;
    color: var(--color-ink);
    text-wrap: pretty;
  }
</style>
