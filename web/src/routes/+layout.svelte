<script lang="ts">
  import type { Snippet } from 'svelte';
  import { asset } from '$app/paths';
  import { page } from '$app/state';
  import SiteHeader from '#lib/components/SiteHeader.svelte';
  import SiteFooter from '#lib/components/SiteFooter.svelte';
  import { pages } from '#lib/data/pages.ts';

  let { children }: { children: Snippet } = $props();
  const metadata = $derived(pages[page.route.id ?? ''] ?? pages['/']);

  $effect(() => {
    // The server supplies the initial body class; keep it in sync on client navigation.
    document.body.className = metadata.bodyClass;
  });
</script>

<svelte:head>
  <title>{metadata.title}</title>
  <meta name="description" content={metadata.description}>
  <link rel="canonical" href={metadata.canonical}>
  <link rel="icon" type="image/png" href={asset('assets/images/shared/favicon.png')}>
  <link rel="stylesheet" href={asset('assets/css/site.css')}>
</svelte:head>

<a class="skip-link" href="#main-content">Skip to main content</a>
<a class="skip-link skip-link--navigation" href="#primary-navigation">Skip to navigation</a>
<SiteHeader />
<main id="main-content" tabindex="-1">
  {@render children()}
</main>
{#if metadata.footer}
  <SiteFooter />
{/if}
