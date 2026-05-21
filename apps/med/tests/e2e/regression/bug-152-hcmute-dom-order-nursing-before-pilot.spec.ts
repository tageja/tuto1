import { expect, test } from '@playwright/test';
import { TAG, bugTag } from '../_shared/tags';
import { mockPilotSpots } from '../_shared/hcmute-home';

test.describe('Bug #152 — HCMUTE DOM order nursing before pilot', {
  tag: [TAG.regression, TAG.hcmute, TAG.nav, bugTag(152)],
}, () => {
  test('nursing-course precedes hcmute-pilot precedes future-courses heading', async ({ page }) => {
    await mockPilotSpots(page, { taken: 0, total: 50, spotsLeft: 50, isFull: false });
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const order = await page.evaluate(() => {
      const nursing = document.getElementById('nursing-course');
      const pilot = document.getElementById('hcmute-pilot');
      const futureHeading = Array.from(document.querySelectorAll('h2')).find((h) =>
        /Vote by registering|Bình chọn bằng cách/i.test(h.textContent ?? ''),
      );
      const following = Node.DOCUMENT_POSITION_FOLLOWING;
      return {
        nursingBeforePilot:
          !!nursing && !!pilot && (nursing.compareDocumentPosition(pilot) & following) !== 0,
        pilotBeforeFuture:
          !!pilot && !!futureHeading && (pilot.compareDocumentPosition(futureHeading) & following) !== 0,
      };
    });

    expect(order.nursingBeforePilot).toBe(true);
    expect(order.pilotBeforeFuture).toBe(true);
  });
});
