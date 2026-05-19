import { test } from '@playwright/test';
import path from 'path';
import {
  dismissLessonTourIfPresent,
  gotoEmergencyM11Lesson1,
  navigateM11Lesson1ToScriptRead,
  wireEmergencyM11L1LessonGates,
} from '../_shared/emergency-m11-l1-flow';
import { TAG } from '../_shared/tags';

const authFile = path.resolve('tests', '.auth', 'learner.json');
test.use({ storageState: authFile });

test.describe('Emergency M11 Lesson 1 — happy path milestones', {
  tag: [TAG.happyPath, TAG.module11, TAG.nav, TAG.state],
}, () => {
  test.describe.configure({ timeout: 300_000 });

  test('reaches script_read after video, flashcards, and audio_shadow (no scenario_intro)', async ({ page }) => {
    await wireEmergencyM11L1LessonGates(page);
    await gotoEmergencyM11Lesson1(page);
    await dismissLessonTourIfPresent(page);
    await navigateM11Lesson1ToScriptRead(page);
  });
});
