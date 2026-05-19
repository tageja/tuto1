import { test } from '@playwright/test';
import path from 'path';
import {
  dismissLessonTourIfPresent,
  gotoEmergencyM3Lesson1,
  navigateM3Lesson1ToScriptReadSubtitle,
  wireEmergencyM3L1LessonGates,
} from '../_shared/emergency-m3-l1-flow';
import { TAG } from '../_shared/tags';

const authFile = path.resolve('tests', '.auth', 'learner.json');
test.use({ storageState: authFile });

test.describe('Emergency M3 Lesson 1 — happy path milestones', {
  tag: [TAG.happyPath, TAG.module3, TAG.nav, TAG.state],
}, () => {
  test.describe.configure({ timeout: 300_000 });

  test('reaches script_read after early lesson steps', async ({ page }) => {
    await wireEmergencyM3L1LessonGates(page);
    await gotoEmergencyM3Lesson1(page);
    await dismissLessonTourIfPresent(page);
    await navigateM3Lesson1ToScriptReadSubtitle(page);
  });
});
