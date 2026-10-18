<script lang="ts">
  import { onDestroy, tick, untrack } from 'svelte';
  import { asset } from '$app/paths';
  import type { Gallery } from '#lib/data/galleries.ts';

  let { id, gallery }: { id: string; gallery: Gallery } = $props();
  let activeIndex = $state<number>(untrack(() => gallery.featured));
  let changing = $state(false);
  let track: HTMLDivElement;
  let pointerStart: { x: number; y: number } | undefined;
  let changeTimer: ReturnType<typeof setTimeout> | undefined;
  const photo = $derived(gallery.photos[activeIndex]);

  onDestroy(() => clearTimeout(changeTimer));

  async function showPhoto(index: number, options: { scroll?: boolean; focus?: boolean } = {}) {
    activeIndex = (index + gallery.photos.length) % gallery.photos.length;
    changing = true;
    clearTimeout(changeTimer);
    changeTimer = setTimeout(() => { changing = false; }, 180);
    await tick();
    const thumbnail = track.querySelectorAll('button')[activeIndex];
    if (options.scroll !== false) {
      const left = thumbnail.offsetLeft - (track.clientWidth - thumbnail.offsetWidth) / 2;
      track.scrollTo({ left: Math.max(0, left), behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    }
    if (options.focus) thumbnail.focus();
  }

  function handleKeydown(event: KeyboardEvent, index: number) {
    const next = event.key === 'ArrowRight' ? index + 1
      : event.key === 'ArrowLeft' ? index - 1
      : event.key === 'Home' ? 0
      : event.key === 'End' ? gallery.photos.length - 1 : undefined;
    if (next === undefined) return;
    event.preventDefault();
    void showPhoto(next, { focus: true });
  }

  function startSwipe(event: PointerEvent) {
    if (!event.isPrimary || (event.target as Element).closest('button')) return;
    pointerStart = { x: event.clientX, y: event.clientY };
  }

  function endSwipe(event: PointerEvent) {
    if (!pointerStart) return;
    const distanceX = event.clientX - pointerStart.x;
    const distanceY = event.clientY - pointerStart.y;
    pointerStart = undefined;
    if (Math.abs(distanceX) >= 48 && Math.abs(distanceX) > Math.abs(distanceY) * 1.2) {
      void showPhoto(activeIndex + (distanceX < 0 ? 1 : -1));
    }
  }
</script>

<section class="event-showcase" aria-labelledby={`${id}-gallery-title`}>
  <div class="event-showcase__header">
    <h4 class="event-showcase__title" id={`${id}-gallery-title`}>Moments from the event</h4>
    <p class="event-showcase__status" id={`${id}-gallery-status`} aria-live="polite" aria-atomic="true">Photo {activeIndex + 1} of {gallery.photos.length}</p>
  </div>
  <div class="event-showcase__stage" class:is-changing={changing} aria-describedby={`${id}-gallery-status`} role="group" aria-label={`Photographs from ${gallery.title}`} onpointerdown={startSwipe} onpointerup={endSwipe} onpointercancel={() => { pointerStart = undefined; }}>
    <img class="event-showcase__backdrop" src={asset(photo.src)} width={photo.width || undefined} height={photo.height || undefined} alt="" loading="lazy" decoding="async" draggable="false" aria-hidden="true">
    <img class="event-showcase__image" id={`${id}-gallery-image`} src={asset(photo.src)} width={photo.width || undefined} height={photo.height || undefined} alt={photo.alt} loading="lazy" decoding="async" draggable="false">
    <button class="event-showcase__control event-showcase__control--previous" type="button" aria-label={`Previous photograph from ${gallery.title}`} aria-controls={`${id}-gallery-image`} onclick={() => showPhoto(activeIndex - 1)}><span aria-hidden="true">‹</span></button>
    <button class="event-showcase__control event-showcase__control--next" type="button" aria-label={`Next photograph from ${gallery.title}`} aria-controls={`${id}-gallery-image`} onclick={() => showPhoto(activeIndex + 1)}><span aria-hidden="true">›</span></button>
  </div>
  <div class="event-carousel__track" aria-label={`Choose a photograph from ${gallery.title}`} bind:this={track}>
    {#each gallery.photos as image, index}
      <figure class="event-carousel__item">
        <button class="event-carousel__thumbnail" type="button" aria-label={`Show photograph ${index + 1} of ${gallery.photos.length} from ${gallery.title}`} aria-controls={`${id}-gallery-image`} data-carousel-index={index} aria-current={index === activeIndex ? 'true' : undefined} tabindex={index === activeIndex ? 0 : -1} onclick={() => showPhoto(index, { scroll: false })} onkeydown={(event) => handleKeydown(event, index)}>
          <img class="event-carousel__thumbnail-image" src={asset(image.src)} width={image.width} height={image.height} alt="" loading="lazy" decoding="async" aria-hidden="true">
          <span class="event-carousel__number">{index + 1}</span>
        </button>
      </figure>
    {/each}
  </div>
</section>
