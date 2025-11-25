-- Seed Data for Progress Reports
-- Run this via execute_sql

do $$
declare
  v_school_id uuid;
  v_term_id uuid;
  v_class_id uuid;
  v_math_id uuid;
  v_eng_id uuid;
  v_write_id uuid;
  v_student_id uuid;
  v_assessment_id uuid;
  v_report_id uuid;
  v_date date;
  i int;
  j int;
  v_student_ids uuid[];
  v_score numeric;
begin
  -- 1. Create School (if needed)
  if not exists (select 1 from public.schools where name = 'Tuto Demo School') then
    insert into public.schools (name, status) values ('Tuto Demo School', 'active') returning id into v_school_id;
  else
    select id into v_school_id from public.schools where name = 'Tuto Demo School' limit 1;
  end if;

  -- 2. Create Term
  insert into public.school_terms (school_id, name, start_date, end_date)
  values (v_school_id, 'Fall 2024', now() - interval '6 months', now() + interval '6 months')
  on conflict do nothing;
  
  select id into v_term_id from public.school_terms where school_id = v_school_id limit 1;

  -- 3. Create Class
  insert into public.school_classes (school_id, name, grade_level, status)
  values (v_school_id, 'Grade 5A', '5', 'active')
  returning id into v_class_id;
  
  -- 4. Create Subjects
  insert into public.school_subjects (school_id, name, code) values (v_school_id, 'Mathematics', 'MATH') on conflict(school_id, name) do update set code = 'MATH' returning id into v_math_id;
  insert into public.school_subjects (school_id, name, code) values (v_school_id, 'English', 'ENG') on conflict(school_id, name) do update set code = 'ENG' returning id into v_eng_id;
  insert into public.school_subjects (school_id, name, code) values (v_school_id, 'Writing', 'WRT') on conflict(school_id, name) do update set code = 'WRT' returning id into v_write_id;

  -- 5. Create Students (20)
  for i in 1..20 loop
    insert into public.school_students (school_id, class_id, first_name, last_name, student_number)
    values (v_school_id, v_class_id, 'Student', 'No. ' || i, 'ST-' || i)
    returning id into v_student_id;
    
    v_student_ids := array_append(v_student_ids, v_student_id);
  end loop;

  -- 6. Generate Assessments & Scores (Past 12 weeks)
  -- Math: Weekly
  for i in 0..11 loop
    v_date := (now() - (i * interval '1 week'))::date;
    
    -- Math Assessment
    insert into public.school_assessments (school_id, class_id, subject_id, title, date, max_score, term_id)
    values (v_school_id, v_class_id, v_math_id, 'Math Quiz ' || (12-i), v_date, 100, v_term_id)
    returning id into v_assessment_id;
    
    -- Scores
    foreach v_student_id in array v_student_ids loop
       v_score := floor(random() * 40 + 60); -- 60-100
       if random() < 0.1 then v_score := floor(random() * 50); end if; -- Occasional fail
       
       insert into public.school_assessment_scores (assessment_id, student_id, score, grade_letter)
       values (v_assessment_id, v_student_id, v_score, case when v_score >= 90 then 'A' when v_score >= 80 then 'B' when v_score >= 70 then 'C' else 'F' end);
    end loop;

    -- English Assessment (Bi-weekly)
    if i % 2 = 0 then
        insert into public.school_assessments (school_id, class_id, subject_id, title, date, max_score, term_id)
        values (v_school_id, v_class_id, v_eng_id, 'English Essay ' || (6 - (i/2)), v_date, 100, v_term_id)
        returning id into v_assessment_id;
        
        foreach v_student_id in array v_student_ids loop
           v_score := floor(random() * 30 + 70); 
           insert into public.school_assessment_scores (assessment_id, student_id, score, grade_letter)
           values (v_assessment_id, v_student_id, v_score, case when v_score >= 90 then 'A' when v_score >= 80 then 'B' else 'C' end);
        end loop;
    end if;
  end loop;

  -- 7. Generate Released Reports (1 month ago)
  v_date := (now() - interval '1 month')::date;
  
  foreach v_student_id in array v_student_ids loop
    insert into public.school_progress_reports (
      school_id, class_id, student_id, term_id, range_start, range_end, avg_score, risk_flag, released_at
    ) values (
      v_school_id, v_class_id, v_student_id, v_term_id, 
      (v_date - interval '3 months')::date, v_date, 
      85.5, false, now() - interval '2 days'
    ) returning id into v_report_id;
    
    -- Comments
    insert into public.school_report_comments (report_id, comment)
    values (v_report_id, 'Making good progress, keep it up!');
    
    -- Strengths
    insert into public.school_report_strengths (report_id, label) values (v_report_id, 'Participation');
  end loop;

end $$;

