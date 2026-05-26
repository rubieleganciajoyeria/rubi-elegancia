-- Ejecutar SOLO DESPUÉS de registrar tu primer usuario en el nuevo Supabase.
-- Reemplaza el email por el del usuario que será admin.
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role
FROM auth.users
WHERE email = 'TU-EMAIL@ejemplo.com'
ON CONFLICT (user_id, role) DO NOTHING;
