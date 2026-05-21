import { expect, test } from '@playwright/test';
import { TAG, bugTag } from '../_shared/tags';
import { mockPilotSpots500 } from '../_shared/hcmute-home';

test.describe('Bug #146 — HCMUTE pilot-spots 500 fallback', {
  tag: [TAG.regression, TAG.hcmute, TAG.data, bugTag(146)],
}, () => {
  test('page renders when pilot-spots returns 500', async ({ page }) => {
    await mockPilotSpots500(page);
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.locator('body')).toBeVisible();
    await expect(page.getByRole('button', { name: /Register for HCMUTE Pilot|Đăng ký pilot HCMUTE/i }).first()).toBeVisible();
  });
});
