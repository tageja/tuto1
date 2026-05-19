import { test } from '@playwright/test';
import path from 'path';
import {
  dismissLessonTourIfPresent,
  gotoEmergencyM7Lesson1,
  navigateM7Lesson1ToScriptReadSubtitle,
  wireEmergencyM7L1LessonGates,
} from '../_shared/emergency-m7-l1-flow';
import { TAG } from '../_shared/tags';

const authFile = path.resolve('tests', '.auth', 'learner.json');
test.use({ storageState: authFile });

test.describe('Emergency M7 Lesson 1 — happy path milestones', {
  tag: [TAG.happyPath, TAG.module7, TAG.nav, TAG.state],
}, () => {
  test.describe.configure({ timeout: 300_000 });

  test('reaches script_read after early lesson steps', async ({ page }) => {
    await wireEmergencyM7L1LessonGates(page);
    await gotoEmergencyM7Lesson1(page);
    await dismissLessonTourIfPresent(page);
    await navigateM7Lesson1ToScriptReadSubtitle(page);
  });
});
