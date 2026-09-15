<script lang="ts">
  import InnerPage from '$lib/components/InnerPage.svelte';
  import { pageHref } from '$lib/utils/urls';
</script>

<InnerPage title="Blog">
  <p>
    The blog still lives in a drafts folder next to the mix CDs. When a post ships it will
    show up here in Trebuchet, with a date that looks like it was stamped by a library card.
  </p>
  <p><a href={pageHref('/')}>← back to the profile</a></p>
</InnerPage>
