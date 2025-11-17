-- ============================================================================
-- Supabase Migration 001: Initial Schema
-- Description: Complete schema migration from Airtable to Postgres
-- Tables: 35+ tables covering Schools, Marketplace, and Social features
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- ============================================================================
-- DOMAIN: User Management & Authentication
-- ============================================================================

-- User profiles (linked to auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    role TEXT CHECK (role IN ('admin', 'school_admin', 'teacher', 'parent', 'student')) DEFAULT 'parent',
    avatar TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_auth_user_id ON public.users(auth_user_id);
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);

-- ============================================================================
-- DOMAIN: Schools Management
-- ============================================================================

-- Schools
CREATE TABLE IF NOT EXISTS public.schools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    address TEXT,
    phone TEXT,
    email TEXT,
    location GEOGRAPHY(POINT, 4326),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    logo_url TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_schools_location ON public.schools USING GIST(location);
CREATE INDEX idx_schools_status ON public.schools(status);

-- School Classes
CREATE TABLE IF NOT EXISTS public.school_classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    grade_level TEXT,
    academic_year TEXT,
    teacher_id UUID, -- Will be linked after teachers table
    room_number TEXT,
    capacity INTEGER,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_school_classes_school_id ON public.school_classes(school_id);
CREATE INDEX idx_school_classes_teacher_id ON public.school_classes(teacher_id);

-- School Teachers
CREATE TABLE IF NOT EXISTS public.school_teachers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    subjects TEXT[],
    qualifications TEXT,
    hire_date DATE,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_school_teachers_school_id ON public.school_teachers(school_id);
CREATE INDEX idx_school_teachers_user_id ON public.school_teachers(user_id);
CREATE INDEX idx_school_teachers_email ON public.school_teachers(email);

-- Add foreign key to school_classes now that teachers table exists
ALTER TABLE public.school_classes
ADD CONSTRAINT fk_school_classes_teacher
FOREIGN KEY (teacher_id) REFERENCES public.school_teachers(id) ON DELETE SET NULL;

-- School Students
CREATE TABLE IF NOT EXISTS public.school_students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    class_id UUID REFERENCES public.school_classes(id) ON DELETE SET NULL,
    student_number TEXT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    date_of_birth DATE,
    gender TEXT,
    parent_name TEXT,
    parent_email TEXT,
    parent_phone TEXT,
    address TEXT,
    photo_url TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_school_students_school_id ON public.school_students(school_id);
CREATE INDEX idx_school_students_class_id ON public.school_students(class_id);
CREATE INDEX idx_school_students_parent_email ON public.school_students(parent_email);

-- School Attendance
CREATE TABLE IF NOT EXISTS public.school_attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.school_students(id) ON DELETE CASCADE,
    class_id UUID REFERENCES public.school_classes(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    status TEXT CHECK (status IN ('present', 'absent', 'late', 'excused')) DEFAULT 'present',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, date)
);

CREATE INDEX idx_school_attendance_school_id ON public.school_attendance(school_id);
CREATE INDEX idx_school_attendance_student_id ON public.school_attendance(student_id);
CREATE INDEX idx_school_attendance_date ON public.school_attendance(date);

-- School Events
CREATE TABLE IF NOT EXISTS public.school_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    event_date DATE,
    start_time TIME,
    end_time TIME,
    location TEXT,
    organizer TEXT,
    status TEXT DEFAULT 'scheduled',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_school_events_school_id ON public.school_events(school_id);
CREATE INDEX idx_school_events_event_date ON public.school_events(event_date);

-- School Progress Reports
CREATE TABLE IF NOT EXISTS public.school_progress_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.school_students(id) ON DELETE CASCADE,
    class_id UUID REFERENCES public.school_classes(id) ON DELETE SET NULL,
    term TEXT,
    academic_year TEXT,
    overall_grade TEXT,
    comments TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_school_progress_reports_school_id ON public.school_progress_reports(school_id);
CREATE INDEX idx_school_progress_reports_student_id ON public.school_progress_reports(student_id);

-- School Progress Subjects (detailed grades per subject)
CREATE TABLE IF NOT EXISTS public.school_progress_subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    progress_report_id UUID REFERENCES public.school_progress_reports(id) ON DELETE CASCADE,
    subject_name TEXT NOT NULL,
    grade TEXT,
    score DECIMAL(5, 2),
    comments TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_school_progress_subjects_report_id ON public.school_progress_subjects(progress_report_id);

-- School Invitations
CREATE TABLE IF NOT EXISTS public.school_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT CHECK (role IN ('teacher', 'admin', 'parent')),
    token TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'pending',
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_school_invitations_school_id ON public.school_invitations(school_id);
CREATE INDEX idx_school_invitations_email ON public.school_invitations(email);
CREATE INDEX idx_school_invitations_token ON public.school_invitations(token);

-- School Payments
CREATE TABLE IF NOT EXISTS public.school_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.school_students(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    currency TEXT DEFAULT 'VND',
    payment_type TEXT,
    payment_date DATE,
    status TEXT DEFAULT 'pending',
    stripe_payment_id TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_school_payments_school_id ON public.school_payments(school_id);
CREATE INDEX idx_school_payments_student_id ON public.school_payments(student_id);
CREATE INDEX idx_school_payments_status ON public.school_payments(status);

-- ============================================================================
-- DOMAIN: Marketplace (Tutoring Platform)
-- ============================================================================

-- Subjects
CREATE TABLE IF NOT EXISTS public.subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    name_vi TEXT,
    icon TEXT,
    category TEXT,
    description TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subjects_status ON public.subjects(status);
CREATE INDEX idx_subjects_category ON public.subjects(category);

-- Marketplace Teachers
CREATE TABLE IF NOT EXISTS public.teachers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT,
    avatar TEXT,
    qualifications TEXT,
    experience INTEGER DEFAULT 0,
    hourly_rate INTEGER,
    rating DECIMAL(3, 2),
    review_count INTEGER DEFAULT 0,
    description TEXT,
    languages TEXT[],
    location GEOGRAPHY(POINT, 4326),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    address TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_teachers_user_id ON public.teachers(user_id);
CREATE INDEX idx_teachers_email ON public.teachers(email);
CREATE INDEX idx_teachers_location ON public.teachers USING GIST(location);
CREATE INDEX idx_teachers_status ON public.teachers(status);

-- Teacher Subjects (many-to-many)
CREATE TABLE IF NOT EXISTS public.teacher_subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID REFERENCES public.teachers(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(teacher_id, subject_id)
);

CREATE INDEX idx_teacher_subjects_teacher_id ON public.teacher_subjects(teacher_id);
CREATE INDEX idx_teacher_subjects_subject_id ON public.teacher_subjects(subject_id);

-- Marketplace Students
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    age INTEGER,
    grade TEXT,
    subjects_interest TEXT[],
    address TEXT,
    phone TEXT,
    email TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_students_parent_id ON public.students(parent_id);
CREATE INDEX idx_students_status ON public.students(status);

-- Marketplace Parents
CREATE TABLE IF NOT EXISTS public.parents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT,
    address TEXT,
    payment_method TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_parents_user_id ON public.parents(user_id);
CREATE INDEX idx_parents_email ON public.parents(email);

-- Bookings
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    teacher_id UUID REFERENCES public.teachers(id) ON DELETE SET NULL,
    student_id UUID REFERENCES public.students(id) ON DELETE SET NULL,
    subject TEXT,
    date DATE NOT NULL,
    time TIME NOT NULL,
    duration INTEGER DEFAULT 60,
    notes TEXT,
    status TEXT DEFAULT 'pending',
    payment_status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bookings_parent_id ON public.bookings(parent_id);
CREATE INDEX idx_bookings_teacher_id ON public.bookings(teacher_id);
CREATE INDEX idx_bookings_student_id ON public.bookings(student_id);
CREATE INDEX idx_bookings_date ON public.bookings(date);
CREATE INDEX idx_bookings_status ON public.bookings(status);

-- Reviews
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID REFERENCES public.teachers(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.students(id) ON DELETE SET NULL,
    parent_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reviews_teacher_id ON public.reviews(teacher_id);
CREATE INDEX idx_reviews_student_id ON public.reviews(student_id);
CREATE INDEX idx_reviews_parent_id ON public.reviews(parent_id);

-- Payments
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
    parent_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    teacher_id UUID REFERENCES public.teachers(id) ON DELETE SET NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency TEXT DEFAULT 'VND',
    stripe_payment_id TEXT,
    stripe_payment_intent_id TEXT,
    status TEXT DEFAULT 'pending',
    payment_method TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payments_booking_id ON public.payments(booking_id);
CREATE INDEX idx_payments_parent_id ON public.payments(parent_id);
CREATE INDEX idx_payments_status ON public.payments(status);
CREATE INDEX idx_payments_stripe_payment_intent_id ON public.payments(stripe_payment_intent_id);

-- ============================================================================
-- DOMAIN: Social Features
-- ============================================================================

-- Posts
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    author_name TEXT,
    author_role TEXT,
    author_avatar TEXT,
    content_text TEXT,
    content_media_type TEXT,
    content_media_url TEXT,
    content_media_thumbnail TEXT,
    post_type TEXT,
    subjects TEXT[],
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    saves_count INTEGER DEFAULT 0,
    privacy TEXT DEFAULT 'public',
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_posts_author_id ON public.posts(author_id);
CREATE INDEX idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX idx_posts_status ON public.posts(status);

-- Comments
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    author_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    author_name TEXT,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_comments_post_id ON public.comments(post_id);
CREATE INDEX idx_comments_author_id ON public.comments(author_id);

-- Messages
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX idx_messages_receiver_id ON public.messages(receiver_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at DESC);

-- Announcements
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    author_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    target_audience TEXT[],
    priority TEXT DEFAULT 'normal',
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_announcements_school_id ON public.announcements(school_id);
CREATE INDEX idx_announcements_created_at ON public.announcements(created_at DESC);

-- ============================================================================
-- DOMAIN: Additional School Features
-- ============================================================================

-- Daily Activities
CREATE TABLE IF NOT EXISTS public.daily_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    class_id UUID REFERENCES public.school_classes(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.school_students(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    activity_type TEXT,
    description TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_daily_activities_school_id ON public.daily_activities(school_id);
CREATE INDEX idx_daily_activities_student_id ON public.daily_activities(student_id);
CREATE INDEX idx_daily_activities_date ON public.daily_activities(date);

-- Absence Requests
CREATE TABLE IF NOT EXISTS public.absence_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.school_students(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT,
    status TEXT DEFAULT 'pending',
    approved_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_absence_requests_school_id ON public.absence_requests(school_id);
CREATE INDEX idx_absence_requests_student_id ON public.absence_requests(student_id);
CREATE INDEX idx_absence_requests_status ON public.absence_requests(status);

-- Health Records
CREATE TABLE IF NOT EXISTS public.health_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.school_students(id) ON DELETE CASCADE,
    record_type TEXT,
    description TEXT,
    recorded_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_health_records_school_id ON public.health_records(school_id);
CREATE INDEX idx_health_records_student_id ON public.health_records(student_id);

-- Medicine Reminders
CREATE TABLE IF NOT EXISTS public.medicine_reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.school_students(id) ON DELETE CASCADE,
    medicine_name TEXT NOT NULL,
    dosage TEXT,
    frequency TEXT,
    start_date DATE,
    end_date DATE,
    notes TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_medicine_reminders_school_id ON public.medicine_reminders(school_id);
CREATE INDEX idx_medicine_reminders_student_id ON public.medicine_reminders(student_id);

-- Photo Albums
CREATE TABLE IF NOT EXISTS public.photo_albums (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    photos JSONB,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_photo_albums_school_id ON public.photo_albums(school_id);

-- Extracurricular Activities
CREATE TABLE IF NOT EXISTS public.extracurricular_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    instructor TEXT,
    schedule TEXT,
    max_participants INTEGER,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_extracurricular_activities_school_id ON public.extracurricular_activities(school_id);

-- Surveys
CREATE TABLE IF NOT EXISTS public.surveys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    questions JSONB,
    target_audience TEXT[],
    start_date DATE,
    end_date DATE,
    status TEXT DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_surveys_school_id ON public.surveys(school_id);
CREATE INDEX idx_surveys_status ON public.surveys(status);

-- Subscriptions
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    plan_type TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    start_date DATE,
    end_date DATE,
    stripe_subscription_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);

-- Homework Assignments
CREATE TABLE IF NOT EXISTS public.homework_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    class_id UUID REFERENCES public.school_classes(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    due_date DATE,
    subject TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_homework_assignments_school_id ON public.homework_assignments(school_id);
CREATE INDEX idx_homework_assignments_class_id ON public.homework_assignments(class_id);

-- Attendance Records (marketplace/tutoring)
CREATE TABLE IF NOT EXISTS public.attendance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES public.teachers(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status TEXT DEFAULT 'present',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_attendance_records_booking_id ON public.attendance_records(booking_id);
CREATE INDEX idx_attendance_records_student_id ON public.attendance_records(student_id);

-- Class Subjects (for school classes)
CREATE TABLE IF NOT EXISTS public.class_subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID REFERENCES public.school_classes(id) ON DELETE CASCADE,
    subject_name TEXT NOT NULL,
    teacher_id UUID REFERENCES public.school_teachers(id) ON DELETE SET NULL,
    hours_per_week INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_class_subjects_class_id ON public.class_subjects(class_id);
CREATE INDEX idx_class_subjects_teacher_id ON public.class_subjects(teacher_id);

-- Student Subject Overrides (for individual student customization)
CREATE TABLE IF NOT EXISTS public.student_subject_overrides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.school_students(id) ON DELETE CASCADE,
    subject_name TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_student_subject_overrides_student_id ON public.student_subject_overrides(student_id);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE public.users IS 'User profiles linked to Supabase Auth';
COMMENT ON TABLE public.schools IS 'Schools in the system';
COMMENT ON TABLE public.school_classes IS 'Classes within schools';
COMMENT ON TABLE public.school_teachers IS 'Teachers employed by schools';
COMMENT ON TABLE public.school_students IS 'Students enrolled in schools';
COMMENT ON TABLE public.teachers IS 'Teachers in the marketplace/tutoring platform';
COMMENT ON TABLE public.students IS 'Students using the tutoring platform';
COMMENT ON TABLE public.bookings IS 'Tutoring session bookings';
COMMENT ON TABLE public.posts IS 'Social media posts in the community';

-- ============================================================================
-- INITIAL DATA - Default Subjects
-- ============================================================================

INSERT INTO public.subjects (name, name_vi, category, status) VALUES
    ('Mathematics', 'Toán học', 'academic', 'active'),
    ('English', 'Tiếng Anh', 'language', 'active'),
    ('Physics', 'Vật lý', 'science', 'active'),
    ('Chemistry', 'Hóa học', 'science', 'active'),
    ('Literature', 'Văn học', 'humanities', 'active'),
    ('Biology', 'Sinh học', 'science', 'active'),
    ('History', 'Lịch sử', 'humanities', 'active'),
    ('Geography', 'Địa lý', 'humanities', 'active'),
    ('Computer Science', 'Tin học', 'technology', 'active'),
    ('Music', 'Âm nhạc', 'arts', 'active'),
    ('Art', 'Mỹ thuật', 'arts', 'active'),
    ('Sports', 'Thể thao', 'physical', 'active'),
    ('Piano', 'Piano', 'music', 'active'),
    ('Guitar', 'Guitar', 'music', 'active'),
    ('Swimming', 'Bơi lội', 'sports', 'active'),
    ('Football', 'Bóng đá', 'sports', 'active'),
    ('Basketball', 'Bóng rổ', 'sports', 'active'),
    ('Drawing', 'Vẽ', 'arts', 'active')
ON CONFLICT DO NOTHING;

-- Migration complete!
-- Next: Apply RLS policies in 002_rls_policies.sql





