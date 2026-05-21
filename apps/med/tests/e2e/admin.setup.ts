import { test as setup } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { AUTH_DISABLED } from './_shared/env';
import { buildAdminStorageState } from './_shared/supabase-admin';

const authDir = path.resolve('tests', '.auth');
const adminAuthFile = path.join(authDir, 'admin.json');

/**
 * Saves super_admin session for /admin/* specs via Supabase password grant.
 */
setup('authenticate test admin', async ({ page, context }) => {
  if (!fs.existsSync(authDir)) fs.mkdirSync(authDir, { recursive: true });

  if (AUTH_DISABLED) {
    await context.storageState({ path: adminAuthFile });
    return;
  }

  try {
    const state = await buildAdminStorageState();
    fs.writeFileSync(adminAuthFile, JSON.stringify(state, null, 2));
    await context.addCookies(state.cookies);
    await page.goto('/admin/courses', { waitUntil: 'domcontentloaded', timeout: 30_000 });
    if (page.url().includes('/admin') && !page.url().includes('/auth/login')) {
      console.log('[admin-setup] API session written and verified');
      await context.storageState({ path: adminAuthFile });
      return;
    }
    throw new Error(`admin session verify failed — url=${page.url()}`);
  } catch (e) {
    if (fs.existsSync(adminAuthFile)) fs.unlinkSync(adminAuthFile);
    throw e;
  }
});
