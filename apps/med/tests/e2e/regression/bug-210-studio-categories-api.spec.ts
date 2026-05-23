import { expect, test } from '@playwright/test';
import { STUDIO_CATEGORIES_API } from '../_shared/studio-pages';
import { TAG, bugTag } from '../_shared/tags';

test.describe('Bug #210 — GET /api/studio/categories', {
  tag: [TAG.regression, TAG.studio, bugTag(210)],
}, () => {
  test('returns 200 with data array of categories (id, name, slug)', async ({ request }) => {
    const response = await request.get(STUDIO_CATEGORIES_API);
    expect(response.status()).toBe(200);

    const body = (await response.json()) as {
      data?: Array<{ id?: string; name?: string; slug?: string }>;
    };

    expect(Array.isArray(body.data)).toBe(true);

    if (body.data!.length > 0) {
      const first = body.data![0];
      expect(first).toHaveProperty('id');
      expect(first).toHaveProperty('name');
      expect(first).toHaveProperty('slug');
      expect(typeof first.id).toBe('string');
      expect(typeof first.name).toBe('string');
      expect(typeof first.slug).toBe('string');
    }
  });
});
