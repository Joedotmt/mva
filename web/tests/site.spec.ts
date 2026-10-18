import { expect, test } from '@playwright/test';
import { pages } from '../src/lib/data/pages.ts';
import { galleries } from '../src/lib/data/galleries.ts';

test.beforeEach(async ({ page }) => {
  // Embedded videos remain in the document; avoid depending on third-party playback in tests.
  await page.route('https://www.youtube-nocookie.com/**', (route) => route.fulfill({ body: '' }));
});

for (const [route, metadata] of Object.entries(pages)) {
  test(`direct load: ${route}`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    const response = await page.goto(route === '/' ? './' : `${route.slice(1)}/`);
    expect(response?.status()).toBe(200);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page).toHaveTitle(metadata.title);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', metadata.canonical);
    await expect(page.locator('body')).toHaveClass(new RegExp(metadata.bodyClass));
    await expect(page.locator('.site-footer')).toHaveCount(metadata.footer ? 1 : 0);
    // Wait for hydration before checking browser errors and loaded local images.
    await expect(page.locator('.dropdown-toggle')).toHaveAttribute('aria-expanded', 'false');
    await page.evaluate(() => document.fonts.ready);
    const broken = await page.locator('img:not([loading="lazy"])').evaluateAll((images) =>
      images.filter((image) => !(image as HTMLImageElement).complete || !(image as HTMLImageElement).naturalWidth).map((image) => (image as HTMLImageElement).src));
    expect(broken).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    expect(errors).toEqual([]);
  });
}

for (const route of ['./', 'contacts/']) {
  test(`language tabs after navigation: ${route}`, async ({ page, isMobile }) => {
    await page.goto('apply/');
    if (isMobile) await page.getByRole('button', { name: 'Open navigation menu' }).click();
    await page.locator(`[data-nav="${route === './' ? 'home' : 'contacts'}"]`).click();
    const english = page.getByRole('tab', { name: 'English' });
    const maltese = page.getByRole('tab', { name: 'Malti' });
    await expect(english).toBeVisible();
    await maltese.click();
    await expect(maltese).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('#barracks-panel-mt')).toBeVisible();
    await expect(page.locator('#barracks-panel-en')).toBeHidden();
    await maltese.press('ArrowRight');
    await expect(english).toBeFocused();
    await expect(english).toHaveAttribute('aria-selected', 'true');
    await english.press('End');
    await expect(maltese).toBeFocused();
    await maltese.press('Home');
    await expect(english).toBeFocused();
  });
}

test('navigation keyboard controls and current article', async ({ page, isMobile }) => {
  await page.goto('./');
  await expect(page.getByRole('tab', { name: 'English' })).toBeVisible();
  const nav = page.locator('.site-nav');
  const toggle = page.locator('.nav-toggle');
  if (isMobile) {
    await expect(nav).toHaveAttribute('inert', '');
    await toggle.click();
    await expect(page.locator('[data-nav="home"]')).toBeFocused();
    await toggle.focus();
    await page.keyboard.press('Shift+Tab');
    await expect(page.locator('[data-nav="language-policy"]')).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(toggle).toBeFocused();
  }
  const articles = page.getByRole('button', { name: 'Articles' });
  await articles.focus();
  await articles.press('ArrowDown');
  await expect(page.locator('[data-nav="operation-pedestal"]')).toBeFocused();
  await page.keyboard.press('End');
  await expect(page.locator('[data-nav="independence-day"]')).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(page.locator('[data-nav="operation-pedestal"]')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(articles).toBeFocused();
  await expect(articles).toHaveAttribute('aria-expanded', 'false');
  await articles.press('ArrowDown');
  await page.locator('[data-nav="victory-day"]').click();
  await expect(page.locator('body')).toHaveClass('page-victory-day');
  await expect(page.locator('[data-nav="victory-day"]')).toHaveAttribute('aria-current', 'page');
  await expect(page.locator('.has-dropdown')).toHaveClass(/is-current-section/);
  if (isMobile) {
    await expect(nav).toHaveAttribute('inert', '');
    await toggle.click();
    await page.keyboard.press('Escape');
    await expect(toggle).toBeFocused();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  }
});

test('all event galleries preserve featured images and support keyboard, buttons and swipes', async ({ page, isMobile }) => {
  await page.goto('./');
  if (isMobile) await page.getByRole('button', { name: 'Open navigation menu' }).click();
  await page.locator('[data-nav="events"]').click();
  await expect(page.locator('.event-showcase')).toHaveCount(Object.keys(galleries).length);
  for (const [id, gallery] of Object.entries(galleries)) {
    const section = page.locator(`.event-entry[aria-labelledby="${id}"]`);
    await expect(section.locator('.event-showcase__status')).toHaveText(`Photo ${gallery.featured + 1} of ${gallery.photos.length}`);
    await expect(section.locator('.event-showcase__image')).toHaveAttribute('src', new RegExp(gallery.photos[gallery.featured]!.src.split('/').pop()!));
  }
  const section = page.locator('.event-entry[aria-labelledby="event-11-june-2026"]');
  const status = section.locator('.event-showcase__status');
  await section.getByRole('button', { name: 'Next photograph from 11 June 2026', exact: true }).click();
  await expect(status).toHaveText('Photo 4 of 6');
  await section.getByRole('button', { name: 'Previous photograph from 11 June 2026', exact: true }).click();
  await expect(status).toHaveText('Photo 3 of 6');
  const thumbnails = section.locator('.event-carousel__thumbnail');
  await thumbnails.nth(2).focus();
  await page.keyboard.press('End');
  await expect(status).toHaveText('Photo 6 of 6');
  await page.keyboard.press('ArrowRight');
  await expect(status).toHaveText('Photo 1 of 6');
  await expect(thumbnails.first()).toBeFocused();
  await page.keyboard.press('ArrowLeft');
  await expect(status).toHaveText('Photo 6 of 6');
  await page.keyboard.press('Home');
  await expect(status).toHaveText('Photo 1 of 6');
  const stage = section.locator('.event-showcase__stage');
  await stage.dispatchEvent('pointerdown', { clientX: 200, clientY: 100, isPrimary: true });
  await stage.dispatchEvent('pointerup', { clientX: 100, clientY: 100, isPrimary: true });
  await expect(status).toHaveText('Photo 2 of 6');
});

test('client navigation restores page styling, footer and tabs after browser history', async ({ page, isMobile }) => {
  await page.goto('./');
  if (isMobile) await page.getByRole('button', { name: 'Open navigation menu' }).click();
  await page.locator('[data-nav="statute"]').click();
  await expect(page.locator('body')).toHaveClass('page-statute no-hero statute-page');
  await expect(page.locator('.site-footer')).toHaveCount(0);
  if (isMobile) await page.getByRole('button', { name: 'Open navigation menu' }).click();
  await page.locator('[data-nav="contacts"]').click();
  await expect(page.locator('body')).toHaveClass('page-contacts');
  await expect(page.locator('.site-footer')).toHaveCount(1);
  await expect(page.getByRole('tab', { name: 'English' })).toBeVisible();
  await page.goBack();
  await expect(page.locator('body')).toHaveClass('page-statute no-hero statute-page');
  await page.goForward();
  await expect(page.locator('body')).toHaveClass('page-contacts');
  await page.getByRole('tab', { name: 'Malti' }).click();
  await expect(page.locator('#barracks-panel-mt')).toBeVisible();
});

test('downloads, application and donation destinations are preserved', async ({ page, request }) => {
  await page.goto('branding/');
  for (const link of await page.locator('a[download]').all()) {
    const href = await link.evaluate((element) => (element as HTMLAnchorElement).href);
    const response = await request.get(href);
    expect(response.status()).toBe(200);
    expect((await response.body()).length).toBeGreaterThan(100);
  }
  await page.goto('apply/');
  await expect(page.getByRole('link', { name: 'Open online form' })).toHaveAttribute('href', 'https://forms.gle/JWXfgp1MwuoHGi8UA');
  await page.goto('./');
  await expect(page.getByRole('link', { name: 'Donate', exact: true })).toHaveAttribute('href', 'https://revolut.me/maltav');
});

test('content and navigation remain available without JavaScript', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto(baseURL!);
  await expect(page.locator('h1')).toHaveText('Malta Veterans Association');
  await expect(page.locator('[data-nav="events"]')).toBeVisible();
  await expect(page.locator('#barracks-panel-en')).toBeVisible();
  await expect(page.locator('#barracks-panel-mt')).toBeVisible();
  await page.locator('[data-nav="statute"]').click();
  await expect(page.locator('body')).toHaveClass('page-statute no-hero statute-page');
  await context.close();
});
