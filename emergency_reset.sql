-- EMERGENCY ADMIN FIX
-- Run this in Supabase SQL Editor

-- 1. Insert the user as admin (if not exists)
INSERT INTO public.user_roles (user_id, role)
VALUES ('96eeee60-13d7-4d9d-b2e1-7f2a334ad595', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- 2. DISABLE RLS on user_roles logic temporarily to debug
-- This allows ANY authenticated user to read the table (but we only select our own in the code)
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;

-- 3. Grant permissions just in case
GRANT ALL ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
