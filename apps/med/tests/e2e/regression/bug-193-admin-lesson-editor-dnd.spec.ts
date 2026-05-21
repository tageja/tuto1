import { expect, test } from '@playwright/test';
import {
  EMERGENCY_M1_L1_ADMIN_PATH,
  adminAuthFile,
  adminLessonStepRows,
  assertLessonEditorDragFixInSource,
  gotoAdmin,
} from '../_shared/admin-pages';
import { TAG, bugTag } from '../_shared/tags';

test.describe('Bug #193 — lesson editor loads and step reorder fix', {
  tag: [TAG.regression, TAG.adminPages, TAG.state, bugTag(193)],
}, () => {
  test.use({ storageState: adminAuthFile });

  test('M1 L1 step list visible; drag fix in source; reorder interaction', async ({ page }) => {
    assertLessonEditorDragFixInSource();

    const consoleErrors = await gotoAdmin(page, EMERGENCY_M1_L1_ADMIN_PATH, {
      collectConsole: true,
    });

    const steps = adminLessonStepRows(page);
    await expect(steps.first()).toBeVisible({ timeout: 60_000 });
    const count = await steps.count();
    expect(count).toBeGreaterThanOrEqual(2);

    const labelAt = async (idx: number) =>
      steps.nth(idx).locator('p.truncate, .text-sm.text-text.truncate').first().innerText();

    const label0 = await labelAt(0);
    const label1 = await labelAt(1);

    await steps.nth(0).dragTo(steps.nth(Math.min(2, count - 1)));

    await expect
      .poll(async () => labelAt(0))
      .not.toBe(label0, { timeout: 10_000 });

    const newLabel0 = await labelAt(0);
    expect(newLabel0).toBe(label1);

    expect(consoleErrors, consoleErrors.join('\n')).toEqual([]);
  });
});
