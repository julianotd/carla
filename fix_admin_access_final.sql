-- MASTER FIX FOR ADMIN ACCESS
-- Run this entire script in Supabase SQL Editor

-- 1. Ensure the 'admin' role exists
INSERT INTO public.roles (role) VALUES ('admin') ON CONFLICT (role) DO NOTHING;

-- 2. Ensure the user has the profile (just in case)
-- We use ON CONFLICT to avoid errors if it exists
INSERT INTO public.profiles (id) 
VALUES ('96eeee60-13d7-4d9d-b2e1-7f2a334ad595')
ON CONFLICT (id) DO NOTHING;

-- 3. FORCE assign the admin role (Delete first to be sure)
DELETE FROM public.user_roles WHERE user_id = '96eeee60-13d7-4d9d-b2e1-7f2a334ad595' AND role = 'admin';

INSERT INTO public.user_roles (user_id, role)
VALUES ('96eeee60-13d7-4d9d-b2e1-7f2a334ad595', 'admin');

-- 4. Verify - This should return a row with 'admin'
SELECT * FROM public.user_roles WHERE user_id = '96eeee60-13d7-4d9d-b2e1-7f2a334ad595';
