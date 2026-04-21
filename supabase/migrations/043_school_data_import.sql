-- ============================================================================
-- Supabase Migration 043: School Data Import
-- Description: Tables for storing import mappings and audit history
-- ============================================================================

-- school_import_mappings: saved column mappings per school/entity
CREATE TABLE IF NOT EXISTS public.school_import_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    entity TEXT NOT NULL CHECK (entity IN ('teachers', 'classes', 'students')),
    mapping_json JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(school_id, entity)
);

CREATE INDEX idx_school_import_mappings_school_id ON public.school_import_mappings(school_id);

-- school_import_audit: import history for auditing
CREATE TABLE IF NOT EXISTS public.school_import_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    entity TEXT NOT NULL CHECK (entity IN ('teachers', 'classes', 'students')),
    row_count INTEGER NOT NULL DEFAULT 0,
    success_count INTEGER NOT NULL DEFAULT 0,
    failed_count INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'partial', 'failed')),
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_school_import_audit_school_id ON public.school_import_audit(school_id);
CREATE INDEX idx_school_import_audit_created_at ON public.school_import_audit(created_at DESC);

-- Enable RLS
ALTER TABLE public.school_import_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_import_audit ENABLE ROW LEVEL SECURITY;

-- RLS: school admins can manage mappings for their schools
CREATE POLICY school_import_mappings_select ON public.school_import_mappings
    FOR SELECT USING (
        school_id IN (SELECT unnest(public.get_user_school_ids()))
        OR public.get_user_role() = 'admin'
    );

CREATE POLICY school_import_mappings_insert ON public.school_import_mappings
    FOR INSERT WITH CHECK (
        school_id IN (SELECT unnest(public.get_user_school_ids()))
        OR public.get_user_role() = 'admin'
    );

CREATE POLICY school_import_mappings_update ON public.school_import_mappings
    FOR UPDATE USING (
        school_id IN (SELECT unnest(public.get_user_school_ids()))
        OR public.get_user_role() = 'admin'
    );

CREATE POLICY school_import_mappings_delete ON public.school_import_mappings
    FOR DELETE USING (
        school_id IN (SELECT unnest(public.get_user_school_ids()))
        OR public.get_user_role() = 'admin'
    );

-- RLS: school admins can view audit for their schools
CREATE POLICY school_import_audit_select ON public.school_import_audit
    FOR SELECT USING (
        school_id IN (SELECT unnest(public.get_user_school_ids()))
        OR public.get_user_role() = 'admin'
    );

CREATE POLICY school_import_audit_insert ON public.school_import_audit
    FOR INSERT WITH CHECK (
        school_id IN (SELECT unnest(public.get_user_school_ids()))
        OR public.get_user_role() = 'admin'
    );

COMMENT ON TABLE public.school_import_mappings IS 'Saved column mappings for school data import (teachers, classes, students)';
COMMENT ON TABLE public.school_import_audit IS 'Audit log of school data imports';
