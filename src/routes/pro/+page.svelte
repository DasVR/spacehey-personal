<script lang="ts">
  import Meta from '$lib/components/Meta.svelte';
  import ChipList from '$lib/components/ChipList.svelte';
  import ContactCard from '$lib/components/ContactCard.svelte';
  import ProjectComposer from '$lib/components/ProjectComposer.svelte';
  import Section from '$lib/components/Section.svelte';
  import SiteFooter from '$lib/components/SiteFooter.svelte';
  import Split from '$lib/components/Split.svelte';
  import WorkList from '$lib/components/WorkList.svelte';
  import { casual, identity, pro } from '$lib/data/profile';
</script>

<Meta
  title="{identity.name} — {pro.role}"
  description="{pro.availability}. {pro.summary}"
  path="/pro"
  image="/og/pro.png"
  imageAlt="{identity.name}, {pro.role}"
/>

<Split>
  {#snippet card()}
    <ContactCard
      mode="pro"
      {identity}
      headline={pro.role}
      status={pro.availability}
      links={pro.links}
      timezone={casual.timezone}
      facts={[
        { label: 'Based', value: identity.location },
        { label: 'Studio', value: identity.brand },
      ]}
    />
  {/snippet}

  <section class="lede" aria-label="Summary">
    <p>{pro.summary}</p>
  </section>

  <Section index="01" title="Selected work">
    <WorkList items={pro.work} />
  </Section>

  <Section index="02" title="What I do">
    <ChipList items={pro.capabilities} />
  </Section>

  <Section index="03" title="Tools">
    <ChipList items={pro.stack} />
  </Section>

  <Section index="04" title="Start a project">
    <ProjectComposer email={identity.email} types={pro.projectTypes} />
  </Section>

  <SiteFooter mode="pro" host={identity.host} />
</Split>

<style>
  .lede p {
    font-family: var(--font-serif);
    font-size: clamp(1.625rem, 4.5vw, 2.125rem);
    line-height: 1.2;
    letter-spacing: -0.01em;
    color: var(--color-ink);
    text-wrap: pretty;
  }
</style>
