<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { afterNavigate } from '$app/navigation';
  import { asset, resolve } from '$app/paths';
  import { page } from '$app/state';

  const links = [
    { href: '/', key: 'home', title: 'Home' },
    { href: 'events/', key: 'events', title: 'Events' },
    { href: 'apply/', key: 'apply', title: 'Apply' },
    { href: 'contacts/', key: 'contacts', title: 'Contacts' },
    { href: 'statute/', key: 'statute', title: 'Statute' }
  ] as const;
  const articles = [
    { href: 'operation-pedestal/', key: 'operation-pedestal', title: 'Operation Pedestal' },
    { href: 'victory-day/', key: 'victory-day', title: 'Victory Day' },
    { href: 'remembrance-sunday/', key: 'remembrance-sunday', title: 'Remembrance Sunday' },
    { href: 'independence-day/', key: 'independence-day', title: 'Independence Day' }
  ] as const;
  let ready = $state(false);
  let isMobile = $state(false);
  let navOpen = $state(false);
  let articlesOpen = $state(false);
  let nav: HTMLElement;
  let toggle: HTMLButtonElement;
  let articleItem: HTMLLIElement;
  let articleToggle: HTMLButtonElement;
  let articleMenu: HTMLUListElement;
  const current = $derived(page.route.id === '/' ? 'home' : page.route.id?.slice(1));
  const currentSection = $derived(articles.some((article) => article.key === current));

  onMount(() => {
    const query = window.matchMedia('(max-width: 899px)');
    isMobile = query.matches;
    ready = true;
    const handleChange = () => {
      isMobile = query.matches;
      closeNav();
    };
    query.addEventListener('change', handleChange);
    return () => {
      query.removeEventListener('change', handleChange);
      document.body.classList.remove('nav-open');
    };
  });

  afterNavigate(() => closeNav());

  $effect(() => {
    document.body.classList.toggle('nav-open', navOpen);
  });

  function focusable(container: HTMLElement) {
    return Array.from(container.querySelectorAll<HTMLElement>('a[href], button, [tabindex]:not([tabindex="-1"])'))
      .filter((element) => !element.closest('[inert]') && element.getClientRects().length > 0);
  }

  function closeNav(restoreFocus = false) {
    navOpen = false;
    articlesOpen = false;
    if (restoreFocus) toggle?.focus();
  }

  async function focusMenu(menu: HTMLElement, last: boolean, isOpen: () => boolean) {
    await tick();
    // Wait for CSS visibility as well as Svelte's DOM update before moving focus.
    for (let frame = 0; frame < 20 && isOpen(); frame += 1) {
      if (!menu.inert && getComputedStyle(menu).visibility === 'visible') {
        const items = focusable(menu);
        const target = items[last ? items.length - 1 : 0];
        target?.focus();
        if (target && document.activeElement === target) return;
      }
      await new Promise<void>((done) => requestAnimationFrame(() => done()));
    }
  }

  async function toggleNav() {
    if (navOpen) return closeNav(true);
    if (!isMobile) return;
    navOpen = true;
    await focusMenu(nav, false, () => navOpen);
  }

  async function handleArticleTrigger(event: KeyboardEvent) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      articlesOpen = true;
      await focusMenu(articleMenu, event.key === 'ArrowUp', () => articlesOpen);
    } else if (event.key === 'Escape' && articlesOpen) {
      event.preventDefault();
      event.stopPropagation();
      articlesOpen = false;
    }
  }

  function handleArticleKeydown(event: KeyboardEvent) {
    const items = focusable(articleMenu);
    const index = items.indexOf(document.activeElement as HTMLElement);
    const next = event.key === 'ArrowDown' ? (index + 1) % items.length
      : event.key === 'ArrowUp' ? (index - 1 + items.length) % items.length
      : event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : undefined;
    if (next !== undefined) {
      event.preventDefault();
      items[next]?.focus();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      articlesOpen = false;
      articleToggle.focus();
    }
  }

  function handleDocumentClick(event: MouseEvent) {
    const target = event.target as Node;
    if (!articleItem?.contains(target)) articlesOpen = false;
    if (navOpen && !nav.contains(target) && !toggle.contains(target)) closeNav();
  }

  function handleDocumentKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      if (articlesOpen) {
        event.preventDefault();
        articlesOpen = false;
        articleToggle.focus();
      } else if (navOpen) {
        event.preventDefault();
        closeNav(true);
      }
    }
    if (event.key === 'Tab' && navOpen && isMobile) {
      const items = [toggle, ...focusable(nav)];
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  }
</script>

<svelte:document onclick={handleDocumentClick} onkeydown={handleDocumentKeydown} />

<header class="site-header">
  <div class="header-inner">
    <a class="site-logo" href={resolve('/')} aria-label="Malta Veterans Association home">
      <img src={asset('assets/images/shared/logo.png')} alt="Malta Veterans Association">
    </a>
    <button class="nav-toggle" type="button" aria-expanded={navOpen} aria-controls="primary-navigation" aria-label={navOpen ? 'Close navigation menu' : 'Open navigation menu'} onclick={toggleNav} bind:this={toggle}>
      <span class="nav-toggle-icon" aria-hidden="true"></span>
      <span class="visually-hidden">Open navigation</span>
    </button>
    <nav class="site-nav" class:is-open={navOpen} id="primary-navigation" aria-label="Primary navigation" aria-hidden={ready && isMobile ? !navOpen : undefined} inert={ready && isMobile && !navOpen} bind:this={nav}>
      <ul class="nav-list">
        {#each links as link}
          <li><a class="nav-link" data-nav={link.key} href={resolve(link.href)} aria-current={current === link.key ? 'page' : undefined} onclick={() => { if (isMobile) closeNav(); }}>{link.title}</a></li>
        {/each}
        <li class="has-dropdown" class:is-current-section={currentSection} class:is-open={articlesOpen} data-nav-section="articles" bind:this={articleItem}
          onpointerenter={(event) => { if (!isMobile && event.pointerType !== 'touch') articlesOpen = true; }}
          onpointerleave={(event) => { if (!isMobile && event.pointerType !== 'touch' && !articleItem.contains(document.activeElement)) articlesOpen = false; }}
          onfocusout={(event) => { if (!articleItem.contains(event.relatedTarget as Node)) articlesOpen = false; }}>
          <button class="nav-link dropdown-toggle" type="button" aria-haspopup="true" aria-expanded={articlesOpen} aria-controls="articles-menu" onclick={() => { articlesOpen = !articlesOpen; }} onkeydown={handleArticleTrigger} bind:this={articleToggle}>
            Articles
            <svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18"><path d="m7 10 5 5 5-5z" fill="currentColor" /></svg>
          </button>
          <ul class="dropdown" class:is-open={articlesOpen} id="articles-menu" aria-hidden={ready ? !articlesOpen : undefined} inert={ready && !articlesOpen} onkeydown={handleArticleKeydown} bind:this={articleMenu}>
            {#each articles as article}
              <li><a data-nav={article.key} href={resolve(article.href)} aria-current={current === article.key ? 'page' : undefined} onclick={() => closeNav()}>{article.title}</a></li>
            {/each}
          </ul>
        </li>
        <li><a class="nav-link" data-nav="language-policy" href={resolve('language-policy/')} aria-current={current === 'language-policy' ? 'page' : undefined} onclick={() => { if (isMobile) closeNav(); }}>Language Policy</a></li>
      </ul>
    </nav>
  </div>
</header>
