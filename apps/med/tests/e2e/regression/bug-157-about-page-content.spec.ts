import { expect, test } from '@playwright/test';
import { TAG, bugTag } from '../_shared/tags';
import { VI_DIACRITICS, langToggle, setLanguage, setLanguageViaStorage } from '../_shared/public-pages';

test.describe('Bug #157 — /about loads with content and EN/VI toggle', {
  tag: [TAG.regression, TAG.publicPages, TAG.i18n, bugTag(157)],
}, () => {
  test('GET /about returns visible heading and paragraph', async ({ page }) => {
    const response = await page.goto('/about', { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBe(200);

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.locator('main p').first()).toBeVisible();
    await expect(page.getByRole('heading', { level: 2 }).first()).toBeVisible();
  });

  test('EN and VI toggles both change visible chrome', async ({ page }) => {
    await page.goto('/about', { waitUntil: 'domcontentloaded' });

    await setLanguageViaStorage(page, 'en');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/About tuto/i);
    const enMain = await page.locator('main').innerText();
    expect(VI_DIACRITICS.test(enMain)).toBe(false);

    await setLanguageViaStorage(page, 'vi');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Về tuto/i);
    const viMain = await page.locator('main').innerText();
    expect(VI_DIACRITICS.test(viMain)).toBe(true);

    await expect(langToggle(page)).toBeVisible();
  });
});
