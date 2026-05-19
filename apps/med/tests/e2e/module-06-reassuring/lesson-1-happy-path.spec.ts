import { test } from '@playwright/test';
import path from 'path';
import {
  dismissLessonTourIfPresent,
  gotoEmergencyM6Lesson1,
  navigateM6Lesson1ToScriptReadSubtitle,
  wireEmergencyM6L1LessonGates,
} from '../_shared/emergency-m6-l1-flow';
import { TAG } from '../_shared/tags';

const authFile = path.resolve('tests', '.auth', 'learner.json');
test.use({ storageState: authFile });

test.describe('Emergency M6 Lesson 1 — happy path milestones', {
  tag: [TAG.happyPath, TAG.module6, TAG.nav, TAG.state],
}, () => {
  test.describe.configure({ timeout: 300_000 });

  test('reaches script_read after early lesson steps', async ({ page }) => {
    await wireEmergencyM6L1LessonGates(page);
    await gotoEmergencyM6Lesson1(page);
    await dismissLessonTourIfPresent(page);
    await navigateM6Lesson1ToScriptReadSubtitle(page);
  });
});
