import { expect, test } from '@playwright/test';
import { TAG, bugTag } from '../_shared/tags';
import { VI_DIACRITICS, langToggle, mockPilotSpots, setLanguage } from '../_shared/hcmute-home';

test.describe('Bug #150 — HCMUTE homepage i18n leakage', {
  tag: [TAG.regression, TAG.hcmute, TAG.i18n, bugTag(150)],
}, () => {
  test.beforeEach(async ({ page }) => {
    await mockPilotSpots(page, { taken: 0, total: 50, spotsLeft: 50, isFull: false });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
  });

  test('EN mode: main+footer chrome has no VI diacritics', async ({ page }) => {
    await setLanguage(page, 'en');
    const main = await page.locator('main').innerText();
    const footer = await page.locator('footer').innerText();
    const chrome = `${main}\n${footer}`;
    expect(VI_DIACRITICS.test(chrome)).toBe(false);
  });

  test('VI mode: future course section uses Vietnamese titles', async ({ page }) => {
    await setLanguage(page, 'vi');
    await expect(page.getByRole('heading', { name: /Tiếng Anh Công Sở/i })).toBeVisible();
  });

  test('toggle language while modal open updates modal labels', async ({ page }) => {
    await setLanguage(page, 'en');
    await page.getByRole('button', { name: /Register for HCMUTE Pilot/i }).first().click();
    await expect(page.getByText(/Register for pilot/i).first()).toBeVisible();

    await langToggle(page).evaluate((el) => (el as HTMLElement).click());
    await expect(page.getByText(/Đăng ký pilot/i).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /Gửi đăng ký/i })).toBeVisible();
  });
});
