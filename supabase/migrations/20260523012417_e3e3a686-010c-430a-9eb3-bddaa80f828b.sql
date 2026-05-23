
CREATE TABLE public.site_content (
  key text PRIMARY KEY,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view site content" ON public.site_content FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins can insert site content" ON public.site_content FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(),'admin'));
CREATE POLICY "Admins can update site content" ON public.site_content FOR UPDATE TO authenticated USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));
CREATE POLICY "Admins can delete site content" ON public.site_content FOR DELETE TO authenticated USING (has_role(auth.uid(),'admin'));

CREATE TRIGGER trg_site_content_updated_at BEFORE UPDATE ON public.site_content FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.site_content (key, data) VALUES
('home_pillars', '{"items":[
  {"icon":"watch","title":"Relojería","text":"Marcas que marcan tu tiempo."},
  {"icon":"gem","title":"Joyería","text":"Brillos que cuentan tu historia."},
  {"icon":"shield","title":"Confianza","text":"Productos originales, garantía y respaldo."},
  {"icon":"bag","title":"Experiencia","text":"Asesoría personalizada en cada detalle."}
]}'::jsonb),
('home_emotional', '{"eyebrow":"El regalo perfecto","title":"Cada pieza cuenta una historia. La tuya.","cta_label":"Descubrir piezas con descuento","cta_url":"/catalogo","image":""}'::jsonb),
('home_benefits', '{"items":[
  {"icon":"shield","title":"Confianza","text":"Piezas certificadas. Atención dedicada en cada compra."},
  {"icon":"sparkles","title":"Garantía","text":"Hasta 5 años en relojería y joyería seleccionada."},
  {"icon":"gem","title":"Experiencia personalizada","text":"Asesoría exclusiva para encontrar la pieza ideal."}
]}'::jsonb),
('home_featured', '{"eyebrow":"Selección Rubí","title":"Piezas destacadas","cta_label":"Ver toda la colección →","cta_url":"/catalogo"}'::jsonb),
('home_categories_section', '{"eyebrow":"Colecciones","title":"Dos universos, una visión"}'::jsonb);
