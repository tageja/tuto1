import { expect, test } from '@playwright/test';
import { TAG, bugTag } from '../_shared/tags';
import {
  VI_DIACRITICS,
  mockPilotSpots,
  setLanguage,
} from '../_shared/hcmute-home';

test.describe('Bug #138 — HCMUTE homepage language toggle EN ↔ VI', {
  tag: [TAG.regression, TAG.hcmute, TAG.i18n, bugTag(138)],
}, () => {
  test.beforeEach(async ({ page }) => {
    await mockPilotSpots(page, { taken: 5, total: 50, spotsLeft: 45, isFull: false });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
  });

  test('EN mode shows English hero, future section, footer Platform, scarcity and modal', async ({ page }) => {
    await setLanguage(page, 'en');

    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Choose your English path/i);
    await expect(page.getByText(/English for real professional situations/i).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /Register for HCMUTE Pilot/i }).first()).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: /Vote by registering your interest/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Platform' })).toBeVisible();
    await expect(page.getByRole('button', { name: /45 spots left/i })).toBeVisible();

    await page.getByRole('button', { name: /Register for HCMUTE Pilot/i }).first().click();
    await expect(page.getByText(/Register for pilot/i).first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Close' })).toBeVisible();
    await page.getByRole('button', { name: 'Close' }).click();
  });

  test('VI mode shows multiple Vietnamese strings', async ({ page }) => {
    await setLanguage(page, 'vi');

    const body = await page.locator('body').innerText();
    expect(VI_DIACRITICS.test(body)).toBe(true);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Chọn lộ trình/i);
    await expect(page.getByRole('heading', { name: 'Nền tảng' })).toBeVisible();
    await expect(page.getByRole('link', { name: /Điều dưỡng Cấp cứu/i })).toBeVisible();
  });

  test('toggle back to EN removes VI diacritics from main page chrome', async ({ page }) => {
    await setLanguage(page, 'vi');
    await setLanguage(page, 'en');

    const mainText = await page.locator('main').innerText();
    const footerText = await page.locator('footer').innerText();
    const chrome = `${mainText}\n${footerText}`;
    expect(VI_DIACRITICS.test(chrome), `VI leakage in EN mode:\n${chrome.slice(0, 400)}`).toBe(false);
  });

  test('footer course sub-links switch under VI', async ({ page }) => {
    await setLanguage(page, 'vi');
    await expect(page.getByRole('link', { name: /Điều dưỡng Cấp cứu/i })).toBeVisible();
    await setLanguage(page, 'en');
    await expect(
      page.locator('footer').getByRole('link', { name: 'Emergency Nursing', exact: true }),
    ).toBeVisible();
  });
});
