-- Coupons table
CREATE TABLE public.coupons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  kind TEXT NOT NULL DEFAULT 'percent', -- 'percent' | 'fixed'
  value INTEGER NOT NULL CHECK (value > 0),
  min_subtotal BIGINT NOT NULL DEFAULT 0,
  max_uses INTEGER,
  used_count INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_coupons_code ON public.coupons (upper(code));

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage coupons" ON public.coupons
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_coupons_updated_at
  BEFORE UPDATE ON public.coupons
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Orders: track applied coupon
ALTER TABLE public.orders
  ADD COLUMN coupon_code TEXT NOT NULL DEFAULT '',
  ADD COLUMN discount BIGINT NOT NULL DEFAULT 0;

-- Public RPC to validate a coupon (no row exposure)
CREATE OR REPLACE FUNCTION public.validate_coupon(_code TEXT, _subtotal BIGINT)
RETURNS TABLE (
  valid BOOLEAN,
  code TEXT,
  kind TEXT,
  value INTEGER,
  discount BIGINT,
  reason TEXT
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  c RECORD;
  d BIGINT := 0;
BEGIN
  SELECT * INTO c FROM public.coupons WHERE upper(code) = upper(_code) LIMIT 1;
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, _code, ''::TEXT, 0, 0::BIGINT, 'Cupón no encontrado';
    RETURN;
  END IF;
  IF NOT c.is_active THEN
    RETURN QUERY SELECT false, c.code, c.kind, c.value, 0::BIGINT, 'Cupón inactivo'; RETURN;
  END IF;
  IF c.expires_at IS NOT NULL AND c.expires_at < now() THEN
    RETURN QUERY SELECT false, c.code, c.kind, c.value, 0::BIGINT, 'Cupón vencido'; RETURN;
  END IF;
  IF c.max_uses IS NOT NULL AND c.used_count >= c.max_uses THEN
    RETURN QUERY SELECT false, c.code, c.kind, c.value, 0::BIGINT, 'Cupón agotado'; RETURN;
  END IF;
  IF _subtotal < c.min_subtotal THEN
    RETURN QUERY SELECT false, c.code, c.kind, c.value, 0::BIGINT,
      'Compra mínima requerida'; RETURN;
  END IF;
  IF c.kind = 'percent' THEN
    d := (_subtotal * c.value) / 100;
  ELSE
    d := LEAST(c.value::BIGINT, _subtotal);
  END IF;
  RETURN QUERY SELECT true, c.code, c.kind, c.value, d, ''::TEXT;
END;
$$;

GRANT EXECUTE ON FUNCTION public.validate_coupon(TEXT, BIGINT) TO anon, authenticated;