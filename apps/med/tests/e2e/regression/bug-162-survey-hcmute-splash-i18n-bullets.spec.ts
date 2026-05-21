import { expect, test } from '@playwright/test';
import { TAG, bugTag } from '../_shared/tags';
import { setLanguageViaStorage } from '../_shared/public-pages';

test.describe('Bug #162 — HCMUTE survey splash bullets respect EN/VI', {
  tag: [TAG.regression, TAG.publicPages, TAG.i18n, bugTag(162)],
}, () => {
  test('EN mode shows English bullet strings on splash', async ({ page }) => {
    await page.goto('/survey-hcmute', { waitUntil: 'domcontentloaded' });
    await setLanguageViaStorage(page, 'en');

    await expect(page.getByText(/takes about 5 minutes/i)).toBeVisible();
    await expect(page.getByText(/11 practical questions/i)).toBeVisible();
    await expect(page.getByText(/voucher after completing/i)).toBeVisible();
  });

  test('VI mode shows Vietnamese bullet strings on splash', async ({ page }) => {
    await page.goto('/survey-hcmute', { waitUntil: 'domcontentloaded' });
    await setLanguageViaStorage(page, 'vi');

    await expect(page.getByText(/chỉ mất khoảng 5 phút/i)).toBeVisible();
    await expect(page.getByText(/11 câu hỏi thực tế/i)).toBeVisible();
  });
});
