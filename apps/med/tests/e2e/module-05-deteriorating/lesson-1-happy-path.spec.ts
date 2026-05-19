import { test } from '@playwright/test';
import path from 'path';
import {
  dismissLessonTourIfPresent,
  gotoEmergencyM5Lesson1,
  navigateM5Lesson1ToScriptReadSubtitle,
  wireEmergencyM5L1LessonGates,
} from '../_shared/emergency-m5-l1-flow';
import { TAG } from '../_shared/tags';

const authFile = path.resolve('tests', '.auth', 'learner.json');
test.use({ storageState: authFile });

test.describe('Emergency M5 Lesson 1 — happy path milestones', {
  tag: [TAG.happyPath, TAG.module5, TAG.nav, TAG.state],
}, () => {
  test.describe.configure({ timeout: 300_000 });

  test('reaches script_read after early lesson steps', async ({ page }) => {
    // Prod: legacy FlashCard deck UI blocks reliable automation; use test-m5@test.com on preview after promote.
    test.fixme(
      process.env.BASE_URL?.includes('pro.tuto.asia') ?? false,
      'Prod FlashCard step blocks headed happy path — run on preview after promote',
    );
    await wireEmergencyM5L1LessonGates(page);
    await gotoEmergencyM5Lesson1(page);
    await dismissLessonTourIfPresent(page);
    await navigateM5Lesson1ToScriptReadSubtitle(page);
  });
});
