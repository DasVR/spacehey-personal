<script lang="ts">
  import ProfileTitle from '$lib/components/ProfileTitle.svelte';
  import ProfileHeader from '$lib/components/ProfileHeader.svelte';
  import SocialLinks from '$lib/components/SocialLinks.svelte';
  import ContactButtons from '$lib/components/ContactButtons.svelte';
  import Blurb from '$lib/components/Blurb.svelte';
  import InterestsTable from '$lib/components/InterestsTable.svelte';
  import WidgetGrid from '$lib/components/WidgetGrid.svelte';
  import PhotoScatter from '$lib/components/PhotoScatter.svelte';
  import PlaylistWidget from '$lib/components/PlaylistWidget.svelte';
  import BlinkieRow from '$lib/components/BlinkieRow.svelte';
  import FriendGrid from '$lib/components/FriendGrid.svelte';
  import Guestbook from '$lib/components/Guestbook.svelte';
  import ProfileFooter from '$lib/components/ProfileFooter.svelte';
  import { profileState } from '$lib/profile.svelte.ts';

  const data = $derived(profileState.data);
  const editLabel = $derived(profileState.editing ? '[done]' : '[edit]');
</script>

<main class="profile">
  <ProfileTitle name={data.displayName} barcode={data.barcode} />

  <div class="columns">
    <div class="col-left stack">
      <ProfileHeader
        src={data.avatar.src}
        alt={data.avatar.alt}
        mood={data.mood}
        lastLogin={data.lastLogin}
        location={data.location}
        username={data.username}
        tags={data.tags}
      />
      <SocialLinks links={data.socials} />
      <ContactButtons actions={data.contacts} />
    </div>
    <div class="col-right stack">
      <Blurb
        title="About me"
        body={data.about}
        editing={profileState.editing}
        onChange={(value) => profileState.setAbout(value)}
        actionLabel={editLabel}
        onAction={() => profileState.toggleEditing()}
      />
      <Blurb
        title="Who I'd like to meet"
        body={data.meet}
        editing={profileState.editing}
        onChange={(value) => profileState.setMeet(value)}
      />
      <WidgetGrid widgets={data.widgets} />
      <InterestsTable rows={data.interests} />
    </div>
  </div>

  <div class="stack rest">
    <PhotoScatter photos={data.photos} />
    <PlaylistWidget
      title={data.playlist.title}
      artist={data.playlist.artist}
      art={data.playlist.art}
      tracks={data.playlist.tracks}
    />
    <BlinkieRow blinkies={data.blinkies} />
    <FriendGrid friends={data.friends} />
    <Guestbook entries={data.guestbook} />
    <ProfileFooter count={profileState.visitorCount} memberSince={data.memberSince} />
  </div>
</main>

<style>
  .profile {
    display: grid;
    gap: var(--s-4);
  }

  .stack {
    display: grid;
    gap: var(--s-4);
    align-content: start;
  }

  .columns {
    display: grid;
    grid-template-columns: minmax(0, var(--left-col)) minmax(0, 1fr);
    gap: var(--s-4);
    align-items: start;
  }

  .rest {
    overflow: visible;
  }

  @media (max-width: 800px) {
    .columns {
      grid-template-columns: 1fr;
    }
  }
</style>
