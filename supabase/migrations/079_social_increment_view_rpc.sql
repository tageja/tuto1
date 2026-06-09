-- Migration: 079_social_increment_view_rpc.sql
-- RPC to increment view_count on social_posts or social_reels

CREATE OR REPLACE FUNCTION increment_view_count(
  p_content_type TEXT,  -- 'post' or 'reel'
  p_content_id UUID
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_content_type = 'post' THEN
    UPDATE social_posts SET view_count = view_count + 1 WHERE id = p_content_id;
  ELSIF p_content_type = 'reel' THEN
    UPDATE social_reels SET view_count = view_count + 1 WHERE id = p_content_id;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION increment_view_count(TEXT, UUID) TO authenticated;
