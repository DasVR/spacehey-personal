<script lang="ts">
  import InnerPage from '$lib/components/InnerPage.svelte';
  import FriendGrid from '$lib/components/FriendGrid.svelte';
  import { profileState } from '$lib/profile.svelte.ts';
</script>

<InnerPage title="Friends">
  <p>The whole list, not just the ones who made the top eight this week.</p>
  <FriendGrid friends={profileState.data.friends} title="all friends" />
</InnerPage>
