-- FIX SERVICES SCHEMA & PERMISSIONS
-- Run this in Supabase SQL Editor

-- 1. Ensure 'benefits' column exists
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'benefits') THEN 
        ALTER TABLE public.services ADD COLUMN benefits text[]; 
    END IF; 
END $$;

-- 2. Ensure RLS is enabled but policies allow access
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- 3. Grant permissions to authenticated users
GRANT ALL ON public.services TO authenticated;
GRANT ALL ON public.services TO service_role;

-- 4. Re-create policies to be sure (Drop old ones first)
DROP POLICY IF EXISTS "Public read services" ON public.services;
DROP POLICY IF EXISTS "Admin full access services" ON public.services;

-- Public read
CREATE POLICY "Public read services"
ON public.services FOR SELECT
USING (true);

-- Admin full access (using the new bypass logic or role check)
CREATE POLICY "Admin full access services"
ON public.services FOR ALL
USING (
  (SELECT role FROM public.user_roles WHERE user_id = auth.uid()) IN ('admin', 'secretary')
  OR 
  auth.uid() = '96eeee60-13d7-4d9d-b2e1-7f2a334ad595' -- Emergency bypass in DB too
);
