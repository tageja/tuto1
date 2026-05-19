import type { Page, Locator } from '@playwright/test';

/**
 * Auth form fields: prefer stable `id`s (current app), fall back to placeholder /
 * accessible name on older prod deploys where labels are not wired into the a11y tree.
 */
export function loginEmailField(page: Page): Locator {
  return page
    .locator('#login-email, #magic-email')
    .or(page.getByPlaceholder('ten@benhvien.vn'))
    .or(page.getByRole('textbox', { name: /ten@benhvien/i }))
    .first();
}

export function loginPasswordField(page: Page): Locator {
  return page
    .locator('#login-password')
    .or(page.getByPlaceholder('••••••••'))
    .or(page.getByRole('textbox', { name: /••••/ }))
    .first();
}

export function registerEmailField(page: Page): Locator {
  return page
    .locator('#register-email')
    .or(page.getByPlaceholder('ten@benhvien.vn'))
    .or(page.getByRole('textbox', { name: /ten@benhvien/i }))
    .first();
}

export function registerPasswordField(page: Page): Locator {
  return page
    .locator('#register-password')
    .or(page.getByPlaceholder(/tối thiểu 8|min\.? 8/i))
    .or(page.getByRole('textbox', { name: /tối thiểu 8|min\.? 8/i }))
    .first();
}
