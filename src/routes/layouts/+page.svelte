<script lang="ts">
  import InnerPage from '$lib/components/InnerPage.svelte';
  import { pageHref } from '$lib/utils/urls';
</script>

<InnerPage title="Layouts">
  <p>
    Casual is this page: torn paper, grain, a flyer that would not survive the photocopier.
    Pro is the clean portfolio skin hiding behind the toggle — same data, different coat.
  </p>
  <p>
    A real customizer (edit the data, not the markup) is the next layer. The [edit] link on
    the profile is the first door.
  </p>
  <p><a href={pageHref('/')}>← back to the profile</a></p>
</InnerPage>
