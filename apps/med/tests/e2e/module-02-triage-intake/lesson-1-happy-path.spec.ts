import { test } from '@playwright/test';
import path from 'path';
import {
  dismissLessonTourIfPresent,
  gotoEmergencyM2Lesson1,
  navigateM2Lesson1ToScriptReadSubtitle,
  wireEmergencyM2L1LessonGates,
} from '../_shared/emergency-m2-l1-flow';
import { TAG } from '../_shared/tags';

const authFile = path.resolve('tests', '.auth', 'learner.json');
test.use({ storageState: authFile });

test.describe('Emergency M2 Lesson 1 — happy path milestones', {
  tag: [TAG.happyPath, TAG.module2, TAG.nav, TAG.state],
}, () => {
  /** Long scripted journey + Turbopack chunk-retry guardrails exceed default 150s on mobile. */
  test.describe.configure({ timeout: 300_000 });

  test('reaches script_read after early lesson steps', async ({ page }) => {
    await wireEmergencyM2L1LessonGates(page);
    await gotoEmergencyM2Lesson1(page);
    await dismissLessonTourIfPresent(page);
    await navigateM2Lesson1ToScriptReadSubtitle(page);
  });
});
