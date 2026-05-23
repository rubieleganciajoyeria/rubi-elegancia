ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS wompi_reference text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS wompi_transaction_id text NOT NULL DEFAULT '';

CREATE INDEX IF NOT EXISTS orders_wompi_reference_idx ON public.orders(wompi_reference);