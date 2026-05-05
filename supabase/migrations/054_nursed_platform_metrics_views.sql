-- ============================================================
-- NurseEd: Platform-level metrics views + consolidated function
-- Migration 054 — powers /admin/metrics dashboard (Agent Z)
-- ============================================================

-- 1. 12-week active-user series (one row per ISO week, last 12 weeks)
CREATE OR REPLACE VIEW nursed_platform_active_weekly AS
SELECT
  date_trunc('week', last_active)::date AS week_start,
  COUNT(DISTINCT user_id)::int          AS active_learners
FROM nursed_progress
WHERE last_active >= NOW() - INTERVAL '12 weeks'
GROUP BY 1
ORDER BY 1;

-- 2. Composite rating snapshot from lesson surveys
CREATE OR REPLACE VIEW nursed_platform_rating_snapshot AS
SELECT
  ROUND(AVG(q1_animation)::numeric, 2)  AS avg_q1_animation,
  ROUND(AVG(q2_variety)::numeric, 2)    AS avg_q2_variety,
  ROUND(AVG(q3_usefulness)::numeric, 2) AS avg_q3_usefulness,
  ROUND(AVG(q4_confidence)::numeric, 2) AS avg_q4_confidence,
  ROUND(AVG(q5_continue)::numeric, 2)   AS avg_q5_continue,
  ROUND(AVG(
    (q1_animation + q2_variety + q3_usefulness + q4_confidence + q5_continue) / 5.0
  )::numeric, 2)                        AS avg_lesson_composite,
  COUNT(*)::int                         AS total_lesson_feedback_rows
FROM nursed_lesson_feedback;

-- Views inherit RLS from underlying tables; service-role queries see everything.
GRANT SELECT ON nursed_platform_active_weekly  TO authenticated;
GRANT SELECT ON nursed_platform_rating_snapshot TO authenticated;

-- ============================================================
-- 3. Consolidated metrics function — one DB round trip for all
--    metrics on the /admin/metrics page.
--    Called via: supabase.rpc('nursed_get_platform_metrics')
--
-- NOTE: Streak data is sourced from nursed_progress.streak_days
--   (per-lesson streak counter). nursed_profiles does not yet
--   have dedicated streak_current/streak_longest columns.
--   TODO: when migration adds streak columns to nursed_profiles,
--   update this function to use those for more accurate tracking.
-- ============================================================
CREATE OR REPLACE FUNCTION nursed_get_platform_metrics()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  v_wau              integer;
  v_mau              integer;
  v_prev_wau         integer;
  v_growth_wau       numeric;
  v_trend            jsonb;
  v_q1               numeric;
  v_q2               numeric;
  v_q3               numeric;
  v_q4               numeric;
  v_q5               numeric;
  v_lesson_composite numeric;
  v_lesson_count     integer;
  v_peer_avg         numeric;
  v_peer_count       integer;
  v_streak_pct       numeric;
  v_longest          integer;
  v_avg_sessions     numeric;
  v_total_learners   integer;
  v_total_recordings integer;
  v_total_completed  integer;
  v_total_courses    integer;
BEGIN
  -- 1) WAU (last 7 days)
  SELECT COUNT(DISTINCT user_id)::int
    INTO v_wau
  FROM nursed_progress
  WHERE last_active >= NOW() - INTERVAL '7 days';

  -- 2) MAU (last 30 days)
  SELECT COUNT(DISTINCT user_id)::int
    INTO v_mau
  FROM nursed_progress
  WHERE last_active >= NOW() - INTERVAL '30 days';

  -- 3) Previous WAU for growth %
  SELECT COUNT(DISTINCT user_id)::int
    INTO v_prev_wau
  FROM nursed_progress
  WHERE last_active >= NOW() - INTERVAL '14 days'
    AND last_active <  NOW() - INTERVAL '7 days';

  IF v_prev_wau = 0 THEN
    v_growth_wau := 0;
  ELSE
    v_growth_wau := ROUND(((v_wau - v_prev_wau)::numeric / v_prev_wau) * 100, 1);
  END IF;

  -- 4) 12-week weekly trend
  SELECT jsonb_agg(
    jsonb_build_object(
      'weekStart',      week_start,
      'activeLearners', active_learners
    )
    ORDER BY week_start
  )
    INTO v_trend
  FROM (
    SELECT
      date_trunc('week', last_active)::date AS week_start,
      COUNT(DISTINCT user_id)::int          AS active_learners
    FROM nursed_progress
    WHERE last_active >= NOW() - INTERVAL '12 weeks'
    GROUP BY 1
  ) trend_sub;

  -- 5) Lesson feedback ratings
  SELECT
    ROUND(AVG(q1_animation)::numeric,  2),
    ROUND(AVG(q2_variety)::numeric,    2),
    ROUND(AVG(q3_usefulness)::numeric, 2),
    ROUND(AVG(q4_confidence)::numeric, 2),
    ROUND(AVG(q5_continue)::numeric,   2),
    ROUND(AVG(
      (q1_animation + q2_variety + q3_usefulness + q4_confidence + q5_continue) / 5.0
    )::numeric, 2),
    COUNT(*)::int
    INTO v_q1, v_q2, v_q3, v_q4, v_q5, v_lesson_composite, v_lesson_count
  FROM nursed_lesson_feedback;

  -- 6) Peer audio ratings
  SELECT
    ROUND(AVG(rating)::numeric, 2),
    COUNT(*)::int
    INTO v_peer_avg, v_peer_count
  FROM nursed_peer_reviews;

  -- 7) Streak engagement — max streak_days per learner
  SELECT
    ROUND(
      COUNT(*) FILTER (WHERE max_streak >= 3)::numeric
        / NULLIF(COUNT(*), 0) * 100,
      1
    ),
    COALESCE(MAX(max_streak), 0)::int
    INTO v_streak_pct, v_longest
  FROM (
    SELECT user_id, MAX(streak_days) AS max_streak
    FROM nursed_progress
    GROUP BY user_id
  ) streak_sub;

  -- 8) Avg active days per learner (last 30 days)
  SELECT ROUND(AVG(distinct_days)::numeric, 1)
    INTO v_avg_sessions
  FROM (
    SELECT user_id, COUNT(DISTINCT DATE(last_active)) AS distinct_days
    FROM nursed_progress
    WHERE last_active >= NOW() - INTERVAL '30 days'
    GROUP BY user_id
  ) sessions_sub;

  -- 9-12) Fast facts
  SELECT COUNT(*)::int INTO v_total_learners   FROM nursed_profiles   WHERE role = 'learner';
  SELECT COUNT(*)::int INTO v_total_recordings FROM nursed_submissions WHERE type = 'recording';
  SELECT COUNT(*)::int INTO v_total_completed  FROM nursed_progress   WHERE completed = true;
  SELECT COUNT(*)::int INTO v_total_courses    FROM nursed_courses     WHERE published = true;

  RETURN jsonb_build_object(
    'activeLearners', jsonb_build_object(
      'wau',         COALESCE(v_wau, 0),
      'mau',         COALESCE(v_mau, 0),
      'growthWau',   COALESCE(v_growth_wau, 0),
      'weeklyTrend', COALESCE(v_trend, '[]'::jsonb)
    ),
    'rating', jsonb_build_object(
      'lessonAverage',           v_lesson_composite,
      'peerAverage',             v_peer_avg,
      'breakdown', jsonb_build_object(
        'q1_animation',  v_q1,
        'q2_variety',    v_q2,
        'q3_usefulness', v_q3,
        'q4_confidence', v_q4,
        'q5_continue',   v_q5
      ),
      'totalLessonFeedbackRows', COALESCE(v_lesson_count, 0),
      'totalPeerReviewRows',     COALESCE(v_peer_count, 0)
    ),
    'engagement', jsonb_build_object(
      'activeStreakPct',     COALESCE(v_streak_pct, 0),
      'longestStreakRecord', COALESCE(v_longest, 0),
      'avgSessionsPerUser', COALESCE(v_avg_sessions, 0)
    ),
    'fastFacts', jsonb_build_object(
      'totalLearners',         COALESCE(v_total_learners,   0),
      'totalRecordings',       COALESCE(v_total_recordings, 0),
      'totalLessonsCompleted', COALESCE(v_total_completed,  0),
      'totalCoursesPublished', COALESCE(v_total_courses,    0)
    )
  );
END;
$$;

-- Allow authenticated role to call the function
GRANT EXECUTE ON FUNCTION nursed_get_platform_metrics() TO authenticated;

-- ============================================================
-- Extension 054b: add platform login counts to the function
-- Uses auth.users.last_sign_in_at joined to nursed_profiles.
-- "This week/month" = users whose most recent login falls within
-- the window — accurate for current rolling periods.
-- ============================================================
CREATE OR REPLACE FUNCTION nursed_get_platform_metrics()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  v_wau              integer;
  v_mau              integer;
  v_prev_wau         integer;
  v_growth_wau       numeric;
  v_trend            jsonb;
  v_q1               numeric;
  v_q2               numeric;
  v_q3               numeric;
  v_q4               numeric;
  v_q5               numeric;
  v_lesson_composite numeric;
  v_lesson_count     integer;
  v_peer_avg         numeric;
  v_peer_count       integer;
  v_streak_pct       numeric;
  v_longest          integer;
  v_avg_sessions     numeric;
  v_total_learners   integer;
  v_total_recordings integer;
  v_total_completed  integer;
  v_total_courses    integer;
  v_logins_total     integer;
  v_logins_month     integer;
  v_logins_week      integer;
BEGIN
  SELECT COUNT(DISTINCT user_id)::int INTO v_wau
  FROM nursed_progress WHERE last_active >= NOW() - INTERVAL '7 days';

  SELECT COUNT(DISTINCT user_id)::int INTO v_mau
  FROM nursed_progress WHERE last_active >= NOW() - INTERVAL '30 days';

  SELECT COUNT(DISTINCT user_id)::int INTO v_prev_wau
  FROM nursed_progress
  WHERE last_active >= NOW() - INTERVAL '14 days'
    AND last_active <  NOW() - INTERVAL '7 days';

  IF v_prev_wau = 0 THEN
    v_growth_wau := 0;
  ELSE
    v_growth_wau := ROUND(((v_wau - v_prev_wau)::numeric / v_prev_wau) * 100, 1);
  END IF;

  SELECT jsonb_agg(
    jsonb_build_object('weekStart', week_start, 'activeLearners', active_learners)
    ORDER BY week_start
  ) INTO v_trend
  FROM (
    SELECT date_trunc('week', last_active)::date AS week_start,
           COUNT(DISTINCT user_id)::int          AS active_learners
    FROM nursed_progress
    WHERE last_active >= NOW() - INTERVAL '12 weeks'
    GROUP BY 1
  ) trend_sub;

  SELECT
    ROUND(AVG(q1_animation)::numeric,  2),
    ROUND(AVG(q2_variety)::numeric,    2),
    ROUND(AVG(q3_usefulness)::numeric, 2),
    ROUND(AVG(q4_confidence)::numeric, 2),
    ROUND(AVG(q5_continue)::numeric,   2),
    ROUND(AVG((q1_animation + q2_variety + q3_usefulness + q4_confidence + q5_continue) / 5.0)::numeric, 2),
    COUNT(*)::int
    INTO v_q1, v_q2, v_q3, v_q4, v_q5, v_lesson_composite, v_lesson_count
  FROM nursed_lesson_feedback;

  SELECT ROUND(AVG(rating)::numeric, 2), COUNT(*)::int
    INTO v_peer_avg, v_peer_count
  FROM nursed_peer_reviews;

  SELECT
    ROUND(COUNT(*) FILTER (WHERE max_streak >= 3)::numeric / NULLIF(COUNT(*), 0) * 100, 1),
    COALESCE(MAX(max_streak), 0)::int
    INTO v_streak_pct, v_longest
  FROM (
    SELECT user_id, MAX(streak_days) AS max_streak
    FROM nursed_progress GROUP BY user_id
  ) streak_sub;

  SELECT ROUND(AVG(distinct_days)::numeric, 1) INTO v_avg_sessions
  FROM (
    SELECT user_id, COUNT(DISTINCT DATE(last_active)) AS distinct_days
    FROM nursed_progress
    WHERE last_active >= NOW() - INTERVAL '30 days'
    GROUP BY user_id
  ) sessions_sub;

  SELECT COUNT(*)::int INTO v_total_learners   FROM nursed_profiles   WHERE role = 'learner';
  SELECT COUNT(*)::int INTO v_total_recordings FROM nursed_submissions WHERE type = 'recording';
  SELECT COUNT(*)::int INTO v_total_completed  FROM nursed_progress   WHERE completed = true;
  SELECT COUNT(*)::int INTO v_total_courses    FROM nursed_courses     WHERE published = true;

  -- Login stats: distinct nursed users by auth.users.last_sign_in_at
  SELECT
    COUNT(*)                                                                  ::int,
    COUNT(*) FILTER (WHERE au.last_sign_in_at >= NOW() - INTERVAL '30 days') ::int,
    COUNT(*) FILTER (WHERE au.last_sign_in_at >= NOW() - INTERVAL '7 days')  ::int
    INTO v_logins_total, v_logins_month, v_logins_week
  FROM nursed_profiles np
  JOIN auth.users au ON au.id = np.id
  WHERE au.last_sign_in_at IS NOT NULL;

  RETURN jsonb_build_object(
    'activeLearners', jsonb_build_object(
      'wau',         COALESCE(v_wau, 0),
      'mau',         COALESCE(v_mau, 0),
      'growthWau',   COALESCE(v_growth_wau, 0),
      'weeklyTrend', COALESCE(v_trend, '[]'::jsonb)
    ),
    'rating', jsonb_build_object(
      'lessonAverage',           v_lesson_composite,
      'peerAverage',             v_peer_avg,
      'breakdown', jsonb_build_object(
        'q1_animation',  v_q1, 'q2_variety', v_q2,
        'q3_usefulness', v_q3, 'q4_confidence', v_q4, 'q5_continue', v_q5
      ),
      'totalLessonFeedbackRows', COALESCE(v_lesson_count, 0),
      'totalPeerReviewRows',     COALESCE(v_peer_count, 0)
    ),
    'engagement', jsonb_build_object(
      'activeStreakPct',     COALESCE(v_streak_pct, 0),
      'longestStreakRecord', COALESCE(v_longest, 0),
      'avgSessionsPerUser', COALESCE(v_avg_sessions, 0)
    ),
    'fastFacts', jsonb_build_object(
      'totalLearners',         COALESCE(v_total_learners,   0),
      'totalRecordings',       COALESCE(v_total_recordings, 0),
      'totalLessonsCompleted', COALESCE(v_total_completed,  0),
      'totalCoursesPublished', COALESCE(v_total_courses,    0)
    ),
    'logins', jsonb_build_object(
      'total',     COALESCE(v_logins_total, 0),
      'thisMonth', COALESCE(v_logins_month, 0),
      'thisWeek',  COALESCE(v_logins_week,  0)
    )
  );
END;
$$;
