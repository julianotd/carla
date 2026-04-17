-- FIX THERAPIST CREATION PERMISSIONS - V2

-- 1. Ensure therapist_services table exists
CREATE TABLE IF NOT EXISTS public.therapist_services (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    therapist_id uuid REFERENCES public.therapists(id) ON DELETE CASCADE NOT NULL,
    service_id uuid REFERENCES public.services(id) ON DELETE CASCADE NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(therapist_id, service_id)
);

-- 2. Open permissions for therapist_services
ALTER TABLE public.therapist_services ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.therapist_services TO authenticated;
GRANT ALL ON TABLE public.therapist_services TO service_role;

-- Drop all possible policies to ensure clean slate (Fixing the error 42710)
DROP POLICY IF EXISTS "Public read therapist_services" ON public.therapist_services;
DROP POLICY IF EXISTS "Admin/Therapist manage therapist_services" ON public.therapist_services;
DROP POLICY IF EXISTS "Enable all for admin" ON public.therapist_services;
DROP POLICY IF EXISTS "Admin manage therapist_services" ON public.therapist_services;

-- Create simple policies
CREATE POLICY "Public read therapist_services" ON public.therapist_services 
FOR SELECT USING (true);

-- Allow Admins and Editors to do EVERYTHING on therapist_services
CREATE POLICY "Admin manage therapist_services" ON public.therapist_services 
FOR ALL USING (
  public.has_role('admin') OR public.has_role('editor')
);

-- 3. Ensure Therapists table is writable
GRANT ALL ON TABLE public.therapists TO authenticated;

-- DROP POLICY BEFORE CREATING (Fixing the error 42710)
DROP POLICY IF EXISTS "Admin/Editor full access therapists" ON public.therapists;

CREATE POLICY "Admin/Editor full access therapists" ON public.therapists 
FOR ALL USING (
  public.has_role('admin') OR public.has_role('editor')
);

-- 4. Ensure Availability Blocks is writable
GRANT ALL ON TABLE public.availability_blocks TO authenticated;

-- DROP POLICY BEFORE CREATING
DROP POLICY IF EXISTS "Admin/Editor full access blocks" ON public.availability_blocks;

CREATE POLICY "Admin/Editor full access blocks" ON public.availability_blocks 
FOR ALL USING (
  public.has_role('admin') OR public.has_role('editor')
);
