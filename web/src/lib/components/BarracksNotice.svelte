<script lang="ts">
  import { onMount } from 'svelte';

  let enhanced = $state(false);
  let selected = $state(0);
  let tabs: HTMLDivElement;

  onMount(() => { enhanced = true; });

  function handleKeydown(event: KeyboardEvent, index: number) {
    const next = event.key === 'ArrowRight' ? (index + 1) % 2
      : event.key === 'ArrowLeft' ? (index + 1) % 2
      : event.key === 'Home' ? 0
      : event.key === 'End' ? 1 : undefined;
    if (next === undefined) return;
    event.preventDefault();
    selected = next;
    tabs.querySelectorAll('button')[next].focus();
  }
</script>

<article class="member-notice" aria-labelledby="barracks-notice-title" data-language-tabs>
  <h3 id="barracks-notice-title">Visiting Luqa Barracks by car</h3>
  <div class="language-tabs" data-tab-list aria-label="Announcement language" role="tablist" hidden={!enhanced} bind:this={tabs}>
    <button type="button" id="barracks-tab-en" data-language-tab aria-controls="barracks-panel-en" lang="en" role="tab" aria-selected={selected === 0} tabindex={selected === 0 ? 0 : -1} onclick={() => { selected = 0; }} onkeydown={(event) => handleKeydown(event, 0)}>English</button>
    <button type="button" id="barracks-tab-mt" data-language-tab aria-controls="barracks-panel-mt" lang="mt" role="tab" aria-selected={selected === 1} tabindex={selected === 1 ? 0 : -1} onclick={() => { selected = 1; }} onkeydown={(event) => handleKeydown(event, 1)}>Malti</button>
  </div>
  <div class="language-panel prose" id="barracks-panel-en" data-language-panel lang="en" role="tabpanel" aria-labelledby="barracks-tab-en" tabindex="0" hidden={enhanced && selected !== 0}>
    <p>Dear members,</p>
    <p>As you well know and emphasised on is the fact that everyone needs to inform us a day before entering Luqa Barracks by car. For us to help you get access to our office you need to give us the licence plate number, type of car, and colour.</p>
    <p>Thank you all for your cooperation.</p>
  </div>
  <div class="language-panel prose" id="barracks-panel-mt" data-language-panel lang="mt" role="tabpanel" aria-labelledby="barracks-tab-mt" tabindex="0" hidden={enhanced && selected !== 1}>
    <p>Għażież membri,</p>
    <p>Bħal ma tafu u enfasizzajna il-fatt hu li kulhadd irrid jinfurmana ġurnata qabel tiġu u tidħlu ġewwa Luqa Barracks bil-karozza tagħkhom. Sabiex aħna ngħinukhom iġġibu aċċess għal offiċju tridu ttuna in-numru, t-tip, u l-għamla tal-karozza.</p>
    <p>Nirringrazzjakhom tal-kooperazzjoni.</p>
  </div>
</article>
