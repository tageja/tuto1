-- Migration: 063_reel_like_count_trigger_security_definer.sql
-- Fix BUG-023: Like count resets to 0 on app restart despite heart state persisting
-- Root cause: RLS on social_reels has no UPDATE policy; trigger's UPDATE was silently failing.
-- Fix: Use SECURITY DEFINER so the trigger runs with owner privileges and can update like_count.

CREATE OR REPLACE FUNCTION update_reel_like_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE social_reels SET like_count = like_count + 1 WHERE id = NEW.reel_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE social_reels SET like_count = GREATEST(0, like_count - 1) WHERE id = OLD.reel_id;
  END IF;
  RETURN NULL;
END;
$$;
