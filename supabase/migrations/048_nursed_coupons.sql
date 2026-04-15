-- ============================================================
-- 048 — Rewards, Coupons & Streak System
-- ============================================================

-- ── 1. Extend nursed_rewards rule_type CHECK ─────────────────
ALTER TABLE nursed_rewards
  DROP CONSTRAINT IF EXISTS nursed_rewards_rule_type_check;

ALTER TABLE nursed_rewards
  ADD CONSTRAINT nursed_rewards_rule_type_check CHECK (
    rule_type IN (
      'lesson_complete',
      'streak',
      'recording',
      'quiz_score',
      'pair_session',
      'module_complete',
      'course_complete',
      'daily_double',
      'feedback'
    )
  );

-- ── 2. Extend nursed_user_rewards for general ledger use ─────
-- Drop the old unique constraint (only one reward per user)
-- and replace with one that allows repeatable rewards keyed
-- by an optional context_id (e.g. lesson_id for per-lesson rewards).
ALTER TABLE nursed_user_rewards
  DROP CONSTRAINT IF EXISTS nursed_user_rewards_user_id_reward_id_key;

ALTER TABLE nursed_user_rewards
  ADD COLUMN IF NOT EXISTS context_id text;

ALTER TABLE nursed_user_rewards
  ADD CONSTRAINT nursed_user_rewards_user_reward_ctx_key
    UNIQUE (user_id, reward_id, context_id);

-- ── 3. Additional reward rule seeds ──────────────────────────
INSERT INTO nursed_rewards (name, name_vi, description, icon, points, rule_type, rule_config) VALUES
  ('Module Complete',   'Hoàn thành module',   'Complete all lessons in a module', '🏆', 50,  'module_complete', '{}'),
  ('Course Complete',   'Hoàn thành khóa học', 'Complete an entire course',        '🎓', 200, 'course_complete', '{}'),
  ('Daily Double',      'Học đôi mỗi ngày',    'Complete 2 lessons in one day',    '⚡', 15,  'daily_double',    '{}'),
  ('14-Day Streak',     '14 ngày liên tục',    'Practice 14 days in a row',        '🔥', 150, 'streak',          '{"days": 14}'),
  ('30-Day Streak',     '30 ngày liên tục',    'Practice 30 days in a row',        '🔥', 500, 'streak',          '{"days": 30}'),
  ('Perfect Quiz',      'Điểm tuyệt đối',      'Score 100% on a quiz',             '💯', 50,  'quiz_score',      '{"min_score": 100}'),
  ('Peer Review Given', 'Đánh giá đồng nghiệp','Review a group member recording',  '🤝', 10,  'pair_session',    '{}'),
  ('Feedback Submitted','Gửi phản hồi',        'Submit app feedback',              '💬', 5,   'feedback',        '{}')
ON CONFLICT DO NOTHING;

-- ── 4. Coupons table ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS nursed_coupons (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text NOT NULL,
  name_vi         text,
  description     text,
  description_vi  text,
  brand           text NOT NULL,
  image_url       text,
  star_cost       integer NOT NULL CHECK (star_cost > 0),
  total_quantity  integer,
  remaining       integer,
  active          boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- ── 5. Coupon redemptions table ───────────────────────────────
CREATE TABLE IF NOT EXISTS nursed_coupon_redemptions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  coupon_id   uuid NOT NULL REFERENCES nursed_coupons(id) ON DELETE CASCADE,
  stars_spent integer NOT NULL,
  status      text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'fulfilled', 'expired')),
  coupon_code text,
  redeemed_at timestamptz NOT NULL DEFAULT now()
);

-- ── 6. RLS policies ───────────────────────────────────────────
ALTER TABLE nursed_coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE nursed_coupon_redemptions ENABLE ROW LEVEL SECURITY;

-- Anyone can read active coupons
CREATE POLICY "coupons_read_active" ON nursed_coupons
  FOR SELECT USING (active = true);

-- Service role can do anything
CREATE POLICY "coupons_service_all" ON nursed_coupons
  FOR ALL USING (auth.role() = 'service_role');

-- Users can read their own redemptions
CREATE POLICY "redemptions_read_own" ON nursed_coupon_redemptions
  FOR SELECT USING (auth.uid() = user_id);

-- Service role can do anything
CREATE POLICY "redemptions_service_all" ON nursed_coupon_redemptions
  FOR ALL USING (auth.role() = 'service_role');

-- ── 7. Seed example coupons ───────────────────────────────────
INSERT INTO nursed_coupons (name, name_vi, description, description_vi, brand, star_cost, total_quantity, remaining) VALUES
  ('Free Highland Coffee',   'Cà phê Highland miễn phí',  'Redeem for 1 free drink at Highland Coffee',  'Đổi 1 ly cà phê tại Highland Coffee',   'highland', 500,  100, 100),
  ('KFC Combo Meal',         'Bữa ăn KFC combo',          'Redeem for 1 KFC combo meal',                 'Đổi 1 combo KFC',                        'kfc',      800,  50,  50),
  ('Hasaki Beauty Voucher',  'Voucher Hasaki 50k',         '50,000 VND off at Hasaki Beauty',             'Giảm 50.000đ tại Hasaki Beauty',         'hasaki',   1000, 50,  50),
  ('GrabFood Discount 30k',  'Mã GrabFood giảm 30k',      '30,000 VND off your next GrabFood order',     'Giảm 30.000đ đơn GrabFood tiếp theo',   'grab',     300,  200, 200),
  ('Shopee Voucher 20k',     'Mã Shopee giảm 20k',        '20,000 VND off your Shopee order',            'Giảm 20.000đ đơn Shopee',                'shopee',   200,  500, 500)
ON CONFLICT DO NOTHING;
