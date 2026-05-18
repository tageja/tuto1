import { expect, test } from '@playwright/test';
import path from 'path';
import {
  dismissLessonTourIfPresent,
  gotoEmergencyM1Lesson1,
  navigateM1Lesson1ToAudioShadow,
  stubPairsMembershipInGroup,
} from '../_shared/emergency-m1-l1-flow';
import { TAG, bugTag } from '../_shared/tags';

const authFile = path.resolve('tests', '.auth', 'learner.json');
test.use({ storageState: authFile });

test.describe('Bug #19 — audio_shadow phase controls expose tab semantics', {
  tag: [TAG.regression, TAG.module1, TAG.a11y, bugTag(19)],
}, () => {
  test('phase strip is tablist with tab + tabpanel', async ({ page }) => {
    await stubPairsMembershipInGroup(page);
    await gotoEmergencyM1Lesson1(page);
    await dismissLessonTourIfPresent(page);
    await navigateM1Lesson1ToAudioShadow(page);

    const tablist = page.getByRole('tablist');
    await expect(tablist).toBeVisible({ timeout: 30_000 });

    const listenTab = page.getByRole('tab', { name: /listen|nghe/i });
    await expect(listenTab).toBeVisible();
    await listenTab.click();
    await expect(listenTab).toHaveAttribute('aria-selected', 'true');

    const readTab = page.getByRole('tab', { name: /read along|đọc theo/i });
    await expect(readTab).toBeVisible();
    await readTab.click();
    await expect(readTab).toHaveAttribute('aria-selected', 'true');
    await expect(listenTab).toHaveAttribute('aria-selected', 'false');

    const panel = page.getByRole('tabpanel');
    await expect(panel).toBeVisible();
    await expect(page.getByRole('button', { name: /^play$/i })).toBeVisible();
  });
});
