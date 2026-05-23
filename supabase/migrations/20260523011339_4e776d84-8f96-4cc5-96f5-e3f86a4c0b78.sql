ALTER TABLE public.products
  ADD COLUMN stock integer;

COMMENT ON COLUMN public.products.stock IS 'NULL = stock ilimitado; entero = unidades disponibles';