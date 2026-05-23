import { expect, test } from '@playwright/test';
import { learnerAuthFile } from '../_shared/learner-pages';
import {
  CREATOR_APPLICATIONS_API,
  creatorApplicationForm,
  creatorSubmitButton,
  fillCreatorApplicationForm,
  gotoBecomeCreator,
  skipIfBecomeCreatorRequiresLogin,
} from '../_shared/studio-pages';
import { TAG, bugTag } from '../_shared/tags';

test.describe('Bug #209 — /become-creator application submit API handling', {
  tag: [TAG.regression, TAG.studio, bugTag(209)],
}, () => {
  test.use({ storageState: learnerAuthFile });

  test('shows success UI when POST succeeds and error when POST fails', async ({ page }) => {
    await page.route(CREATOR_APPLICATIONS_API, async (route) => {
      if (route.request().method() !== 'POST') {
        await route.continue();
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });

    await gotoBecomeCreator(page);
    await skipIfBecomeCreatorRequiresLogin(page, 'learner auth file expired — run global setup');
    await fillCreatorApplicationForm(page);

    const successHeading = page.getByRole('heading', {
      name: /application submitted|đã gửi đăng ký/i,
    });
    await Promise.all([
      page.waitForResponse(
        (res) =>
          res.request().method() === 'POST' &&
          /\/api\/creator-applications/.test(res.url()),
      ),
      creatorApplicationForm(page).evaluate((form) => {
        (form as HTMLFormElement).requestSubmit();
      }),
    ]);

    const successPanel = page.locator('.text-center.py-10').filter({ has: successHeading });
    await expect(successPanel.locator('svg.text-success').first()).toBeVisible({ timeout: 15_000 });
    await expect(successHeading).toBeVisible();
    await expect(page.getByText(/super admin will review|super admin sẽ xem xét/i)).toBeVisible();

    await page.unroute(CREATOR_APPLICATIONS_API);
    await page.route(CREATOR_APPLICATIONS_API, async (route) => {
      if (route.request().method() !== 'POST') {
        await route.continue();
        return;
      }
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal error' }),
      });
    });

    await page.reload({ waitUntil: 'domcontentloaded' });
    await skipIfBecomeCreatorRequiresLogin(page, 'learner auth file expired after reload');
    await fillCreatorApplicationForm(page);

    await Promise.all([
      page.waitForResponse(
        (res) =>
          res.request().method() === 'POST' &&
          /\/api\/creator-applications/.test(res.url()) &&
          res.status() === 500,
      ),
      creatorSubmitButton(page).click(),
    ]);

    await expect(page.getByText(/could not submit|không thể gửi đăng ký/i)).toBeVisible({ timeout: 15_000 });
  });
});
