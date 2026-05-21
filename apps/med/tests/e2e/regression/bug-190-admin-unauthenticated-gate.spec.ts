import { expect, test } from '@playwright/test';
import { assertAdminRouteGated } from '../_shared/admin-pages';
import { AUTH_DISABLED } from '../_shared/env';
import { TAG, bugTag } from '../_shared/tags';

test.describe('Bug #190 — unauthenticated /admin routes are gated', {
  tag: [TAG.regression, TAG.adminPages, TAG.auth, bugTag(190)],
}, () => {
  test.beforeEach(async ({ context }) => {
    test.skip(AUTH_DISABLED, 'Auth bypass — admin gate not enforced');
    await context.clearCookies();
  });

  for (const path of ['/admin', '/admin/courses', '/admin/students'] as const) {
    test(`${path} shows login or redirects — not 404/500`, async ({ page }) => {
      await assertAdminRouteGated(page, path);
      expect(page.url()).not.toMatch(/\/learn\/courses/);
    });
  }
});
