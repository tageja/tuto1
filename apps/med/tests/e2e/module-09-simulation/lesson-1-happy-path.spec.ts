import { test } from '@playwright/test';
import path from 'path';
import {
  dismissLessonTourIfPresent,
  gotoEmergencyM9Lesson1,
  navigateM9Lesson1ToScriptRead,
  wireEmergencyM9L1LessonGates,
} from '../_shared/emergency-m9-l1-flow';
import { TAG } from '../_shared/tags';

const authFile = path.resolve('tests', '.auth', 'learner.json');
test.use({ storageState: authFile });

test.describe('Emergency M9 Lesson 1 — happy path milestones', {
  tag: [TAG.happyPath, TAG.module9, TAG.nav, TAG.state],
}, () => {
  test.describe.configure({ timeout: 300_000 });

  test('reaches script_read after scenario, flashcards, and video (no audio_shadow)', async ({ page }) => {
    await wireEmergencyM9L1LessonGates(page);
    await gotoEmergencyM9Lesson1(page);
    await dismissLessonTourIfPresent(page);
    await navigateM9Lesson1ToScriptRead(page);
  });
});
