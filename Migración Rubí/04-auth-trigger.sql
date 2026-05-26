-- Trigger para crear profile automáticamente cuando se registra un usuario
-- La función public.handle_new_user() ya fue creada en 01-schema.sql
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
