import { test } from '@playwright/test';
import path from 'path';
import {
  dismissLessonTourIfPresent,
  gotoEmergencyM12Lesson1,
  navigateM12Lesson1ToScriptRead,
  wireEmergencyM12L1LessonGates,
} from '../_shared/emergency-m12-l1-flow';
import { TAG } from '../_shared/tags';

const authFile = path.resolve('tests', '.auth', 'learner.json');
test.use({ storageState: authFile });

test.describe('Emergency M12 Lesson 1 — happy path milestones', {
  tag: [TAG.happyPath, TAG.module12, TAG.nav, TAG.state],
}, () => {
  test.describe.configure({ timeout: 300_000 });

  test('reaches script_read after video, flashcards, and audio_shadow (no scenario_intro)', async ({ page }) => {
    await wireEmergencyM12L1LessonGates(page);
    await gotoEmergencyM12Lesson1(page);
    await dismissLessonTourIfPresent(page);
    await navigateM12Lesson1ToScriptRead(page);
  });
});
