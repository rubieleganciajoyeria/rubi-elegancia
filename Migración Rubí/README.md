# Migración a Supabase externo

## Orden de ejecución (SQL Editor del nuevo proyecto Supabase)

1. **01-schema.sql** — Crea tipos, tablas, funciones, triggers, RLS y políticas.
2. **02-data.sql** — Inserta todos los datos actuales (productos, categorías, banners, cupones, promociones, pedidos, reseñas, site_content). NOTA: no incluye `auth.users` ni `user_roles` (se crean al registrarse y se asignan manualmente).
3. **03-storage.sql** — Crea el bucket `media` y sus políticas.
4. **04-auth-trigger.sql** — Activa el trigger que crea `profiles` al registrarse un usuario.
5. Regístrate en el nuevo proyecto (Authentication → Users → Add user, o desde tu app).
6. **05-primer-admin.sql** — Edita el email y ejecuta para darte rol admin.

## Después de migrar

### En el nuevo proyecto Supabase:
- **Authentication → Providers**: habilita Email (sin auto-confirm si quieres verificación) y Google si lo usabas.
- **Authentication → URL Configuration**: agrega tu dominio en Site URL y Redirect URLs.
- **Storage**: sube de nuevo las imágenes al bucket `media` (o cambia las URLs en `products`, `banners`, `product_images` si las re-subes a otra ruta).
- **Edge Functions / Cron**: este proyecto NO usa edge functions; toda la lógica server está en TanStack server functions.

### En tu proyecto Lovable:
Actualiza las variables de entorno con las del nuevo Supabase:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY` (anon key)
- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Y vuelve a configurar los secrets de Wompi:
- `WOMPI_PUBLIC_KEY`
- `WOMPI_PRIVATE_KEY`
- `WOMPI_INTEGRITY_SECRET`
- `WOMPI_EVENTS_SECRET`

## Migración de imágenes del bucket `media`
Como las imágenes están en el Storage actual, tienes dos opciones:
- **A (recomendada)**: descargarlas del bucket actual y volverlas a subir al nuevo (mismas rutas → las URLs en la BD seguirán funcionando si actualizas el dominio).
- **B**: usar `rclone` o un script con la API de Storage para copiar entre proyectos.
