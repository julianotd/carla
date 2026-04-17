-- FIX RPC AND GRANTS - V2 (Prevent Recursion)

-- 1. Grant basic usage
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- 2. User Roles Table Permissions
GRANT ALL ON TABLE public.user_roles TO service_role;
GRANT SELECT ON TABLE public.user_roles TO authenticated;
GRANT SELECT ON TABLE public.user_roles TO anon; -- Needed for initial check sometimes

-- 3. RLS for user_roles (CRITICAL to prevent recursion)
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Drop old policies
DROP POLICY IF EXISTS "Users can read own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admin manage user_roles" ON public.user_roles;

-- Create simple, non-recursive policy
CREATE POLICY "Users can read own roles" ON public.user_roles
FOR SELECT USING (auth.uid() = user_id);

-- 4. Recreate the has_role function
CREATE OR REPLACE FUNCTION public.has_role(check_role text)
RETURNS boolean AS $$
DECLARE
  role_exists boolean;
BEGIN
  -- Perform a direct query. Since we are SECURITY DEFINER, this bypasses RLS on user_roles
  -- BUT we must be careful not to trigger other RLS if we joined tables (we aren't).
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = check_role
  ) INTO role_exists;

  RETURN role_exists;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Grant execute
GRANT EXECUTE ON FUNCTION public.has_role(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(text) TO anon;
GRANT EXECUTE ON FUNCTION public.has_role(text) TO service_role;

-- 6. Re-insert the admin user
INSERT INTO public.user_roles (user_id, role)
VALUES ('96eeee60-13d7-4d9d-b2e1-7f2a334ad595', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;
