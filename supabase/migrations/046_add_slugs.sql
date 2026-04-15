-- ============================================================
-- NurseEd: Add human-readable slug columns
-- Migration 046
-- ============================================================

-- ─── Add slug columns ─────────────────────────────────────
ALTER TABLE nursed_courses ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE nursed_modules ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE nursed_lessons ADD COLUMN IF NOT EXISTS slug text;

-- ─── Unique indexes (scoped appropriately) ────────────────
CREATE UNIQUE INDEX IF NOT EXISTS nursed_courses_slug_idx
  ON nursed_courses (slug) WHERE slug IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS nursed_modules_slug_idx
  ON nursed_modules (course_id, slug) WHERE slug IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS nursed_lessons_slug_idx
  ON nursed_lessons (module_id, slug) WHERE slug IS NOT NULL;

-- ─── Backfill slugs from English titles ───────────────────

-- Helper: deterministic slug from title
CREATE OR REPLACE FUNCTION _nursed_generate_slug(raw text) RETURNS text AS $$
BEGIN
  RETURN substring(
    regexp_replace(
      regexp_replace(
        regexp_replace(
          lower(
            translate(
              normalize(raw, NFD),
              E'\u0300\u0301\u0302\u0303\u0309\u0323\u0306\u031B'
               || E'\u0110\u0111',
              '          dd'
            )
          ),
          '[^a-z0-9\s-]', '', 'g'
        ),
        '\s+', '-', 'g'
      ),
      '^-+|-+$', '', 'g'
    )
    FROM 1 FOR 80
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Backfill courses (globally unique slugs)
DO $$
DECLARE
  r RECORD;
  base_slug text;
  final_slug text;
  counter int;
BEGIN
  FOR r IN SELECT id, title FROM nursed_courses WHERE slug IS NULL AND title IS NOT NULL ORDER BY created_at LOOP
    base_slug := _nursed_generate_slug(r.title);
    IF base_slug = '' OR base_slug IS NULL THEN
      base_slug := 'untitled-' || left(r.id::text, 6);
    END IF;
    final_slug := base_slug;
    counter := 2;
    WHILE EXISTS (SELECT 1 FROM nursed_courses WHERE slug = final_slug AND id <> r.id) LOOP
      final_slug := base_slug || '-' || counter;
      counter := counter + 1;
    END LOOP;
    UPDATE nursed_courses SET slug = final_slug WHERE id = r.id;
  END LOOP;
END $$;

-- Backfill modules (unique within course)
DO $$
DECLARE
  r RECORD;
  base_slug text;
  final_slug text;
  counter int;
BEGIN
  FOR r IN SELECT id, course_id, title FROM nursed_modules WHERE slug IS NULL AND title IS NOT NULL ORDER BY order_index LOOP
    base_slug := _nursed_generate_slug(r.title);
    IF base_slug = '' OR base_slug IS NULL THEN
      base_slug := 'untitled-' || left(r.id::text, 6);
    END IF;
    final_slug := base_slug;
    counter := 2;
    WHILE EXISTS (SELECT 1 FROM nursed_modules WHERE slug = final_slug AND course_id = r.course_id AND id <> r.id) LOOP
      final_slug := base_slug || '-' || counter;
      counter := counter + 1;
    END LOOP;
    UPDATE nursed_modules SET slug = final_slug WHERE id = r.id;
  END LOOP;
END $$;

-- Backfill lessons (unique within module)
DO $$
DECLARE
  r RECORD;
  base_slug text;
  final_slug text;
  counter int;
BEGIN
  FOR r IN SELECT id, module_id, title FROM nursed_lessons WHERE slug IS NULL AND title IS NOT NULL ORDER BY order_index LOOP
    base_slug := _nursed_generate_slug(r.title);
    IF base_slug = '' OR base_slug IS NULL THEN
      base_slug := 'untitled-' || left(r.id::text, 6);
    END IF;
    final_slug := base_slug;
    counter := 2;
    WHILE EXISTS (SELECT 1 FROM nursed_lessons WHERE slug = final_slug AND module_id = r.module_id AND id <> r.id) LOOP
      final_slug := base_slug || '-' || counter;
      counter := counter + 1;
    END LOOP;
    UPDATE nursed_lessons SET slug = final_slug WHERE id = r.id;
  END LOOP;
END $$;

-- Clean up helper function
DROP FUNCTION IF EXISTS _nursed_generate_slug(text);
