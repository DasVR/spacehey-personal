<script lang="ts">
  import Meta from '$lib/components/Meta.svelte';
  import ContactCard from '$lib/components/ContactCard.svelte';
  import GiscusThread from '$lib/components/GiscusThread.svelte';
  import Guestbook from '$lib/components/Guestbook.svelte';
  import InterestBoard from '$lib/components/InterestBoard.svelte';
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

  const crate = music as Crate;
  const giscusReady = Boolean(casual.giscus.repoId && casual.giscus.categoryId);
</script>

<Meta
  title="{identity.name} · {identity.host}"
  description="{casual.tagline}. Tap to save the contact, flip the card, dig the crate."
  path="/"
  image="/og/casual.png"
  imageAlt="{identity.name}'s tap card"
/>

<Split>
  {#snippet card()}
    <ContactCard
      mode="casual"
      {identity}
      headline={casual.tagline}
      status={casual.statuses[0]?.text ?? ''}
      statuses={casual.statuses}
      timezone={casual.timezone}
      about={casual.about}
      memberSince={casual.memberSince}
      links={casual.links}
      facts={[
        { label: 'Where', value: identity.location },
        { label: 'Last seen', value: casual.lastSeen },
      ]}
    />
  {/snippet}

  <Section index="01" title="The crate">
    {#snippet aside()}{crate.tracks.length} records · Apple Music{/snippet}
    <VinylCrate {crate} />
  </Section>

  <Section index="02" title="Roll">
    {#snippet aside()}{roll.length} photos · tap to open{/snippet}
    <Roll photos={roll} />
  </Section>

  <Section index="03" title="Interests">
    <InterestBoard groups={casual.interests} />
  </Section>

  <Section index="04" title="Top 8">
    <TopFriends friends={casual.friends} />
  </Section>

  <Section index="05" title="Guestbook">
    {#snippet aside()}{giscusReady ? 'signed in with GitHub' : `${app.guestbook.length} entries`}{/snippet}
    {#if giscusReady}
      <GiscusThread config={casual.giscus} />
    {:else}
      <Guestbook />
    {/if}
  </Section>

  <SiteFooter mode="casual" host={identity.host} since={casual.memberSince} />
</Split>
