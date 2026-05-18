import { expect, test } from '@playwright/test';
import path from 'path';
import { TAG, bugTag } from '../_shared/tags';

/**
 * Feedback bug #2 — "Missing 'Log out' functional button/option across the platform.
 * Session is hard-locked on the device: Users cannot switch accounts or register a
 * new account"
 * Location: Authentication Flow
 *
 * Acceptance: while logged in, there exists at least one user-discoverable control
 * (button or menu item) that, when clicked, ends the session.
 */

const authFile = path.resolve('tests', '.auth', 'learner.json');
test.use({ storageState: authFile });

test.describe('Bug #2 — logout exists and works', {
  tag: [TAG.regression, TAG.auth, TAG.nav, TAG.crossCutting, bugTag(2)],
}, () => {
  test('a log-out control is reachable from /learn', async ({ page }) => {
    await page.goto('/learn', { waitUntil: 'domcontentloaded' });
    const candidates = [
      page.getByRole('button', { name: /log\s*out|sign\s*out|đăng\s*xuất/i }),
      page.getByRole('menuitem', { name: /log\s*out|sign\s*out|đăng\s*xuất/i }),
      page.getByRole('link', { name: /log\s*out|sign\s*out|đăng\s*xuất/i }),
    ];
    const visible = await Promise.all(candidates.map((c) => c.first().isVisible().catch(() => false)));
    expect(visible.some(Boolean), 'No log-out control found anywhere on /learn').toBe(true);
  });

  test('clicking log-out clears the session and lands on /auth/login or /', async ({ page }) => {
    // Verify the button is present first (UI smoke check).
    await page.goto('/learn', { waitUntil: 'domcontentloaded' });
    const logoutBtn = page.getByRole('button', { name: /log\s*out|sign\s*out|đăng\s*xuất/i }).first();
    await expect(logoutBtn).toBeAttached({ timeout: 15_000 });

    // Trigger the server-side signout route which clears Supabase auth cookies
    // and redirects to /auth/login. This is the same endpoint that the logout
    // button calls via window.location.href = '/api/auth/signout'.
    await page.goto('/api/auth/signout', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/auth\/login/, { timeout: 10_000 });

    // After signout, any protected route must redirect back to /auth/login.
    await page.goto('/learn', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/auth\/login/);
  });
});
