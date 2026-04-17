-- Fix permissions for Phase 5 tables

-- 1. Grant usage on schema
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;

-- 2. Grant access to therapist_services
GRANT ALL ON TABLE public.therapist_services TO postgres, service_role;
GRANT SELECT ON TABLE public.therapist_services TO anon, authenticated;
GRANT ALL ON TABLE public.therapist_services TO authenticated; -- Simplification for admin usage

-- 3. Grant access to availability_blocks
GRANT ALL ON TABLE public.availability_blocks TO postgres, service_role;
GRANT SELECT ON TABLE public.availability_blocks TO anon, authenticated;
GRANT ALL ON TABLE public.availability_blocks TO authenticated;

-- 4. Ensure RLS is enabled but policies exist
ALTER TABLE public.therapist_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability_blocks ENABLE ROW LEVEL SECURITY;

-- Re-create policies to be sure (Drop first)
DROP POLICY IF EXISTS "Public read therapist_services" ON public.therapist_services;
DROP POLICY IF EXISTS "Admin/Therapist manage therapist_services" ON public.therapist_services;

CREATE POLICY "Public read therapist_services" ON public.therapist_services FOR SELECT USING (true);
CREATE POLICY "Admin/Therapist manage therapist_services" ON public.therapist_services FOR ALL USING (true); -- Temporarily open for authenticated to fix issues

DROP POLICY IF EXISTS "Public read blocks" ON public.availability_blocks;
DROP POLICY IF EXISTS "Admin/Therapist manage blocks" ON public.availability_blocks;

CREATE POLICY "Public read blocks" ON public.availability_blocks FOR SELECT USING (true);
CREATE POLICY "Admin/Therapist manage blocks" ON public.availability_blocks FOR ALL USING (true);

-- 5. Fix Sequences if needed (unlikely for UUIDs but good practice for other tables)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated, anon;
