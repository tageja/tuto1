-- ============================================================================
-- Supabase Migration 033: TutoAdmin Schema
-- Description: Schema changes for Tuto internal admin dashboard
-- Adds subscription tracking, offboarding records, and tuto admins support
-- ============================================================================

-- ============================================================================
-- PART 1: Enhance schools table with subscription & partnership fields
-- ============================================================================

-- Add subscription plan field (default to Premium as per requirements)
ALTER TABLE public.schools 
ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'premium' 
CHECK (subscription_plan IN ('basic', 'advanced', 'premium'));

-- Add partnership tracking
ALTER TABLE public.schools 
ADD COLUMN IF NOT EXISTS partnership_start_date TIMESTAMPTZ DEFAULT NOW();

-- Add offboarding support
ALTER TABLE public.schools 
ADD COLUMN IF NOT EXISTS offboarded_at TIMESTAMPTZ;

ALTER TABLE public.schools 
ADD COLUMN IF NOT EXISTS offboarding_record_id UUID;

-- Add contact person for partnership management
ALTER TABLE public.schools 
ADD COLUMN IF NOT EXISTS contact_name TEXT;

ALTER TABLE public.schools 
ADD COLUMN IF NOT EXISTS contact_email TEXT;

ALTER TABLE public.schools 
ADD COLUMN IF NOT EXISTS contact_phone TEXT;

-- Comment for documentation
COMMENT ON COLUMN public.schools.subscription_plan IS 'School subscription tier: basic, advanced, or premium';
COMMENT ON COLUMN public.schools.partnership_start_date IS 'When the school joined Tuto as a partner';
COMMENT ON COLUMN public.schools.offboarded_at IS 'Timestamp when school was offboarded (null if active)';
COMMENT ON COLUMN public.schools.offboarding_record_id IS 'Reference to detailed offboarding record';

-- ============================================================================
-- PART 2: Create school offboarding records table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.school_offboarding_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    
    -- Offboarding reason and details
    reason TEXT NOT NULL CHECK (reason IN (
        'contract_ended',
        'budget_constraints', 
        'service_dissatisfaction',
        'switching_competitor',
        'school_closure',
        'merger_acquisition',
        'payment_issues',
        'other'
    )),
    reason_details TEXT,
    
    -- Dates
    offboard_date DATE NOT NULL,
    scheduled_date DATE,
    final_billing_date DATE,
    
    -- Financial
    outstanding_balance_cents BIGINT DEFAULT 0,
    total_revenue_generated_cents BIGINT DEFAULT 0,
    
    -- Data handling
    data_retention_months INTEGER DEFAULT 12 CHECK (data_retention_months >= 0 AND data_retention_months <= 84),
    data_export_provided BOOLEAN DEFAULT false,
    
    -- Exit interview
    exit_interview_conducted BOOLEAN DEFAULT false,
    exit_interview_notes TEXT,
    
    -- Satisfaction metrics (for quarterly review)
    satisfaction_rating INTEGER CHECK (satisfaction_rating BETWEEN 1 AND 5),
    would_recommend BOOLEAN,
    likelihood_to_return TEXT CHECK (likelihood_to_return IN ('high', 'medium', 'low', 'unknown')),
    
    -- Partnership summary
    partnership_duration_months INTEGER,
    total_students_served INTEGER,
    total_teachers_served INTEGER,
    
    -- Audit fields
    handled_by UUID REFERENCES public.users(id),
    handled_by_email TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_offboarding_school_id ON public.school_offboarding_records(school_id);
CREATE INDEX IF NOT EXISTS idx_offboarding_reason ON public.school_offboarding_records(reason);
CREATE INDEX IF NOT EXISTS idx_offboarding_date ON public.school_offboarding_records(offboard_date);
CREATE INDEX IF NOT EXISTS idx_offboarding_created ON public.school_offboarding_records(created_at);

-- Add foreign key from schools to offboarding records
ALTER TABLE public.schools 
ADD CONSTRAINT fk_schools_offboarding_record
FOREIGN KEY (offboarding_record_id) REFERENCES public.school_offboarding_records(id) ON DELETE SET NULL;

-- Comment for documentation
COMMENT ON TABLE public.school_offboarding_records IS 'Detailed offboarding records for schools, used for quarterly business reviews';

-- ============================================================================
-- PART 3: RLS Policies for school_offboarding_records
-- ============================================================================

-- Enable RLS
ALTER TABLE public.school_offboarding_records ENABLE ROW LEVEL SECURITY;

-- TutoAdmin users can read and write offboarding records
-- We identify TutoAdmin users by their email domain (@tutoglobal.com)
CREATE POLICY "Tuto admins can view all offboarding records"
ON public.school_offboarding_records
FOR SELECT
TO authenticated
USING (
    (SELECT email FROM auth.users WHERE id = auth.uid()) LIKE '%@tutoglobal.com'
);

CREATE POLICY "Tuto admins can insert offboarding records"
ON public.school_offboarding_records
FOR INSERT
TO authenticated
WITH CHECK (
    (SELECT email FROM auth.users WHERE id = auth.uid()) LIKE '%@tutoglobal.com'
);

CREATE POLICY "Tuto admins can update offboarding records"
ON public.school_offboarding_records
FOR UPDATE
TO authenticated
USING (
    (SELECT email FROM auth.users WHERE id = auth.uid()) LIKE '%@tutoglobal.com'
);

-- ============================================================================
-- PART 4: Update school_invitations for admin onboarding codes
-- ============================================================================

-- Ensure invitation_type includes admin_onboarding (may already exist)
-- This is handled in existing schema, just adding documentation

COMMENT ON COLUMN public.school_invitations.invitation_type IS 'Type of invitation: teacher, parent, or admin_onboarding (executive code for school admins)';
COMMENT ON COLUMN public.school_invitations.is_single_use IS 'Whether this invitation code can only be used once (typically true for admin_onboarding codes)';

-- ============================================================================
-- PART 5: Helper function to calculate partnership metrics
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_school_metrics(p_school_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSON;
    student_count INTEGER;
    teacher_count INTEGER;
    class_count INTEGER;
    partnership_months INTEGER;
BEGIN
    -- Count students
    SELECT COUNT(*) INTO student_count 
    FROM public.school_students 
    WHERE school_id = p_school_id AND status = 'active';
    
    -- Count teachers
    SELECT COUNT(*) INTO teacher_count 
    FROM public.school_teachers 
    WHERE school_id = p_school_id AND status = 'active';
    
    -- Count classes
    SELECT COUNT(*) INTO class_count 
    FROM public.school_classes 
    WHERE school_id = p_school_id AND status = 'active';
    
    -- Calculate partnership duration
    SELECT EXTRACT(MONTH FROM AGE(NOW(), partnership_start_date))::INTEGER
    INTO partnership_months
    FROM public.schools 
    WHERE id = p_school_id;
    
    result := json_build_object(
        'student_count', COALESCE(student_count, 0),
        'teacher_count', COALESCE(teacher_count, 0),
        'class_count', COALESCE(class_count, 0),
        'partnership_months', COALESCE(partnership_months, 0)
    );
    
    RETURN result;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION calculate_school_metrics(UUID) TO authenticated;

-- ============================================================================
-- PART 6: Trigger to update timestamps
-- ============================================================================

CREATE OR REPLACE FUNCTION update_offboarding_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_offboarding_timestamp
    BEFORE UPDATE ON public.school_offboarding_records
    FOR EACH ROW
    EXECUTE FUNCTION update_offboarding_timestamp();

-- ============================================================================
-- PART 7: Update existing schools with partnership_start_date
-- ============================================================================

-- Set partnership_start_date to created_at for existing schools if not set
UPDATE public.schools 
SET partnership_start_date = created_at 
WHERE partnership_start_date IS NULL;


