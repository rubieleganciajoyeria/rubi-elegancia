
INSERT INTO public.site_content (key, data) VALUES
('global_settings', '{"whatsapp":"","whatsapp_message":"Hola Rubí, me interesa esta pieza:","announcement":"","global_discount_percent":0,"global_discount_active":false}'::jsonb)
ON CONFLICT (key) DO NOTHING;
