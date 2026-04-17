
-- Tenta inserir a role de admin para o usuário com este email
DO $$
DECLARE
  target_user_id uuid;
BEGIN
  SELECT id INTO target_user_id FROM auth.users WHERE email = 'julianotd@gmail.com';
  
  IF target_user_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (target_user_id, 'admin')
    ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
    
    RAISE NOTICE 'User % promoted to admin', target_user_id;
  ELSE
    RAISE NOTICE 'User not found';
  END IF;
END $$;
