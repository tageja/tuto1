import type { Page } from '@playwright/test';

export const VI_DIACRITICS = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;

export type PilotSpotsPayload = {
  taken: number;
  total: number;
  spotsLeft: number;
  isFull: boolean;
};

export function pilotSpotsResponse(data: PilotSpotsPayload) {
  return {
    success: true,
    data,
  };
}

export async function mockPilotSpots(page: Page, data: PilotSpotsPayload) {
  await page.route('**/api/pilot-spots', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(pilotSpotsResponse(data)),
    });
  });
}

export async function mockPilotSpotsDelay(page: Page, data: PilotSpotsPayload, delayMs: number) {
  await page.route('**/api/pilot-spots', async (route) => {
    await new Promise((r) => setTimeout(r, delayMs));
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(pilotSpotsResponse(data)),
    });
  });
}

export async function mockPilotSpots500(page: Page) {
  await page.route('**/api/pilot-spots', async (route) => {
    await route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ success: false, error: 'server error' }),
    });
  });
}

export function langToggle(page: Page) {
  return page.getByRole('button', { name: /^en\s*\|\s*vi$/i });
}

export async function setLanguage(page: Page, lang: 'en' | 'vi') {
  const toggle = langToggle(page);
  for (let i = 0; i < 4; i += 1) {
    const body = (await page.locator('body').innerText()) ?? '';
    const looksEn = /Choose your English path/i.test(body) || /Register for HCMUTE Pilot/i.test(body);
    const looksVi = VI_DIACRITICS.test(body) && /Chọn lộ trình|Đăng ký pilot/i.test(body);
    if (lang === 'en' && looksEn) return;
    if (lang === 'vi' && looksVi) return;
    await toggle.click();
    await page.waitForTimeout(300);
  }
}

export function heroScarcityBadge(page: Page) {
  return page.locator('section').first().getByRole('button').filter({ hasText: /🔥|spots|suất|taken|full/i });
}

export function heroPilotCta(page: Page) {
  return page.getByRole('button', { name: /Register for HCMUTE Pilot|Đăng ký pilot HCMUTE|Registration closed|Đã đóng đăng ký/i }).first();
}

export async function openEnrollmentViaHeroCta(page: Page) {
  await setLanguage(page, 'en');
  await heroPilotCta(page).click();
  await enrollmentModal(page).waitFor({ state: 'visible', timeout: 15_000 });
}

export function enrollmentModal(page: Page) {
  return page.locator('.fixed.inset-0').filter({ has: page.getByRole('button', { name: /Submit registration|Gửi đăng ký/i }) });
}
