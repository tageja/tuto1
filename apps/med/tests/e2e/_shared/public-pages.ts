import { expect, type Page } from '@playwright/test';
import { VI_DIACRITICS, langToggle, mockPilotSpots, setLanguage } from './hcmute-home';

export { VI_DIACRITICS, langToggle, mockPilotSpots, setLanguage };

/** Assert the current document is not a Next.js or generic 404 page. */
export async function assertNot404(page: Page): Promise<void> {
  await expect(page.getByRole('heading', { name: /404|not found|không tìm thấy/i })).toHaveCount(0);
  const title = await page.title();
  expect(title).not.toMatch(/404/i);
}

/** Open survey form from splash (route intercept for POST should be registered before goto). */
async function clickSurveyStart(page: Page, name: RegExp): Promise<void> {
  const start = page.getByRole('main').getByRole('button', { name });
  await expect(start).toBeVisible({ timeout: 15_000 });
  await page.waitForTimeout(800);
  await start.click();
  await expect(surveyNextButton(page)).toBeVisible({ timeout: 30_000 });
}

export async function mockSurveySiteSettings(page: Page, slug: 'survey-hcmute' | 'survey-nurses') {
  await page.route(`**/api/site-settings/${slug}`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: { voucher_image_url: null, voucher_title: null, is_active: true },
      }),
    });
  });
}

export async function openHcmuteSurveyForm(page: Page): Promise<void> {
  await page.goto('/survey-hcmute', { waitUntil: 'domcontentloaded' });
  await clickSurveyStart(page, /start survey|bắt đầu khảo sát/i);
}

export async function openNurseSurveyForm(page: Page): Promise<void> {
  await page.goto('/survey-nurses', { waitUntil: 'domcontentloaded' });
  await clickSurveyStart(page, /^begin$|^bắt đầu$/i);
}

export function surveyNextButton(page: Page) {
  return page.getByRole('button', { name: /^next$|^tiếp theo$|^tiếp tục$|^continue$/i });
}

/** Set language via localStorage + reload (stable across all public pages). */
export async function setLanguageViaStorage(page: Page, lang: 'en' | 'vi') {
  await page.evaluate((l) => localStorage.setItem('nursed_lang', l), lang);
  await page.reload({ waitUntil: 'domcontentloaded' });
}

/** Required-field markers and disabled CTA block empty submission. */
export async function assertSurveyPersonalStepBlocksEmptySubmit(page: Page): Promise<void> {
  const next = surveyNextButton(page);
  await expect(next).toBeDisabled();
  await expect(page.getByText(/\*/).first()).toBeVisible();
}
