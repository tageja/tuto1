-- ============================================================================
-- Migration 030: Photo Albums Feature
-- Description: Create school_albums, school_album_photos, and school_photo_favorites tables with RLS
-- ============================================================================

-- ============================================================================
-- TABLE: school_albums
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.school_albums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  class_id UUID REFERENCES public.school_classes(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'school'
    CHECK (category IN ('school', 'class', 'competition', 'workshop', 'outing', 'practice', 'celebration')),
  event_date DATE,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'archived')),
  visibility TEXT NOT NULL DEFAULT 'all_parents'
    CHECK (visibility IN ('all_parents', 'class_only')),
  cover_photo_path TEXT,
  grade TEXT,
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for school_albums
CREATE INDEX IF NOT EXISTS idx_albums_school_id ON public.school_albums(school_id);
CREATE INDEX IF NOT EXISTS idx_albums_class_id ON public.school_albums(class_id) WHERE class_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_albums_status ON public.school_albums(status);
CREATE INDEX IF NOT EXISTS idx_albums_event_date ON public.school_albums(event_date);
CREATE INDEX IF NOT EXISTS idx_albums_school_status_date ON public.school_albums(school_id, status, event_date DESC NULLS LAST);

-- ============================================================================
-- TABLE: school_album_photos
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.school_album_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id UUID NOT NULL REFERENCES public.school_albums(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  width INTEGER,
  height INTEGER,
  size_bytes INTEGER,
  blurhash TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for school_album_photos
CREATE INDEX IF NOT EXISTS idx_album_photos_album_id ON public.school_album_photos(album_id);
CREATE INDEX IF NOT EXISTS idx_album_photos_order ON public.school_album_photos(album_id, order_index);

-- ============================================================================
-- TABLE: school_photo_favorites
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.school_photo_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_id UUID NOT NULL REFERENCES public.school_album_photos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(photo_id, user_id)
);

-- Indexes for school_photo_favorites
CREATE INDEX IF NOT EXISTS idx_photo_favorites_user_id ON public.school_photo_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_photo_favorites_photo_id ON public.school_photo_favorites(photo_id);
CREATE INDEX IF NOT EXISTS idx_photo_favorites_user_photo ON public.school_photo_favorites(user_id, photo_id);

-- ============================================================================
-- TRIGGERS: updated_at
-- ============================================================================

-- Create trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for school_albums
DROP TRIGGER IF EXISTS update_school_albums_updated_at ON public.school_albums;
CREATE TRIGGER update_school_albums_updated_at 
  BEFORE UPDATE ON public.school_albums
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY: Enable RLS
-- ============================================================================

ALTER TABLE public.school_albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_album_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_photo_favorites ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES: school_albums
-- ============================================================================

-- Admin: Full CRUD within their schools
CREATE POLICY albums_admin_all ON public.school_albums
  FOR ALL
  USING (
    school_id = ANY(get_user_school_ids()) AND is_admin()
  )
  WITH CHECK (
    school_id = ANY(get_user_school_ids()) AND is_admin()
  );

-- Parent: Read albums visible to them
-- Albums are visible if:
-- 1. visibility = 'all_parents' OR
-- 2. visibility = 'class_only' AND class_id is one of their child's classes
CREATE POLICY albums_parent_select ON public.school_albums
  FOR SELECT
  USING (
    status = 'active'
    AND school_id = ANY(get_user_school_ids())
    AND (
      visibility = 'all_parents'
      OR (
        visibility = 'class_only'
        AND class_id IN (
          SELECT DISTINCT class_id 
          FROM public.school_students 
          WHERE id = ANY(COALESCE(get_user_child_student_ids(), ARRAY[]::uuid[]))
            AND class_id IS NOT NULL
        )
      )
    )
  );

-- ============================================================================
-- RLS POLICIES: school_album_photos
-- ============================================================================

-- Admin: Full access to photos in albums they can manage
CREATE POLICY album_photos_admin_all ON public.school_album_photos
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.school_albums a
      WHERE a.id = album_id
        AND a.school_id = ANY(get_user_school_ids())
        AND is_admin()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.school_albums a
      WHERE a.id = album_id
        AND a.school_id = ANY(get_user_school_ids())
        AND is_admin()
    )
  );

-- Parent: Read photos in albums they can see
CREATE POLICY album_photos_parent_select ON public.school_album_photos
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.school_albums a
      WHERE a.id = album_id
        AND a.status = 'active'
        AND a.school_id = ANY(get_user_school_ids())
        AND (
          a.visibility = 'all_parents'
          OR (
            a.visibility = 'class_only'
            AND a.class_id IN (
              SELECT DISTINCT class_id 
              FROM public.school_students 
              WHERE id = ANY(COALESCE(get_user_child_student_ids(), ARRAY[]::uuid[]))
                AND class_id IS NOT NULL
            )
          )
        )
    )
  );

-- ============================================================================
-- RLS POLICIES: school_photo_favorites
-- ============================================================================

-- Admin: Read all favorites in their schools
CREATE POLICY photo_favorites_admin_select ON public.school_photo_favorites
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.school_album_photos p
      JOIN public.school_albums a ON a.id = p.album_id
      WHERE p.id = photo_id
        AND a.school_id = ANY(get_user_school_ids())
        AND is_admin()
    )
  );

-- Parent: Full CRUD for their own favorites
CREATE POLICY photo_favorites_parent_all ON public.school_photo_favorites
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = user_id
        AND u.auth_user_id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM public.school_album_photos p
      JOIN public.school_albums a ON a.id = p.album_id
      WHERE p.id = photo_id
        AND a.status = 'active'
        AND a.school_id = ANY(get_user_school_ids())
        AND (
          a.visibility = 'all_parents'
          OR (
            a.visibility = 'class_only'
            AND a.class_id IN (
              SELECT DISTINCT class_id 
              FROM public.school_students 
              WHERE id = ANY(COALESCE(get_user_child_student_ids(), ARRAY[]::uuid[]))
                AND class_id IS NOT NULL
            )
          )
        )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = user_id
        AND u.auth_user_id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM public.school_album_photos p
      JOIN public.school_albums a ON a.id = p.album_id
      WHERE p.id = photo_id
        AND a.status = 'active'
        AND a.school_id = ANY(get_user_school_ids())
        AND (
          a.visibility = 'all_parents'
          OR (
            a.visibility = 'class_only'
            AND a.class_id IN (
              SELECT DISTINCT class_id 
              FROM public.school_students 
              WHERE id = ANY(COALESCE(get_user_child_student_ids(), ARRAY[]::uuid[]))
                AND class_id IS NOT NULL
            )
          )
        )
    )
  );

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE public.school_albums IS 'School photo albums with categories, visibility, and class restrictions';
COMMENT ON TABLE public.school_album_photos IS 'Individual photos within albums stored in Supabase Storage';
COMMENT ON TABLE public.school_photo_favorites IS 'User favorites for individual photos (photo-level, not album-level)';

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================


