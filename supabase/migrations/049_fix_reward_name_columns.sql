-- Migration 049: Fix swapped name / name_vi on the 6 original nursed_rewards rows.
--
-- Migration 041 seeded these rows with the columns inverted:
--   name     = Vietnamese text  (should be English primary name)
--   name_vi  = English text     (should be Vietnamese translation)
--
-- Migration 048 seeds were already correct; only these 6 rows need fixing.
-- Match on name_vi (which erroneously held the English text) to uniquely target them.

UPDATE nursed_rewards SET name = 'First Lesson',    name_vi = 'Bài học đầu tiên' WHERE name_vi = 'First Lesson';
UPDATE nursed_rewards SET name = '3-Day Streak',    name_vi = '3 ngày liên tục'  WHERE name_vi = '3-Day Streak';
UPDATE nursed_rewards SET name = '7-Day Streak',    name_vi = '7 ngày liên tục'  WHERE name_vi = '7-Day Streak';
UPDATE nursed_rewards SET name = 'First Recording', name_vi = 'Ghi âm đầu tiên' WHERE name_vi = 'First Recording';
UPDATE nursed_rewards SET name = 'High Score',      name_vi = 'Điểm cao'         WHERE name_vi = 'High Score';
UPDATE nursed_rewards SET name = 'Pair Practice',   name_vi = 'Luyện tập nhóm'  WHERE name_vi = 'Pair Practice';
