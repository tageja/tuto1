CREATE TABLE IF NOT EXISTS public.platform_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  schools_count integer DEFAULT 0,
  homework_completion_rate numeric(5,2) DEFAULT 0, -- e.g., 94.5
  parent_engagement_rate numeric(5,2) DEFAULT 0,   -- e.g., 88.2
  attendance_rate numeric(5,2) DEFAULT 0,           -- e.g., 98.5
  updated_at timestamptz DEFAULT now()
);

-- Insert initial values (matching web landing page)
INSERT INTO public.platform_stats (schools_count, homework_completion_rate, parent_engagement_rate, attendance_rate)
VALUES (120, 94.0, 88.0, 98.5);

-- RLS policies
ALTER TABLE public.platform_stats ENABLE ROW LEVEL SECURITY;

-- Public read access (anyone can view platform stats)
CREATE POLICY "Platform stats are publicly readable"
  ON public.platform_stats FOR SELECT
  USING (true);






