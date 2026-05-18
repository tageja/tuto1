import { expect, test } from '@playwright/test';
import path from 'path';
import { TAG, bugTag } from '../_shared/tags';

/**
 * Feedback bug #4 — "Once a user logs into the platform, the main logo in the
 * header strictly redirects them to the User Overview page, not returning to
 * the public Landing Page"
 * Location: Navigation Header / Main Web Logo
 *
 * Product decision needed: should the logo go to `/` (public landing) or
 * `/learn` (authenticated overview)? Most learning platforms point to the
 * authenticated home for logged-in users. The user feedback expects `/`.
 *
 * Test as-spec'd by the feedback for now: clicking logo when logged-in goes to /.
 */

const authFile = path.resolve('tests', '.auth', 'learner.json');
test.use({ storageState: authFile });

test.describe('Bug #4 — logo links to public landing', {
  tag: [TAG.regression, TAG.nav, TAG.crossCutting, bugTag(4)],
}, () => {
  test('clicking the header logo while logged in navigates to /', async ({ page }) => {
    await page.goto('/learn/courses', { waitUntil: 'domcontentloaded' });
    const logo = page
      .getByRole('link')
      .filter({ has: page.locator('img[alt*="tuto" i], svg, [data-testid="logo"]') })
      .first();
    // On mobile the sidebar logo is off-screen (sidebar hidden). Use JS click to
    // bypass viewport checks while still dispatching the navigation event.
    await logo.evaluate((el) => (el as HTMLElement).click());
    await expect(page).toHaveURL(/\/$/);
  });
});
