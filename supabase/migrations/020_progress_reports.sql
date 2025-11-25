-- Migration 020: Progress Reports Feature
-- Scaffolds base tables if missing, adds feature tables, helpers, and RLS

-- 0. Ensure Core Tables Exist (if migration 001 didn't run)

-- Users
create table if not exists public.users (
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
create index if not exists idx_users_auth_user_id on public.users(auth_user_id);

-- Schools
create table if not exists public.schools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    address TEXT,
    phone TEXT,
    email TEXT,
    -- location GEOGRAPHY(POINT, 4326), -- Skipping postgis dependent column to avoid extension issues if not installed
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    logo_url TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- School Teachers (referenced by helper)
create table if not exists public.school_teachers (
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

-- 1. Helper Functions
-- Check if user is an admin (or school_admin)
create or replace function public.is_admin()
returns boolean
language sql security definer stable
as $$
  select exists (
    select 1 from public.users
    where id = auth.uid()
    and role in ('admin', 'school_admin')
  );
$$;

-- Get school IDs for the current user (Admin/Teacher/Parent)
create or replace function public.get_user_school_ids()
returns uuid[]
language sql security definer stable
as $$
  select array_agg(distinct school_id)
  from (
    -- Teachers/Admins linked via school_teachers
    select school_id from public.school_teachers where user_id = auth.uid()
    union
    -- Parents linked via school_parent_students (table created below, checking existence safely?)
    -- Function body isn't validated until execution, so as long as table exists when called, it's fine.
    -- But for safety in creation order, we create tables first usually. 
    -- However, Postgres functions can be created before tables if check_function_bodies=off, 
    -- but usually better to create tables first. 
    -- I will move this function definition AFTER table creations to be safe.
    select id from public.schools where exists(select 1 from public.users where id = auth.uid() and role = 'admin')
  ) s;
$$;
-- Note: I'll redefine this function at the end to include school_parent_students logic once table exists.


-- 2. Base Tables (Scaffold if missing)

-- School Terms
create table if not exists public.school_terms(
  id uuid primary key default gen_random_uuid(),
  school_id uuid references public.schools(id) on delete cascade,
  name text not null,
  start_date date not null,
  end_date date not null,
  is_active boolean default true,
  created_at timestamptz default now()
);
create index if not exists idx_terms_school on public.school_terms(school_id);

-- Ensure school_classes exists (from 001)
create table if not exists public.school_classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    grade_level TEXT,
    academic_year TEXT,
    teacher_id UUID, 
    room_number TEXT,
    capacity INTEGER,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure school_students exists (from 001)
create table if not exists public.school_students (
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

-- Ensure school_parent_students exists (from 010)
create table if not exists public.school_parent_students (
  school_id uuid NOT NULL,
  parent_user_id uuid NOT NULL,
  student_id uuid NOT NULL,
  PRIMARY KEY (school_id, parent_user_id, student_id),
  FOREIGN KEY (school_id) REFERENCES public.schools(id),
  FOREIGN KEY (parent_user_id) REFERENCES public.users(id),
  FOREIGN KEY (student_id) REFERENCES public.school_students(id)
);


-- REDEFINE Helpers now that tables exist

create or replace function public.get_user_school_ids()
returns uuid[]
language sql security definer stable
as $$
  select array_agg(distinct school_id)
  from (
    -- Teachers/Admins linked via school_teachers
    select school_id from public.school_teachers where user_id = auth.uid()
    union
    -- Parents linked via school_parent_students
    select school_id from public.school_parent_students where parent_user_id = auth.uid()
    union
    -- Fallback: if is_admin is global or checking schools table directly (if owner_id exists)
    select id from public.schools where exists(select 1 from public.users where id = auth.uid() and role = 'admin')
  ) s;
$$;

-- Get student IDs for the current parent
create or replace function public.get_user_child_student_ids()
returns uuid[]
language sql security definer stable
as $$
  select array_agg(student_id)
  from public.school_parent_students
  where parent_user_id = auth.uid();
$$;


-- 3. Feature Tables

-- School Subjects (per school definition)
create table if not exists public.school_subjects(
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  name text not null,
  code text,
  unique(school_id, name)
);
create index if not exists idx_school_subjects_school on public.school_subjects(school_id);

-- Assessments
create table if not exists public.school_assessments(
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  class_id uuid not null references public.school_classes(id) on delete cascade,
  subject_id uuid not null references public.school_subjects(id) on delete restrict,
  title text not null,
  date date not null,
  max_score numeric not null default 100,
  term_id uuid references public.school_terms(id),
  created_at timestamptz default now()
);
create index if not exists idx_sa_school_date on public.school_assessments(school_id, date desc);
create index if not exists idx_sa_class_subject on public.school_assessments(class_id, subject_id);

-- Assessment scores
create table if not exists public.school_assessment_scores(
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.school_assessments(id) on delete cascade,
  student_id uuid not null references public.school_students(id) on delete cascade,
  score numeric not null,
  grade_letter text,
  feedback text,
  created_at timestamptz not null default now(),
  unique(assessment_id, student_id)
);
create index if not exists idx_sas_student_date on public.school_assessment_scores(student_id, created_at);
create index if not exists idx_sas_assessment on public.school_assessment_scores(assessment_id);

-- Released progress reports (snapshot)
-- Note: Dropping old table if exists from 001 to match new schema requirements
drop table if exists public.school_progress_reports cascade;

create table public.school_progress_reports(
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  class_id uuid not null references public.school_classes(id) on delete cascade,
  student_id uuid not null references public.school_students(id) on delete cascade,
  term_id uuid references public.school_terms(id),
  range_start date not null,
  range_end date not null,
  avg_score numeric,
  avg_grade_letter text,
  improvement_pct numeric,
  risk_flag boolean default false,
  released_at timestamptz not null default now(),
  created_at timestamptz default now()
);
create index idx_pr_school_released on public.school_progress_reports(school_id, released_at desc);
create index idx_pr_class_student on public.school_progress_reports(class_id, student_id);

-- Report meta tables
create table if not exists public.school_report_comments(
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.school_progress_reports(id) on delete cascade,
  subject_id uuid references public.school_subjects(id),
  teacher_id uuid references public.school_teachers(id),
  comment text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.school_report_strengths(
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.school_progress_reports(id) on delete cascade,
  label text not null,
  detail text
);

create table if not exists public.school_report_focus_areas(
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.school_progress_reports(id) on delete cascade,
  label text not null,
  detail text
);


-- 4. RLS

alter table public.school_assessments enable row level security;
alter table public.school_assessment_scores enable row level security;
alter table public.school_progress_reports enable row level security;
alter table public.school_report_comments enable row level security;
alter table public.school_report_strengths enable row level security;
alter table public.school_report_focus_areas enable row level security;
alter table public.school_subjects enable row level security;
alter table public.school_terms enable row level security;

-- Admin: full access within school
create policy pr_admin_assess_all on public.school_assessments
  for all using (school_id = any(get_user_school_ids()) and is_admin())
  with check (school_id = any(get_user_school_ids()) and is_admin());

create policy pr_admin_scores_all on public.school_assessment_scores
  for all using (exists(select 1 from public.school_assessments a where a.id = school_assessment_scores.assessment_id and a.school_id = any(get_user_school_ids()) and is_admin()))
  with check (true);

create policy pr_admin_reports_all on public.school_progress_reports
  for all using (school_id = any(get_user_school_ids()) and is_admin())
  with check (school_id = any(get_user_school_ids()) and is_admin());

create policy pr_admin_meta_all on public.school_report_comments
  for all using (exists(select 1 from public.school_progress_reports r where r.id = report_id and r.school_id = any(get_user_school_ids()) and is_admin()))
  with check (true);

create policy pr_admin_strengths_all on public.school_report_strengths
  for all using (exists(select 1 from public.school_progress_reports r where r.id = report_id and r.school_id = any(get_user_school_ids()) and is_admin()))
  with check (true);

create policy pr_admin_focus_all on public.school_report_focus_areas
  for all using (exists(select 1 from public.school_progress_reports r where r.id = report_id and r.school_id = any(get_user_school_ids()) and is_admin()))
  with check (true);
  
-- School Subjects/Terms RLS
create policy admin_subjects_all on public.school_subjects
  for all using (school_id = any(get_user_school_ids()) and is_admin());

create policy admin_terms_all on public.school_terms
  for all using (school_id = any(get_user_school_ids()) and is_admin());

-- Parents: read-only for their child

create policy pr_parent_scores_select on public.school_assessment_scores
  for select using (student_id = any(coalesce(get_user_child_student_ids(), array[]::uuid[])));

create policy pr_parent_reports_select on public.school_progress_reports
  for select using (student_id = any(coalesce(get_user_child_student_ids(), array[]::uuid[])));

create policy pr_parent_meta_select on public.school_report_comments
  for select using (exists(select 1 from public.school_progress_reports r where r.id = report_id and r.student_id = any(coalesce(get_user_child_student_ids(), array[]::uuid[]))));

create policy pr_parent_strengths_select on public.school_report_strengths
  for select using (exists(select 1 from public.school_progress_reports r where r.id = report_id and r.student_id = any(coalesce(get_user_child_student_ids(), array[]::uuid[]))));

create policy pr_parent_focus_select on public.school_report_focus_areas
  for select using (exists(select 1 from public.school_progress_reports r where r.id = report_id and r.student_id = any(coalesce(get_user_child_student_ids(), array[]::uuid[]))));
  
create policy parent_subjects_select on public.school_subjects
    for select using (school_id = any(get_user_school_ids())); -- Parents can see all subjects in their school

create policy parent_terms_select on public.school_terms
    for select using (school_id = any(get_user_school_ids()));
