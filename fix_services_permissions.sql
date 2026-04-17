-- FIX SERVICES PERMISSIONS - V2

-- Ensure RLS is enabled
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to be safe (including the one causing error)
DROP POLICY IF EXISTS "Public read services" ON public.services;
DROP POLICY IF EXISTS "Admin/Editor full access services" ON public.services;
DROP POLICY IF EXISTS "Allow public read access" ON public.services;
DROP POLICY IF EXISTS "Authenticated read all services" ON public.services;

-- 1. Public Read Policy (Anyone can see active services)
CREATE POLICY "Public read services" ON public.services
FOR SELECT USING (is_active = true OR public.has_role('admin') OR public.has_role('editor'));

-- 2. Admin/Editor Full Access (Can see all, insert, update, delete)
CREATE POLICY "Admin/Editor full access services" ON public.services
FOR ALL USING (public.has_role('admin') OR public.has_role('editor'));

-- 3. Authenticated check (Fix for linking)
CREATE POLICY "Authenticated read all services" ON public.services
FOR SELECT TO authenticated USING (true);
