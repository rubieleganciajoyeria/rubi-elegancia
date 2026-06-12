-- Replace validate_coupon function to resolve ambiguous "code" reference
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
  -- FIX: Using public.coupons.code instead of just code to avoid ambiguity with output parameter code
  SELECT * INTO c FROM public.coupons WHERE upper(public.coupons.code) = upper(_code) LIMIT 1;
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
