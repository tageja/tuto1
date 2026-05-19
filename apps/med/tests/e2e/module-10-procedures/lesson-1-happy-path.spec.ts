import { test } from '@playwright/test';
import path from 'path';
import {
  dismissLessonTourIfPresent,
  gotoEmergencyM10Lesson1,
  navigateM10Lesson1ToScriptRead,
  wireEmergencyM10L1LessonGates,
} from '../_shared/emergency-m10-l1-flow';
import { TAG } from '../_shared/tags';

const authFile = path.resolve('tests', '.auth', 'learner.json');
test.use({ storageState: authFile });

test.describe('Emergency M10 Lesson 1 — happy path milestones', {
  tag: [TAG.happyPath, TAG.module10, TAG.nav, TAG.state],
}, () => {
  test.describe.configure({ timeout: 300_000 });

  test('reaches script_read after video, flashcards, and audio_shadow (no scenario_intro)', async ({ page }) => {
    await wireEmergencyM10L1LessonGates(page);
    await gotoEmergencyM10Lesson1(page);
    await dismissLessonTourIfPresent(page);
    await navigateM10Lesson1ToScriptRead(page);
  });
});
