-- ============================================================
-- NurseEd: Add 4 new interactive step types
-- Migration 053
-- ============================================================
-- Adds quick_response, odd_one_out, sentence_builder,
-- spot_the_mistake step types and extends the
-- nursed_lesson_steps.type CHECK constraint to accept them.
-- No data migration needed — existing rows are unaffected.
-- ============================================================

ALTER TABLE nursed_lesson_steps
  DROP CONSTRAINT IF EXISTS nursed_lesson_steps_type_check;

ALTER TABLE nursed_lesson_steps
  ADD CONSTRAINT nursed_lesson_steps_type_check CHECK (type IN (
    'video',
    'audio_shadow',
    'script_read',
    'cloze',
    'no_script',
    'recording_submit',
    'quiz',
    'mission',
    'scenario_intro',
    'self_reflection',
    'conversation_animation',
    'matching',
    'drag_order',
    'flash_card',
    'quick_response',
    'odd_one_out',
    'sentence_builder',
    'spot_the_mistake'
  ));
