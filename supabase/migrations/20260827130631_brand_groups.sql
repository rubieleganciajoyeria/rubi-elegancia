CREATE TABLE public.brand_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.brand_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active brand groups"
  ON public.brand_groups FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can view all brand groups"
  ON public.brand_groups FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert brand groups"
  ON public.brand_groups FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update brand groups"
  ON public.brand_groups FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete brand groups"
  ON public.brand_groups FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

CREATE TRIGGER brand_groups_set_updated_at
  BEFORE UPDATE ON public.brand_groups
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.brand_groups (slug, name, sort_order) VALUES
  ('swiss', 'Marcas Suizas', 1),
  ('fashion', 'Marcas Fashion', 2),
  ('jewelry', 'Joyería', 3);
