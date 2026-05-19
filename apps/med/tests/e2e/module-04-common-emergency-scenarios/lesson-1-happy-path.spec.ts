import { test } from '@playwright/test';
import path from 'path';
import {
  dismissLessonTourIfPresent,
  gotoEmergencyM4Lesson1,
  navigateM4Lesson1ToScriptReadSubtitle,
  wireEmergencyM4L1LessonGates,
} from '../_shared/emergency-m4-l1-flow';
import { TAG } from '../_shared/tags';

const authFile = path.resolve('tests', '.auth', 'learner.json');
test.use({ storageState: authFile });

test.describe('Emergency M4 Lesson 1 — happy path milestones', {
  tag: [TAG.happyPath, TAG.module4, TAG.nav, TAG.state],
}, () => {
  test.describe.configure({ timeout: 300_000 });

  test('reaches script_read after early lesson steps', async ({ page }) => {
    await wireEmergencyM4L1LessonGates(page);
    await gotoEmergencyM4Lesson1(page);
    await dismissLessonTourIfPresent(page);
    await navigateM4Lesson1ToScriptReadSubtitle(page);
  });
});
