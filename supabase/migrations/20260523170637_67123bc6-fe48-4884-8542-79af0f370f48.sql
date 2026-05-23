DROP TRIGGER IF EXISTS on_auth_user_bootstrap_admin ON auth.users;
DROP FUNCTION IF EXISTS public.bootstrap_first_admin();