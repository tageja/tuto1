-- ============================================================================
-- Migration 024: Payments Feature
-- Description: Create payment_items, payment_batches, payment_receipts,
-- payment_methods, payment_intents tables with RLS and materialized view
-- ============================================================================

-- ============================================================================
-- TABLE: payment_items
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.payment_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.school_students(id) ON DELETE CASCADE,
  class_id UUID REFERENCES public.school_classes(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  type TEXT CHECK (type IN ('tuition','trip','club','misc')) NOT NULL,
  amount_cents BIGINT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'VND',
  due_date TIMESTAMPTZ NOT NULL,
  status TEXT CHECK (status IN ('pending','paid','overdue','void')) NOT NULL DEFAULT 'pending',
  batch_id UUID REFERENCES public.payment_batches(id) ON DELETE SET NULL,
  paid_at TIMESTAMPTZ,
  method TEXT,
  receipt_id UUID,
  notes TEXT,
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- TABLE: payment_batches
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.payment_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  target TEXT CHECK (target IN ('school','class','students')) NOT NULL,
  class_id UUID REFERENCES public.school_classes(id) ON DELETE SET NULL,
  student_ids JSONB,
  late_fee_cents BIGINT,
  late_fee_rule JSONB,
  due_date TIMESTAMPTZ NOT NULL,
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- TABLE: payment_receipts
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.payment_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.school_students(id) ON DELETE CASCADE,
  payment_item_id UUID NOT NULL REFERENCES public.payment_items(id) ON DELETE CASCADE,
  amount_cents BIGINT NOT NULL,
  method TEXT NOT NULL,
  reference TEXT,
  url TEXT,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- TABLE: payment_methods
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  parent_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  brand TEXT,
  last4 TEXT,
  exp_month INT,
  exp_year INT,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- TABLE: payment_intents
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.payment_intents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  payment_item_id UUID NOT NULL REFERENCES public.payment_items(id) ON DELETE CASCADE,
  amount_cents BIGINT NOT NULL,
  provider TEXT CHECK (provider IN ('stripe','momo','cash')) NOT NULL,
  client_secret TEXT,
  status TEXT CHECK (status IN ('requires_payment','succeeded','canceled')) NOT NULL DEFAULT 'requires_payment',
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_payment_items_school_due ON public.payment_items (school_id, due_date);
CREATE INDEX IF NOT EXISTS idx_payment_items_student_status ON public.payment_items (student_id, status);
CREATE INDEX IF NOT EXISTS idx_payment_items_class_due ON public.payment_items (class_id, due_date) WHERE class_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_payment_items_status ON public.payment_items (status, due_date);
CREATE INDEX IF NOT EXISTS idx_payment_items_batch ON public.payment_items (batch_id) WHERE batch_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_payment_batches_school ON public.payment_batches (school_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payment_receipts_item ON public.payment_receipts (payment_item_id);
CREATE INDEX IF NOT EXISTS idx_payment_receipts_student ON public.payment_receipts (student_id, issued_at DESC);
CREATE INDEX IF NOT EXISTS idx_payment_methods_parent ON public.payment_methods (parent_user_id, is_primary DESC);
CREATE INDEX IF NOT EXISTS idx_payment_intents_item ON public.payment_intents (payment_item_id);
CREATE INDEX IF NOT EXISTS idx_payment_intents_status ON public.payment_intents (status, created_at DESC);

-- ============================================================================
-- MATERIALIZED VIEW: v_revenue_daily
-- ============================================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS public.v_revenue_daily AS
SELECT 
  school_id,
  date_trunc('day', paid_at)::date AS day,
  SUM(amount_cents) AS paid_cents,
  COUNT(*) AS transaction_count
FROM public.payment_items
WHERE status = 'paid' AND paid_at IS NOT NULL
GROUP BY school_id, date_trunc('day', paid_at)::date;

CREATE UNIQUE INDEX IF NOT EXISTS idx_v_revenue_daily_unique 
  ON public.v_revenue_daily (school_id, day);

-- ============================================================================
-- TRIGGERS: updated_at
-- ============================================================================

CREATE TRIGGER update_payment_items_updated_at 
  BEFORE UPDATE ON public.payment_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- UPDATE: school_notifications table (add payment types)
-- ============================================================================

ALTER TABLE public.school_notifications
  DROP CONSTRAINT IF EXISTS school_notifications_type_check;

ALTER TABLE public.school_notifications
  ADD CONSTRAINT school_notifications_type_check 
  CHECK (type IN ('message','announcement','event','health_incident','payment_due','payment_overdue'));

-- ============================================================================
-- ROW LEVEL SECURITY: Enable RLS
-- ============================================================================

ALTER TABLE public.payment_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_intents ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES: payment_items
-- ============================================================================

-- Admin: Full CRUD within their schools
CREATE POLICY payment_items_admin_all ON public.payment_items
  FOR ALL
  USING (
    school_id = ANY(get_user_school_ids()) AND is_admin()
  )
  WITH CHECK (
    school_id = ANY(get_user_school_ids()) AND is_admin()
  );

-- Parent: Read-only for their children's items
CREATE POLICY payment_items_parent_select ON public.payment_items
  FOR SELECT
  USING (
    student_id = ANY(COALESCE(get_user_child_student_ids(), ARRAY[]::uuid[]))
    AND school_id = ANY(get_user_school_ids())
  );

-- ============================================================================
-- RLS POLICIES: payment_batches
-- ============================================================================

-- Admin: Full CRUD within their schools
CREATE POLICY payment_batches_admin_all ON public.payment_batches
  FOR ALL
  USING (
    school_id = ANY(get_user_school_ids()) AND is_admin()
  )
  WITH CHECK (
    school_id = ANY(get_user_school_ids()) AND is_admin()
  );

-- ============================================================================
-- RLS POLICIES: payment_receipts
-- ============================================================================

-- Admin: Full read/write within their schools
CREATE POLICY payment_receipts_admin_all ON public.payment_receipts
  FOR ALL
  USING (
    school_id = ANY(get_user_school_ids()) AND is_admin()
  )
  WITH CHECK (
    school_id = ANY(get_user_school_ids()) AND is_admin()
  );

-- Parent: Read-only for their children's receipts
CREATE POLICY payment_receipts_parent_select ON public.payment_receipts
  FOR SELECT
  USING (
    student_id = ANY(COALESCE(get_user_child_student_ids(), ARRAY[]::uuid[]))
    AND school_id = ANY(get_user_school_ids())
  );

-- ============================================================================
-- RLS POLICIES: payment_methods
-- ============================================================================

-- Admin: Full read within their schools
CREATE POLICY payment_methods_admin_select ON public.payment_methods
  FOR SELECT
  USING (
    school_id = ANY(get_user_school_ids()) AND is_admin()
  );

-- Parent: Full CRUD for their own payment methods
CREATE POLICY payment_methods_parent_all ON public.payment_methods
  FOR ALL
  USING (
    parent_user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
    AND school_id = ANY(get_user_school_ids())
  )
  WITH CHECK (
    parent_user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
    AND school_id = ANY(get_user_school_ids())
  );

-- ============================================================================
-- RLS POLICIES: payment_intents
-- ============================================================================

-- Admin: Full read/write within their schools
CREATE POLICY payment_intents_admin_all ON public.payment_intents
  FOR ALL
  USING (
    school_id = ANY(get_user_school_ids()) AND is_admin()
  )
  WITH CHECK (
    school_id = ANY(get_user_school_ids()) AND is_admin()
  );

-- Parent: Read and create for their children's payment items
CREATE POLICY payment_intents_parent_select ON public.payment_intents
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.payment_items pi
      WHERE pi.id = payment_intents.payment_item_id
        AND pi.student_id = ANY(COALESCE(get_user_child_student_ids(), ARRAY[]::uuid[]))
        AND pi.school_id = ANY(get_user_school_ids())
    )
  );

CREATE POLICY payment_intents_parent_insert ON public.payment_intents
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.payment_items pi
      WHERE pi.id = payment_intents.payment_item_id
        AND pi.student_id = ANY(COALESCE(get_user_child_student_ids(), ARRAY[]::uuid[]))
        AND pi.school_id = ANY(get_user_school_ids())
    )
    AND created_by = (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
  );

CREATE POLICY payment_intents_parent_update ON public.payment_intents
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.payment_items pi
      WHERE pi.id = payment_intents.payment_item_id
        AND pi.student_id = ANY(COALESCE(get_user_child_student_ids(), ARRAY[]::uuid[]))
        AND pi.school_id = ANY(get_user_school_ids())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.payment_items pi
      WHERE pi.id = payment_intents.payment_item_id
        AND pi.student_id = ANY(COALESCE(get_user_child_student_ids(), ARRAY[]::uuid[]))
        AND pi.school_id = ANY(get_user_school_ids())
    )
  );

-- ============================================================================
-- FUNCTION: Refresh Revenue Daily View
-- ============================================================================

CREATE OR REPLACE FUNCTION public.refresh_revenue_daily_view()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.v_revenue_daily;
$$;

-- ============================================================================
-- FUNCTION: Process Overdue Payments
-- ============================================================================

CREATE OR REPLACE FUNCTION public.process_overdue_payments()
RETURNS TABLE(
  overdue_count BIGINT,
  late_fees_created BIGINT,
  errors TEXT[]
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  overdue_count_var BIGINT := 0;
  late_fees_created_var BIGINT := 0;
  errors_var TEXT[] := '{}';
  item RECORD;
  batch_rec RECORD;
  late_fee_amount BIGINT;
  late_fee_item_id UUID;
BEGIN
  -- Mark pending items with past due_date as overdue
  UPDATE public.payment_items
  SET status = 'overdue'
  WHERE status = 'pending'
    AND due_date < NOW()
    AND id IN (
      SELECT id FROM public.payment_items
      WHERE status = 'pending' AND due_date < NOW()
      FOR UPDATE SKIP LOCKED
    );

  GET DIAGNOSTICS overdue_count_var = ROW_COUNT;

  -- Process late fees for items from batches with late_fee_rule
  FOR item IN 
    SELECT pi.*, pb.late_fee_rule, pb.late_fee_cents as batch_late_fee_cents, pb.title as batch_title
    FROM public.payment_items pi
    INNER JOIN public.payment_batches pb ON pb.id = pi.batch_id
    WHERE pi.status = 'overdue'
      AND pi.paid_at IS NULL
      AND pi.batch_id IS NOT NULL
      AND pb.late_fee_rule IS NOT NULL
      AND (pb.late_fee_rule->>'after_days')::INT IS NOT NULL
      AND NOW() >= (pi.due_date + ((pb.late_fee_rule->>'after_days')::INT || ' days')::INTERVAL)
      AND NOT EXISTS (
        SELECT 1 FROM public.payment_items late_fee
        WHERE late_fee.notes LIKE '%Late fee: ' || pb.title || '%'
          AND late_fee.student_id = pi.student_id
          AND late_fee.status IN ('pending', 'overdue')
      )
  LOOP
    BEGIN
      -- Calculate late fee
      -- Use batch late_fee_cents if available, otherwise calculate from rule
      IF item.batch_late_fee_cents IS NOT NULL AND item.batch_late_fee_cents > 0 THEN
        late_fee_amount := item.batch_late_fee_cents;
      ELSIF item.late_fee_rule IS NOT NULL THEN
        IF item.late_fee_rule->>'mode' = 'flat' THEN
          late_fee_amount := COALESCE((item.late_fee_rule->>'amount')::BIGINT, 0);
        ELSIF item.late_fee_rule->>'mode' = '%' THEN
          late_fee_amount := ROUND((item.amount_cents::NUMERIC * COALESCE((item.late_fee_rule->>'percent')::NUMERIC, 0) / 100))::BIGINT;
        ELSE
          CONTINUE; -- Skip if mode is not recognized
        END IF;
      ELSE
        CONTINUE; -- Skip if no late fee configured
      END IF;
      
      IF late_fee_amount IS NULL OR late_fee_amount <= 0 THEN
        CONTINUE; -- Skip if no valid late fee amount
      END IF;

      -- Create late fee payment item
      INSERT INTO public.payment_items (
        school_id,
        student_id,
        class_id,
        title,
        type,
        amount_cents,
        currency,
        due_date,
        status,
        notes,
        batch_id,
        created_by
      ) VALUES (
        item.school_id,
        item.student_id,
        item.class_id,
        'Late fee: ' || item.batch_title,
        'misc',
        late_fee_amount,
        item.currency,
        NOW() + INTERVAL '7 days',
        'pending',
        'Late fee for overdue payment: ' || item.title,
        item.batch_id,
        item.created_by
      ) RETURNING id INTO late_fee_item_id;

      late_fees_created_var := late_fees_created_var + 1;
    EXCEPTION WHEN OTHERS THEN
      errors_var := array_append(errors_var, 'Error creating late fee for item ' || item.id::TEXT || ': ' || SQLERRM);
    END;
  END LOOP;

  RETURN QUERY SELECT overdue_count_var, late_fees_created_var, errors_var;
END;
$$;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

