import { expect, test } from '@playwright/test';
import { TAG, bugTag } from '../_shared/tags';
import { VI_DIACRITICS, mockPilotSpots, setLanguageViaStorage } from '../_shared/public-pages';

test.describe('Bug #161 — language choice persists across public page navigation', {
  tag: [TAG.regression, TAG.publicPages, TAG.i18n, bugTag(161)],
}, () => {
  test.beforeEach(async ({ page }) => {
    await mockPilotSpots(page, { taken: 0, total: 50, spotsLeft: 50, isFull: false });
  });

  test('EN on / stays EN on /about and back on /', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await setLanguageViaStorage(page, 'en');

    await page.goto('/about', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/About tuto/i);
    const aboutMain = await page.locator('main').innerText();
    expect(VI_DIACRITICS.test(aboutMain), `VI on /about in EN mode:\n${aboutMain.slice(0, 300)}`).toBe(false);

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Choose your English path/i);
    const homeMain = await page.locator('main').innerText();
    expect(VI_DIACRITICS.test(homeMain), `VI on / after return:\n${homeMain.slice(0, 300)}`).toBe(false);
  });
});
