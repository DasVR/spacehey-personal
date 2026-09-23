<script lang="ts">
  import ContactCard from '$lib/components/ContactCard.svelte';
  import DitherImage from '$lib/components/DitherImage.svelte';
  import DefinitionList from '$lib/components/DefinitionList.svelte';
  import Guestbook from '$lib/components/Guestbook.svelte';
  import NowPlaying from '$lib/components/NowPlaying.svelte';
  import Roll from '$lib/components/Roll.svelte';
  import Panel from '$lib/components/Panel.svelte';
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

<Split wide>
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

  <!-- The mood board's MySpace boxes, rebuilt as a bento grid. -->
  <div class="bento">
    <Panel title="Blurbs" area="about" code="003 963">
      <div class="blurb">
        <h3>About me</h3>
        <p>{casual.about}</p>
      </div>
      <div class="blurb">
        <h3>Who I'd like to meet</h3>
        <p>{casual.meet}</p>
      </div>
    </Panel>

    <Panel title="Interests" area="interests">
      <DefinitionList rows={casual.interests} />
    </Panel>

    <Panel title="My Music" area="music" code="6663 02">
      {#snippet aside()}{casual.playlist.tracks.length} tracks{/snippet}
      <NowPlaying {...casual.playlist} />
    </Panel>

    <Panel title="{identity.name}'s Friend Space" area="friends">
      {#snippet aside()}
        <a class="add press" href={assetUrl('/das.vcf')} data-sveltekit-reload>Add as friend</a>
      {/snippet}
      <TopFriends friends={casual.friends} />
    </Panel>

    <Panel title="Roll" area="roll">
      {#snippet aside()}press to develop{/snippet}
      <Roll photos={casual.roll} />
    </Panel>

    <Panel title="Mood board" area="wall" code="8 865666">
      <div class="wall"><DitherImage src={casual.wall.src} alt={casual.wall.alt} cell={2} /></div>
    </Panel>

    <Panel title="Comments" area="book">
      {#snippet aside()}{app.guestbook.length} entries{/snippet}
      <Guestbook />
    </Panel>
  </div>

  <SiteFooter mode="casual" host={identity.host} since={casual.memberSince} />
</Split>

<style>
  .bento {
    --gutter: var(--s-4);
    display: grid;
    gap: var(--s-4);
    grid-template-columns: minmax(0, 1fr);
    grid-template-areas: 'about' 'music' 'interests' 'friends' 'roll' 'wall' 'book';
  }

  @media (min-width: 720px) {
    .bento {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      grid-template-areas:
        'about about'
        'interests music'
        'friends friends'
        'roll roll'
        'wall book';
    }
  }

  /* Laptops: three columns, My Music runs tall down the side like the original. */
  @media (min-width: 1180px) {
    .bento {
      grid-template-columns: repeat(3, minmax(0, 1fr));
      grid-template-areas:
        'about about interests'
        'friends friends music'
        'roll roll music'
        'book book wall';
    }
  }

  .blurb {
    display: grid;
    gap: var(--s-2);
  }

  .blurb:last-child {
    padding-bottom: var(--s-6);
  }

  .blurb h3 {
    font-family: var(--font-mono);
    font-size: var(--t-micro);
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--color-accent);
  }

  .blurb p {
    font-size: var(--t-lead);
    line-height: 1.6;
    text-wrap: pretty;
  }

  .add {
    display: inline-flex;
    align-items: center;
    height: 28px;
    padding-inline: var(--s-3);
    border-radius: 8px;
    font-family: var(--font-sans);
    font-size: var(--t-meta);
    font-weight: 600;
    color: var(--color-on-accent);
    background: var(--color-accent);
    text-decoration: none;
  }

  .wall {
    height: 100%;
    min-height: 360px;
    border-radius: 10px;
    overflow: hidden;
    outline: 1px solid var(--img-outline);
    outline-offset: -1px;
  }
</style>
