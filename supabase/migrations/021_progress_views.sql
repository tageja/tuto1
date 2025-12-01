-- Migration 021: Progress Reports RPCs and Views

-- 1. School-level KPIs for a window
create or replace function public.pr_school_kpis(p_school uuid, p_from date, p_to date)
returns table(total_students int, avg_grade numeric, improvement_rate numeric, at_risk_count int)
language sql stable security definer as $$
  with base as (
    select s.id as student_id
    from public.school_students s
    where s.school_id = p_school
    and s.status = 'active'
  ),
  scores as (
    select sas.student_id, sas.score, sas.created_at::date as d
    from public.school_assessment_scores sas
    join public.school_assessments a on a.id = sas.assessment_id and a.school_id = p_school
    where sas.created_at::date between p_from and p_to
  ),
  current_avg as (select avg(score) as v from scores),
  prev_avg as (
    select avg(sas.score) as v
    from public.school_assessment_scores sas
    join public.school_assessments a on a.id = sas.assessment_id and a.school_id = p_school
    where sas.created_at::date between (p_from - (p_to - p_from)) and (p_from - 1)
  ),
  risk as (
    select student_id
    from scores
    group by student_id
    having avg(score) < 60
  )
  select
    (select count(*) from base)::int,
    coalesce((select v from current_avg),0)::numeric,
    case when coalesce((select v from prev_avg),0)=0 then 0
         else round(100.0 * ((select v from current_avg) - (select v from prev_avg)) / nullif((select v from prev_avg),0), 1) end::numeric,
    (select count(*) from risk)::int;
$$;


-- 2. Class overview by subject
create or replace function public.pr_class_overview(p_school uuid, p_class uuid, p_from date, p_to date)
returns table(subject text, avg_score numeric, change numeric)
language sql stable security definer as $$
  with cur as (
    select sub.name as subject, avg(sas.score) as v
    from public.school_assessment_scores sas
    join public.school_assessments a on a.id = sas.assessment_id and a.school_id = p_school and a.class_id = p_class
    join public.school_subjects sub on sub.id = a.subject_id
    where sas.created_at::date between p_from and p_to
    group by sub.name
  ),
  prev as (
    select sub.name as subject, avg(sas.score) as v
    from public.school_assessment_scores sas
    join public.school_assessments a on a.id = sas.assessment_id and a.school_id = p_school and a.class_id = p_class
    join public.school_subjects sub on sub.id = a.subject_id
    where sas.created_at::date between (p_from - (p_to - p_from)) and (p_from - 1)
    group by sub.name
  )
  select c.subject, round(c.v,1) as avg_score, round(coalesce(c.v - p.v,0),1) as change
  from cur c left join prev p on p.subject = c.subject
  order by c.subject;
$$;


-- 3. Student timeline (for charts)
create or replace function public.pr_student_timeline(p_school uuid, p_student uuid, p_from date, p_to date)
returns table(d date, subject text, score numeric)
language sql stable security definer as $$
  select sas.created_at::date as d, sub.name as subject, sas.score
  from public.school_assessment_scores sas
  join public.school_assessments a on a.id = sas.assessment_id and a.school_id = p_school
  join public.school_subjects sub on sub.id = a.subject_id
  where sas.student_id = p_student
    and sas.created_at::date between p_from and p_to
  order by d asc;
$$;


-- 4. Recent released reports (optionally class-scoped)
create or replace function public.pr_recent_reports(p_school uuid, p_class uuid default null, p_limit int default 20)
returns table(
  report_id uuid, 
  class_id uuid, 
  student_id uuid, 
  student_name text,
  released_at timestamptz,
  avg_score numeric,
  improvement_pct numeric
)
language sql stable security definer as $$
  select 
    r.id, 
    r.class_id, 
    r.student_id, 
    (s.first_name || ' ' || s.last_name) as student_name,
    r.released_at,
    r.avg_score,
    r.improvement_pct
  from public.school_progress_reports r
  join public.school_students s on s.id = r.student_id
  where r.school_id = p_school
    and (p_class is null or r.class_id = p_class)
  order by r.released_at desc
  limit p_limit;
$$;


-- 5. Generate reports in bulk for a class + window (returns inserted ids)
create or replace function public.pr_generate_reports(p_school uuid, p_class uuid, p_from date, p_to date)
returns setof uuid
language plpgsql security definer as $$
declare
  r_id uuid;
begin
  -- For each student in class, compute snapshot and insert
  for r_id in
    insert into public.school_progress_reports (
      school_id, class_id, student_id, range_start, range_end, 
      avg_score, improvement_pct, risk_flag, released_at
    )
    select
      p_school, p_class, s.id,
      p_from, p_to,
      round(coalesce(avg(sas.score),0), 1) as avg_score,
      0 as improvement_pct,  -- TODO: Calculate real improvement vs prev period
      (avg(sas.score) < 60) as risk_flag,
      now()
    from public.school_students s
    left join public.school_assessment_scores sas
      on sas.student_id = s.id
      and sas.created_at::date between p_from and p_to
    where s.class_id = p_class
    and s.status = 'active'
    group by s.id
    returning id
  loop
    return next r_id;
  end loop;
  
  return;
end $$;


