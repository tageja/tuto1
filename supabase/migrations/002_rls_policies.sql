-- ============================================================================
-- Supabase Migration 002: Row Level Security (RLS) Policies
-- Description: Security policies for all tables
-- Default: Deny all, then add specific policies
-- ============================================================================

-- ============================================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_progress_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_progress_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.absence_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicine_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photo_albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.extracurricular_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homework_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_subject_overrides ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- HELPER FUNCTIONS FOR RLS
-- ============================================================================

-- Get current user's role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
BEGIN
    RETURN (
        SELECT role 
        FROM public.users 
        WHERE auth_user_id = auth.uid()
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        SELECT CASE WHEN role IN ('admin', 'school_admin') THEN TRUE ELSE FALSE END
        FROM public.users 
        WHERE auth_user_id = auth.uid()
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get user's school IDs
CREATE OR REPLACE FUNCTION public.get_user_school_ids()
RETURNS UUID[] AS $$
BEGIN
    -- For school admin/teachers: get their schools
    RETURN ARRAY(
        SELECT DISTINCT school_id
        FROM public.school_teachers
        WHERE user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
        
        UNION
        
        -- For parents: get schools of their children
        SELECT DISTINCT school_id
        FROM public.school_students
        WHERE parent_email IN (SELECT email FROM public.users WHERE auth_user_id = auth.uid())
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- USERS TABLE POLICIES
-- ============================================================================

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
    ON public.users FOR SELECT
    USING (auth_user_id = auth.uid());

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON public.users FOR UPDATE
    USING (auth_user_id = auth.uid());

-- Users can insert their own profile (on signup)
CREATE POLICY "Users can insert own profile"
    ON public.users FOR INSERT
    WITH CHECK (auth_user_id = auth.uid());

-- ============================================================================
-- SUBJECTS TABLE POLICIES (Public Read)
-- ============================================================================

-- Anyone can read subjects
CREATE POLICY "Subjects are publicly readable"
    ON public.subjects FOR SELECT
    TO authenticated, anon
    USING (true);

-- Only admins can modify subjects
CREATE POLICY "Admins can manage subjects"
    ON public.subjects FOR ALL
    USING (public.is_admin());

-- ============================================================================
-- MARKETPLACE TEACHERS POLICIES (Public Read)
-- ============================================================================

-- Anyone can read active teachers (marketplace listing)
CREATE POLICY "Active teachers are publicly readable"
    ON public.teachers FOR SELECT
    TO authenticated, anon
    USING (status = 'active');

-- Teachers can update their own profile
CREATE POLICY "Teachers can update own profile"
    ON public.teachers FOR UPDATE
    USING (
        user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
    );

-- Admins can manage all teachers
CREATE POLICY "Admins can manage teachers"
    ON public.teachers FOR ALL
    USING (public.is_admin());

-- ============================================================================
-- TEACHER SUBJECTS POLICIES
-- ============================================================================

-- Anyone can read teacher subjects
CREATE POLICY "Teacher subjects are publicly readable"
    ON public.teacher_subjects FOR SELECT
    TO authenticated, anon
    USING (true);

-- Teachers can manage their own subjects
CREATE POLICY "Teachers can manage own subjects"
    ON public.teacher_subjects FOR ALL
    USING (
        teacher_id IN (
            SELECT id FROM public.teachers 
            WHERE user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
        )
    );

-- ============================================================================
-- SCHOOLS TABLE POLICIES
-- ============================================================================

-- Users can read schools they belong to
CREATE POLICY "Users can read their schools"
    ON public.schools FOR SELECT
    USING (
        id = ANY(public.get_user_school_ids())
        OR public.is_admin()
    );

-- Only admins can manage schools
CREATE POLICY "Admins can manage schools"
    ON public.schools FOR ALL
    USING (public.is_admin());

-- ============================================================================
-- SCHOOL CLASSES POLICIES
-- ============================================================================

-- Users can read classes in their schools
CREATE POLICY "Users can read classes in their schools"
    ON public.school_classes FOR SELECT
    USING (
        school_id = ANY(public.get_user_school_ids())
        OR public.is_admin()
    );

-- School admins/teachers can manage classes in their schools
CREATE POLICY "School staff can manage classes"
    ON public.school_classes FOR ALL
    USING (
        (public.is_admin() AND school_id = ANY(public.get_user_school_ids()))
        OR public.get_user_role() = 'school_admin'
    );

-- ============================================================================
-- SCHOOL TEACHERS POLICIES
-- ============================================================================

-- Users can read teachers in their schools
CREATE POLICY "Users can read teachers in their schools"
    ON public.school_teachers FOR SELECT
    USING (
        school_id = ANY(public.get_user_school_ids())
        OR public.is_admin()
    );

-- School admins can manage teachers
CREATE POLICY "School admins can manage teachers"
    ON public.school_teachers FOR ALL
    USING (
        (public.is_admin() AND school_id = ANY(public.get_user_school_ids()))
        OR public.get_user_role() = 'school_admin'
    );

-- ============================================================================
-- SCHOOL STUDENTS POLICIES
-- ============================================================================

-- Parents can read their own children's data
CREATE POLICY "Parents can read own children"
    ON public.school_students FOR SELECT
    USING (
        parent_email IN (SELECT email FROM public.users WHERE auth_user_id = auth.uid())
        OR school_id = ANY(public.get_user_school_ids())
        OR public.is_admin()
    );

-- School staff can manage students in their schools
CREATE POLICY "School staff can manage students"
    ON public.school_students FOR ALL
    USING (
        (public.get_user_role() IN ('admin', 'school_admin', 'teacher') 
         AND school_id = ANY(public.get_user_school_ids()))
        OR public.is_admin()
    );

-- ============================================================================
-- SCHOOL ATTENDANCE POLICIES
-- ============================================================================

-- Users can read attendance for their school/students
CREATE POLICY "Users can read attendance in their context"
    ON public.school_attendance FOR SELECT
    USING (
        school_id = ANY(public.get_user_school_ids())
        OR student_id IN (
            SELECT id FROM public.school_students 
            WHERE parent_email IN (SELECT email FROM public.users WHERE auth_user_id = auth.uid())
        )
        OR public.is_admin()
    );

-- Teachers can manage attendance in their schools
CREATE POLICY "Teachers can manage attendance"
    ON public.school_attendance FOR ALL
    USING (
        (public.get_user_role() IN ('admin', 'school_admin', 'teacher') 
         AND school_id = ANY(public.get_user_school_ids()))
        OR public.is_admin()
    );

-- ============================================================================
-- BOOKINGS POLICIES (Marketplace)
-- ============================================================================

-- Parents can read their own bookings
CREATE POLICY "Parents can read own bookings"
    ON public.bookings FOR SELECT
    USING (
        parent_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
        OR teacher_id IN (
            SELECT id FROM public.teachers 
            WHERE user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
        )
        OR public.is_admin()
    );

-- Parents can create bookings
CREATE POLICY "Parents can create bookings"
    ON public.bookings FOR INSERT
    WITH CHECK (
        parent_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
    );

-- Parents and teachers can update their bookings
CREATE POLICY "Users can update own bookings"
    ON public.bookings FOR UPDATE
    USING (
        parent_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
        OR teacher_id IN (
            SELECT id FROM public.teachers 
            WHERE user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
        )
        OR public.is_admin()
    );

-- ============================================================================
-- STUDENTS POLICIES (Marketplace)
-- ============================================================================

-- Parents can read their own students
CREATE POLICY "Parents can read own students"
    ON public.students FOR SELECT
    USING (
        parent_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
        OR public.is_admin()
    );

-- Parents can manage their own students
CREATE POLICY "Parents can manage own students"
    ON public.students FOR ALL
    USING (
        parent_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
        OR public.is_admin()
    );

-- ============================================================================
-- REVIEWS POLICIES
-- ============================================================================

-- Anyone can read reviews
CREATE POLICY "Reviews are publicly readable"
    ON public.reviews FOR SELECT
    TO authenticated, anon
    USING (true);

-- Parents can create reviews for their bookings
CREATE POLICY "Parents can create reviews"
    ON public.reviews FOR INSERT
    WITH CHECK (
        parent_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
    );

-- ============================================================================
-- POSTS POLICIES (Social)
-- ============================================================================

-- Users can read active posts
CREATE POLICY "Users can read active posts"
    ON public.posts FOR SELECT
    TO authenticated
    USING (status = 'active' AND (privacy = 'public' OR author_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid())));

-- Users can create posts
CREATE POLICY "Users can create posts"
    ON public.posts FOR INSERT
    WITH CHECK (author_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));

-- Users can update their own posts
CREATE POLICY "Users can update own posts"
    ON public.posts FOR UPDATE
    USING (author_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));

-- Users can delete their own posts
CREATE POLICY "Users can delete own posts"
    ON public.posts FOR DELETE
    USING (author_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));

-- ============================================================================
-- COMMENTS POLICIES
-- ============================================================================

-- Users can read comments on posts they can see
CREATE POLICY "Users can read comments"
    ON public.comments FOR SELECT
    TO authenticated
    USING (true);

-- Users can create comments
CREATE POLICY "Users can create comments"
    ON public.comments FOR INSERT
    WITH CHECK (author_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));

-- Users can update their own comments
CREATE POLICY "Users can update own comments"
    ON public.comments FOR UPDATE
    USING (author_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));

-- ============================================================================
-- MESSAGES POLICIES
-- ============================================================================

-- Users can read their own messages
CREATE POLICY "Users can read own messages"
    ON public.messages FOR SELECT
    USING (
        sender_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
        OR receiver_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
    );

-- Users can send messages
CREATE POLICY "Users can send messages"
    ON public.messages FOR INSERT
    WITH CHECK (sender_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));

-- ============================================================================
-- OTHER SCHOOL TABLES POLICIES
-- ============================================================================

-- School events: School users can read
CREATE POLICY "School users can read events"
    ON public.school_events FOR SELECT
    USING (school_id = ANY(public.get_user_school_ids()) OR public.is_admin());

-- School progress reports: Parents and teachers can read relevant reports
CREATE POLICY "Parents and teachers can read progress reports"
    ON public.school_progress_reports FOR SELECT
    USING (
        student_id IN (
            SELECT id FROM public.school_students 
            WHERE parent_email IN (SELECT email FROM public.users WHERE auth_user_id = auth.uid())
        )
        OR school_id = ANY(public.get_user_school_ids())
        OR public.is_admin()
    );

-- Announcements: School users can read
CREATE POLICY "School users can read announcements"
    ON public.announcements FOR SELECT
    USING (school_id = ANY(public.get_user_school_ids()) OR public.is_admin());

-- Health records, medicine reminders: Parents and school staff can read
CREATE POLICY "Parents and school staff can read health records"
    ON public.health_records FOR SELECT
    USING (
        student_id IN (
            SELECT id FROM public.school_students 
            WHERE parent_email IN (SELECT email FROM public.users WHERE auth_user_id = auth.uid())
        )
        OR school_id = ANY(public.get_user_school_ids())
        OR public.is_admin()
    );

CREATE POLICY "Parents and school staff can read medicine reminders"
    ON public.medicine_reminders FOR SELECT
    USING (
        student_id IN (
            SELECT id FROM public.school_students 
            WHERE parent_email IN (SELECT email FROM public.users WHERE auth_user_id = auth.uid())
        )
        OR school_id = ANY(public.get_user_school_ids())
        OR public.is_admin()
    );

-- Payments: Users can read their own payments
CREATE POLICY "Users can read own payments"
    ON public.payments FOR SELECT
    USING (
        parent_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
        OR public.is_admin()
    );

-- School payments: Parents and school staff can read
CREATE POLICY "Parents and school staff can read school payments"
    ON public.school_payments FOR SELECT
    USING (
        student_id IN (
            SELECT id FROM public.school_students 
            WHERE parent_email IN (SELECT email FROM public.users WHERE auth_user_id = auth.uid())
        )
        OR school_id = ANY(public.get_user_school_ids())
        OR public.is_admin()
    );

-- Daily activities: School users can read
CREATE POLICY "School users can read daily activities"
    ON public.daily_activities FOR SELECT
    USING (
        student_id IN (
            SELECT id FROM public.school_students 
            WHERE parent_email IN (SELECT email FROM public.users WHERE auth_user_id = auth.uid())
        )
        OR school_id = ANY(public.get_user_school_ids())
        OR public.is_admin()
    );

-- Absence requests: Parents can manage their children's requests
CREATE POLICY "Parents can manage absence requests"
    ON public.absence_requests FOR ALL
    USING (
        student_id IN (
            SELECT id FROM public.school_students 
            WHERE parent_email IN (SELECT email FROM public.users WHERE auth_user_id = auth.uid())
        )
        OR school_id = ANY(public.get_user_school_ids())
        OR public.is_admin()
    );

-- Photo albums: School users can read
CREATE POLICY "School users can read photo albums"
    ON public.photo_albums FOR SELECT
    USING (school_id = ANY(public.get_user_school_ids()) OR public.is_admin());

-- Extracurricular activities: School users can read
CREATE POLICY "School users can read extracurricular activities"
    ON public.extracurricular_activities FOR SELECT
    USING (school_id = ANY(public.get_user_school_ids()) OR public.is_admin());

-- Surveys: School users can read
CREATE POLICY "School users can read surveys"
    ON public.surveys FOR SELECT
    USING (school_id = ANY(public.get_user_school_ids()) OR public.is_admin());

-- Homework assignments: School users can read
CREATE POLICY "School users can read homework"
    ON public.homework_assignments FOR SELECT
    USING (school_id = ANY(public.get_user_school_ids()) OR public.is_admin());

-- Class subjects: School users can read
CREATE POLICY "School users can read class subjects"
    ON public.class_subjects FOR SELECT
    USING (
        class_id IN (
            SELECT id FROM public.school_classes 
            WHERE school_id = ANY(public.get_user_school_ids())
        )
        OR public.is_admin()
    );

-- Progress report subjects: Same as progress reports
CREATE POLICY "Users can read progress subjects"
    ON public.school_progress_subjects FOR SELECT
    USING (
        progress_report_id IN (
            SELECT id FROM public.school_progress_reports
            WHERE student_id IN (
                SELECT id FROM public.school_students 
                WHERE parent_email IN (SELECT email FROM public.users WHERE auth_user_id = auth.uid())
            )
        )
        OR public.is_admin()
    );

-- Student subject overrides
CREATE POLICY "School staff can read student overrides"
    ON public.student_subject_overrides FOR SELECT
    USING (
        student_id IN (
            SELECT id FROM public.school_students 
            WHERE school_id = ANY(public.get_user_school_ids())
        )
        OR public.is_admin()
    );

-- Attendance records (marketplace)
CREATE POLICY "Users can read relevant attendance records"
    ON public.attendance_records FOR SELECT
    USING (
        student_id IN (
            SELECT id FROM public.students 
            WHERE parent_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
        )
        OR teacher_id IN (
            SELECT id FROM public.teachers 
            WHERE user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
        )
        OR public.is_admin()
    );

-- Parents table
CREATE POLICY "Users can read own parent profile"
    ON public.parents FOR SELECT
    USING (
        user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
        OR public.is_admin()
    );

CREATE POLICY "Users can update own parent profile"
    ON public.parents FOR UPDATE
    USING (user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));

-- School invitations
CREATE POLICY "School staff can manage invitations"
    ON public.school_invitations FOR ALL
    USING (
        school_id = ANY(public.get_user_school_ids())
        OR public.is_admin()
    );

-- Subscriptions
CREATE POLICY "Users can read own subscriptions"
    ON public.subscriptions FOR SELECT
    USING (user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON POLICY "Users can read own profile" ON public.users IS 'Users can only read their own profile data';
COMMENT ON POLICY "Subjects are publicly readable" ON public.subjects IS 'Subjects are publicly available for browsing';
COMMENT ON POLICY "Active teachers are publicly readable" ON public.teachers IS 'Active teachers are listed publicly for marketplace';
COMMENT ON POLICY "Users can read classes in their schools" ON public.school_classes IS 'School-scoped access to classes';

-- RLS policies complete!
-- Next: Apply functions and triggers in 003_functions_triggers.sql





