-- ============================================================================
-- Supabase Migration 003: Functions & Triggers
-- Description: Utility functions, RPCs, and automated triggers
-- ============================================================================

-- ============================================================================
-- TRIGGER FUNCTION: updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- APPLY updated_at TRIGGERS TO ALL TABLES
-- ============================================================================

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_schools_updated_at BEFORE UPDATE ON public.schools
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_school_classes_updated_at BEFORE UPDATE ON public.school_classes
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_school_teachers_updated_at BEFORE UPDATE ON public.school_teachers
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_school_students_updated_at BEFORE UPDATE ON public.school_students
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_school_attendance_updated_at BEFORE UPDATE ON public.school_attendance
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_school_events_updated_at BEFORE UPDATE ON public.school_events
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_school_progress_reports_updated_at BEFORE UPDATE ON public.school_progress_reports
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_school_progress_subjects_updated_at BEFORE UPDATE ON public.school_progress_subjects
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_school_invitations_updated_at BEFORE UPDATE ON public.school_invitations
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_school_payments_updated_at BEFORE UPDATE ON public.school_payments
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subjects_updated_at BEFORE UPDATE ON public.subjects
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_teachers_updated_at BEFORE UPDATE ON public.teachers
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON public.students
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_parents_updated_at BEFORE UPDATE ON public.parents
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON public.posts
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON public.comments
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON public.messages
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON public.announcements
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_daily_activities_updated_at BEFORE UPDATE ON public.daily_activities
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_absence_requests_updated_at BEFORE UPDATE ON public.absence_requests
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_health_records_updated_at BEFORE UPDATE ON public.health_records
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_medicine_reminders_updated_at BEFORE UPDATE ON public.medicine_reminders
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_photo_albums_updated_at BEFORE UPDATE ON public.photo_albums
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_extracurricular_activities_updated_at BEFORE UPDATE ON public.extracurricular_activities
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_surveys_updated_at BEFORE UPDATE ON public.surveys
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_homework_assignments_updated_at BEFORE UPDATE ON public.homework_assignments
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_attendance_records_updated_at BEFORE UPDATE ON public.attendance_records
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_class_subjects_updated_at BEFORE UPDATE ON public.class_subjects
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_student_subject_overrides_updated_at BEFORE UPDATE ON public.student_subject_overrides
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- RPC: nearby_teachers
-- Description: Find teachers within a specified radius using PostGIS
-- ============================================================================

CREATE OR REPLACE FUNCTION public.nearby_teachers(
    user_lat DOUBLE PRECISION,
    user_lon DOUBLE PRECISION,
    radius_meters INTEGER DEFAULT 10000
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    email TEXT,
    phone TEXT,
    avatar TEXT,
    qualifications TEXT,
    experience INTEGER,
    hourly_rate INTEGER,
    rating DECIMAL,
    review_count INTEGER,
    description TEXT,
    languages TEXT[],
    distance_meters DOUBLE PRECISION
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.id,
        t.name,
        t.email,
        t.phone,
        t.avatar,
        t.qualifications,
        t.experience,
        t.hourly_rate,
        t.rating,
        t.review_count,
        t.description,
        t.languages,
        ST_Distance(
            t.location,
            ST_SetSRID(ST_MakePoint(user_lon, user_lat), 4326)::geography
        ) as distance_meters
    FROM public.teachers t
    WHERE 
        t.status = 'active'
        AND t.location IS NOT NULL
        AND ST_DWithin(
            t.location,
            ST_SetSRID(ST_MakePoint(user_lon, user_lat), 4326)::geography,
            radius_meters
        )
    ORDER BY distance_meters ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- RPC: get_user_schools
-- Description: Get all schools a user has access to
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_user_schools(user_auth_id UUID)
RETURNS TABLE (
    school_id UUID,
    school_name TEXT,
    access_type TEXT
) AS $$
BEGIN
    RETURN QUERY
    -- Schools where user is a teacher
    SELECT DISTINCT
        s.id as school_id,
        s.name as school_name,
        'teacher'::TEXT as access_type
    FROM public.schools s
    INNER JOIN public.school_teachers st ON s.id = st.school_id
    INNER JOIN public.users u ON st.user_id = u.id
    WHERE u.auth_user_id = user_auth_id
    
    UNION
    
    -- Schools where user is a parent
    SELECT DISTINCT
        s.id as school_id,
        s.name as school_name,
        'parent'::TEXT as access_type
    FROM public.schools s
    INNER JOIN public.school_students ss ON s.id = ss.school_id
    INNER JOIN public.users u ON ss.parent_email = u.email
    WHERE u.auth_user_id = user_auth_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- RPC: get_teacher_subjects
-- Description: Get subjects for a teacher with details
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_teacher_subjects(teacher_uuid UUID)
RETURNS TABLE (
    subject_id UUID,
    subject_name TEXT,
    subject_name_vi TEXT,
    subject_category TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id as subject_id,
        s.name as subject_name,
        s.name_vi as subject_name_vi,
        s.category as subject_category
    FROM public.subjects s
    INNER JOIN public.teacher_subjects ts ON s.id = ts.subject_id
    WHERE ts.teacher_id = teacher_uuid
    ORDER BY s.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- RPC: get_student_attendance_stats
-- Description: Get attendance statistics for a student
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_student_attendance_stats(
    student_uuid UUID,
    start_date DATE DEFAULT NULL,
    end_date DATE DEFAULT NULL
)
RETURNS TABLE (
    total_days INTEGER,
    present_days INTEGER,
    absent_days INTEGER,
    late_days INTEGER,
    excused_days INTEGER,
    attendance_rate DECIMAL
) AS $$
DECLARE
    v_total INTEGER;
    v_present INTEGER;
    v_absent INTEGER;
    v_late INTEGER;
    v_excused INTEGER;
BEGIN
    -- Count attendance by status
    SELECT 
        COUNT(*) FILTER (WHERE TRUE),
        COUNT(*) FILTER (WHERE status = 'present'),
        COUNT(*) FILTER (WHERE status = 'absent'),
        COUNT(*) FILTER (WHERE status = 'late'),
        COUNT(*) FILTER (WHERE status = 'excused')
    INTO v_total, v_present, v_absent, v_late, v_excused
    FROM public.school_attendance
    WHERE 
        student_id = student_uuid
        AND (start_date IS NULL OR date >= start_date)
        AND (end_date IS NULL OR date <= end_date);
    
    RETURN QUERY
    SELECT 
        v_total,
        v_present,
        v_absent,
        v_late,
        v_excused,
        CASE 
            WHEN v_total > 0 THEN ROUND((v_present::DECIMAL / v_total::DECIMAL) * 100, 2)
            ELSE 0::DECIMAL
        END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- RPC: search_teachers
-- Description: Full-text search for teachers
-- ============================================================================

CREATE OR REPLACE FUNCTION public.search_teachers(
    search_query TEXT,
    max_results INTEGER DEFAULT 20
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    email TEXT,
    avatar TEXT,
    experience INTEGER,
    hourly_rate INTEGER,
    rating DECIMAL,
    review_count INTEGER,
    description TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.id,
        t.name,
        t.email,
        t.avatar,
        t.experience,
        t.hourly_rate,
        t.rating,
        t.review_count,
        t.description
    FROM public.teachers t
    WHERE 
        t.status = 'active'
        AND (
            t.name ILIKE '%' || search_query || '%'
            OR t.description ILIKE '%' || search_query || '%'
            OR t.qualifications ILIKE '%' || search_query || '%'
        )
    ORDER BY 
        CASE 
            WHEN t.name ILIKE search_query || '%' THEN 1
            WHEN t.name ILIKE '%' || search_query || '%' THEN 2
            ELSE 3
        END,
        t.rating DESC NULLS LAST,
        t.review_count DESC
    LIMIT max_results;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- RPC: get_school_class_students
-- Description: Get students in a class with their details
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_school_class_students(class_uuid UUID)
RETURNS TABLE (
    student_id UUID,
    student_number TEXT,
    first_name TEXT,
    last_name TEXT,
    full_name TEXT,
    date_of_birth DATE,
    parent_email TEXT,
    parent_phone TEXT,
    photo_url TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ss.id as student_id,
        ss.student_number,
        ss.first_name,
        ss.last_name,
        ss.first_name || ' ' || ss.last_name as full_name,
        ss.date_of_birth,
        ss.parent_email,
        ss.parent_phone,
        ss.photo_url
    FROM public.school_students ss
    WHERE ss.class_id = class_uuid
    ORDER BY ss.last_name, ss.first_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- RPC: update_teacher_rating
-- Description: Recalculate teacher rating after new review
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_teacher_rating(teacher_uuid UUID)
RETURNS VOID AS $$
DECLARE
    avg_rating DECIMAL;
    total_reviews INTEGER;
BEGIN
    SELECT 
        ROUND(AVG(rating)::DECIMAL, 2),
        COUNT(*)
    INTO avg_rating, total_reviews
    FROM public.reviews
    WHERE teacher_id = teacher_uuid;
    
    UPDATE public.teachers
    SET 
        rating = avg_rating,
        review_count = total_reviews
    WHERE id = teacher_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- TRIGGER: Auto-update teacher rating on review insert/update/delete
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_review_change()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        PERFORM public.update_teacher_rating(OLD.teacher_id);
        RETURN OLD;
    ELSE
        PERFORM public.update_teacher_rating(NEW.teacher_id);
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_teacher_rating_on_review_insert
    AFTER INSERT ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION public.handle_review_change();

CREATE TRIGGER update_teacher_rating_on_review_update
    AFTER UPDATE ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION public.handle_review_change();

CREATE TRIGGER update_teacher_rating_on_review_delete
    AFTER DELETE ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION public.handle_review_change();

-- ============================================================================
-- UTILITY FUNCTION: Generate invitation token
-- ============================================================================

CREATE OR REPLACE FUNCTION public.generate_invitation_token()
RETURNS TEXT AS $$
BEGIN
    RETURN encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON FUNCTION public.nearby_teachers IS 'Find teachers within a radius using PostGIS';
COMMENT ON FUNCTION public.get_user_schools IS 'Get all schools accessible to a user';
COMMENT ON FUNCTION public.get_teacher_subjects IS 'Get subjects taught by a teacher';
COMMENT ON FUNCTION public.search_teachers IS 'Full-text search for teachers';
COMMENT ON FUNCTION public.update_teacher_rating IS 'Recalculate teacher rating from reviews';

-- Functions and triggers complete!
-- Schema migration is complete. Ready for data import.










