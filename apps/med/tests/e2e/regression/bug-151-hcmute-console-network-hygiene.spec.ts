import { expect, test } from '@playwright/test';
import { TAG, bugTag } from '../_shared/tags';
import { mockPilotSpots } from '../_shared/hcmute-home';

test.describe('Bug #151 — HCMUTE homepage console and network hygiene', {
  tag: [TAG.regression, TAG.hcmute, TAG.crossCutting, bugTag(151)],
}, () => {
  test('initial load has no pageerror and no 4xx/5xx API failures', async ({ page }) => {
    const consoleErrors: string[] = [];
    const failedRequests: string[] = [];

    page.on('pageerror', (err) => {
      if (err.message.includes('Failed to load chunk')) return;
      consoleErrors.push(err.message);
    });
    page.on('console', (msg) => {
      if (msg.type() === 'error' && !msg.text().includes('Hydration')) {
        consoleErrors.push(msg.text());
      }
    });
    page.on('response', (res) => {
      const url = res.url();
      if (!url.includes('/api/')) return;
      if (res.status() >= 400) failedRequests.push(`${res.status()} ${url}`);
    });

    await mockPilotSpots(page, { taken: 0, total: 50, spotsLeft: 50, isFull: false });
    await page.goto('/', { waitUntil: 'networkidle' });

    expect(consoleErrors, consoleErrors.join('\n')).toEqual([]);
    expect(failedRequests, failedRequests.join('\n')).toEqual([]);
  });
});
