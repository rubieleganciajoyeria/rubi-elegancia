ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS wompi_payload jsonb NOT NULL DEFAULT '{}'::jsonb;
CREATE INDEX IF NOT EXISTS idx_orders_wompi_reference ON public.orders (wompi_reference);