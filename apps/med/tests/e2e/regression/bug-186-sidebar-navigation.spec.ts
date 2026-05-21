import { expect, test } from '@playwright/test';
import {
  assertNoNotFound,
  assertSidebarNavLink,
  gotoLearner,
  learnerAuthFile,
  openLearnerSidebarIfMobile,
  skipIfAuthExpired,
} from '../_shared/learner-pages';
import { TAG, bugTag } from '../_shared/tags';

test.describe('Bug #186 — LearnerSidebar links resolve', {
  tag: [TAG.regression, TAG.learnerPages, TAG.nav, bugTag(186)],
}, () => {
  test.use({ storageState: learnerAuthFile });

  test('every sidebar destination loads without 404', async ({ page }) => {
    await gotoLearner(page, '/learn');
    skipIfAuthExpired(page, 'learner auth file expired — run: npx playwright test --project=setup');

    await assertSidebarNavLink(page, /overview|tổng quan/i, /\/learn(\/)?$/);
    await gotoLearner(page, '/learn');
    await assertSidebarNavLink(page, /my courses|khóa học/i, /\/learn\/courses/);
    await gotoLearner(page, '/learn');
    await assertSidebarNavLink(page, /practice groups|nhóm luyện tập|nhóm thực hành/i, /\/learn\/pairs/);
    await gotoLearner(page, '/learn');
    await assertSidebarNavLink(page, /rewards|phần thưởng/i, /\/learn\/rewards/);
    await gotoLearner(page, '/learn');
    await assertSidebarNavLink(page, /^profile$|^hồ sơ$/i, /\/learn\/profile/);
    await assertNoNotFound(page);

    await gotoLearner(page, '/learn');
    await openLearnerSidebarIfMobile(page);
    const feedbackLink = page.locator('aside').getByRole('link', {
      name: /my feedback|góp ý của tôi|góp ý/i,
    });
    await expect(feedbackLink).toBeVisible();
    await feedbackLink.evaluate((el) => (el as HTMLElement).click());
    await expect(page).toHaveURL(/\/learn\/feedback/);
    await assertNoNotFound(page);
  });
});
