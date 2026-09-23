<script lang="ts">
  import ContactCard from '$lib/components/ContactCard.svelte';
  import DefinitionList from '$lib/components/DefinitionList.svelte';
  import Guestbook from '$lib/components/Guestbook.svelte';
  import NowPlaying from '$lib/components/NowPlaying.svelte';
  import Roll from '$lib/components/Roll.svelte';
  import Section from '$lib/components/Section.svelte';
  import SiteFooter from '$lib/components/SiteFooter.svelte';
  import Split from '$lib/components/Split.svelte';
  import TopFriends from '$lib/components/TopFriends.svelte';
  import { app } from '$lib/app.svelte.ts';
  import { casual, identity } from '$lib/data/profile';
  import { assetUrl } from '$lib/utils/urls';
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
      status={casual.status}
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

  <Section index="02" title="Now playing">
    {#snippet aside()}{casual.playlist.tracks.length} tracks{/snippet}
    <NowPlaying {...casual.playlist} />
  </Section>

  <Section index="03" title="Roll">
    {#snippet aside()}press to develop{/snippet}
    <Roll photos={casual.roll} />
  </Section>

  <Section index="04" title="Interests">
    <DefinitionList rows={casual.interests} />
  </Section>

  <Section index="05" title="Top 8">
    <TopFriends friends={casual.friends} />
  </Section>

  <Section index="06" title="Guestbook">
    {#snippet aside()}{app.guestbook.length} entries{/snippet}
    <Guestbook />
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
