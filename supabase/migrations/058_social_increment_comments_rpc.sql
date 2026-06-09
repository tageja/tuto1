-- Migration: 058_social_increment_comments_rpc.sql
-- RPC helper so the client can atomically increment comments_count without
-- needing to SELECT the current value first (race-condition safe).

CREATE OR REPLACE FUNCTION increment_comments_count(post_id UUID)
RETURNS VOID LANGUAGE sql SECURITY DEFINER AS $$
  UPDATE social_posts
     SET comments_count = COALESCE(comments_count, 0) + 1
   WHERE id = post_id;
$$;

GRANT EXECUTE ON FUNCTION increment_comments_count(UUID) TO authenticated;

COMMENT ON FUNCTION increment_comments_count IS 
  'Atomically increments social_posts.comments_count — safe to call from client.';
