import { test } from '@playwright/test';
import path from 'path';
import {
  dismissLessonTourIfPresent,
  gotoEmergencyM8Lesson1,
  navigateM8Lesson1ToScriptRead,
  wireEmergencyM8L1LessonGates,
} from '../_shared/emergency-m8-l1-flow';
import { TAG } from '../_shared/tags';

const authFile = path.resolve('tests', '.auth', 'learner.json');
test.use({ storageState: authFile });

test.describe('Emergency M8 Lesson 1 — happy path milestones', {
  tag: [TAG.happyPath, TAG.module8, TAG.nav, TAG.state],
}, () => {
  test.describe.configure({ timeout: 300_000 });

  test('reaches script_read after scenario, flashcards, and audio_shadow (no video step)', async ({ page }) => {
    await wireEmergencyM8L1LessonGates(page);
    await gotoEmergencyM8Lesson1(page);
    await dismissLessonTourIfPresent(page);
    await navigateM8Lesson1ToScriptRead(page);
  });
});
