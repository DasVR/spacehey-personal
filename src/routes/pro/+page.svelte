<script lang="ts">
  import ChipList from '$lib/components/ChipList.svelte';
  import ContactCard from '$lib/components/ContactCard.svelte';
  import Icon from '$lib/components/Icon.svelte';
  import Section from '$lib/components/Section.svelte';
  import SiteFooter from '$lib/components/SiteFooter.svelte';
  import Split from '$lib/components/Split.svelte';
  import WorkList from '$lib/components/WorkList.svelte';
  import { identity, pro } from '$lib/data/profile';
  import { assetUrl } from '$lib/utils/urls';
</script>

<svelte:head>
  <title>{identity.name} — {pro.role}</title>
  <meta name="description" content="{identity.name}, {pro.role}. {pro.availability}." />
  <meta property="og:title" content="{identity.name} — {pro.role}" />
  <meta property="og:description" content={pro.summary} />
  <meta property="og:image" content={assetUrl(identity.avatar.src)} />
</svelte:head>

<Split>
  {#snippet card()}
    <ContactCard
      mode="pro"
      {identity}
      headline={pro.role}
      status={pro.availability}
      links={pro.links}
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

  <Section index="04" title="Contact">
    <a class="mail" href="mailto:{identity.email}">
      <span>{identity.email}</span>
      <Icon name="arrow" size={22} />
    </a>
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

  .mail {
    display: inline-flex;
    align-items: center;
    gap: var(--s-3);
    font-family: var(--font-serif);
    font-size: clamp(1.75rem, 7vw, 2.5rem);
    color: var(--color-ink);
    text-decoration: none;
    min-height: 44px;
    background: linear-gradient(currentColor, currentColor) 0 100% / 0 1px no-repeat;
    transition-property: background-size, color;
    transition-duration: 300ms;
    transition-timing-function: var(--ease-out);
  }

  .mail:hover {
    color: var(--color-accent);
    background-size: 100% 1px;
  }
</style>
