-- Bug #024 — Lesson 7 (triage-challenge): mission step had empty missionEn/missionVi; MissionStep
-- fell back to generic example copy. Canonical bilingual mission strings for Heads Together closure.

UPDATE nursed_lesson_steps nls
SET config =
  COALESCE(nls.config, '{}'::jsonb)
  || jsonb_build_object(
    'missionEn',
    'Within the next two weeks, run **one independent triage** yourself (partner or simulated patient)—new symptom story, unfamiliar presentation. Stay calm and follow the full question sequence you practiced, then jot one sentence on what you''d tighten next time.',
    'missionVi',
    'Trong hai tuần tới, **tự chủ một lần triage đầy đủ với nhóm của bạn** (tình huống mới, triệu chứng không quen)—giữ trình tự và giọng bình tĩnh như trong bài học, rồi ghi một câu bạn muốn làm trôi chảy hơn lần sau.'
  )
FROM nursed_lessons nl
JOIN nursed_modules nm ON nm.id = nl.module_id
JOIN nursed_courses nc ON nc.id = nm.course_id
WHERE nls.lesson_id = nl.id
  AND nls.type = 'mission'
  AND nc.slug = 'emergency-nursing-communication'
  AND nm.slug = 'triage-intake'
  AND nl.slug = 'triage-challenge';
