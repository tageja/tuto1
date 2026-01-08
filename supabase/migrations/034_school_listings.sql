-- Create school_listings table for public directory
CREATE TABLE IF NOT EXISTS public.school_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL, -- 'Preschool', 'Primary', 'Secondary', 'HighSchool', 'Center', 'Other'
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    district TEXT NOT NULL,
    rating NUMERIC(3, 2) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    min_tuition BIGINT DEFAULT 0,
    max_tuition BIGINT DEFAULT 0,
    currency TEXT DEFAULT 'VND',
    images TEXT[] DEFAULT '{}',
    logo TEXT,
    description TEXT,
    tags TEXT[] DEFAULT '{}',
    features TEXT[] DEFAULT '{}',
    programs JSONB DEFAULT '[]', -- [{title, ageRange, description}]
    contact_phone TEXT,
    contact_email TEXT,
    contact_website TEXT,
    contact_facebook TEXT,
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.school_listings ENABLE ROW LEVEL SECURITY;

-- Allow public read access
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'school_listings' 
        AND policyname = 'Allow public read access'
    ) THEN
        CREATE POLICY "Allow public read access" ON public.school_listings
            FOR SELECT USING (true);
    END IF;
END
$$;

-- Allow admin full access
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'school_listings' 
        AND policyname = 'Allow admin full access'
    ) THEN
        CREATE POLICY "Allow admin full access" ON public.school_listings
            FOR ALL TO authenticated
            USING (
                EXISTS (
                    SELECT 1 FROM public.users 
                    WHERE users.id = auth.uid() 
                    AND users.role = 'admin'
                )
            );
    END IF;
END
$$;

