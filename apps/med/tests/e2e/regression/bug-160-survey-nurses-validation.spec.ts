import { expect, test } from '@playwright/test';
import { TAG, bugTag } from '../_shared/tags';
import {
  assertSurveyPersonalStepBlocksEmptySubmit,
  mockSurveySiteSettings,
  openNurseSurveyForm,
  surveyNextButton,
} from '../_shared/public-pages';

test.describe('Bug #160 — /survey-nurses blocks empty submit; no POST', {
  tag: [TAG.regression, TAG.publicPages, bugTag(160)],
}, () => {
  test('empty personal step keeps Next disabled and never POSTs', async ({ page }) => {
    await mockSurveySiteSettings(page, 'survey-nurses');
    let postCount = 0;
    await page.route('**/api/surveys/nurses', async (route) => {
      if (route.request().method() === 'POST') postCount += 1;
      await route.fulfill({ status: 201, contentType: 'application/json', body: '{"success":true}' });
    });

    await openNurseSurveyForm(page);
    await assertSurveyPersonalStepBlocksEmptySubmit(page);

    const next = surveyNextButton(page);
    await next.click({ force: true }).catch(() => {});
    await page.waitForTimeout(500);

    expect(postCount).toBe(0);
  });
});
