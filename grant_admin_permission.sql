-- Grant admin role to user 96eeee60-13d7-4d9d-b2e1-7f2a334ad595

INSERT INTO public.user_roles (user_id, role)
VALUES ('96eeee60-13d7-4d9d-b2e1-7f2a334ad595', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Verify the insertion
SELECT * FROM public.user_roles WHERE user_id = '96eeee60-13d7-4d9d-b2e1-7f2a334ad595';
