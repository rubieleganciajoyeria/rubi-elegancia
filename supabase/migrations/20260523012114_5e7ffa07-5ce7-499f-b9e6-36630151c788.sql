
CREATE TYPE public.order_status AS ENUM ('pending','confirmed','paid','shipped','delivered','cancelled');

CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text NOT NULL,
  city text NOT NULL,
  address text NOT NULL,
  notes text NOT NULL DEFAULT '',
  subtotal bigint NOT NULL DEFAULT 0,
  shipping bigint NOT NULL DEFAULT 0,
  total bigint NOT NULL DEFAULT 0,
  status public.order_status NOT NULL DEFAULT 'pending',
  payment_method text NOT NULL DEFAULT 'pending',
  payment_reference text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  product_slug text NOT NULL DEFAULT '',
  product_image text NOT NULL DEFAULT '',
  unit_price bigint NOT NULL,
  qty integer NOT NULL CHECK (qty > 0),
  subtotal bigint NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- orders policies
CREATE POLICY "Anyone can create orders" ON public.orders FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins can view all orders" ON public.orders FOR SELECT TO authenticated USING (has_role(auth.uid(),'admin'));
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins can update orders" ON public.orders FOR UPDATE TO authenticated USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));
CREATE POLICY "Admins can delete orders" ON public.orders FOR DELETE TO authenticated USING (has_role(auth.uid(),'admin'));

-- order_items policies
CREATE POLICY "Anyone can create order items" ON public.order_items FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins can view all order items" ON public.order_items FOR SELECT TO authenticated USING (has_role(auth.uid(),'admin'));
CREATE POLICY "Users can view own order items" ON public.order_items FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_items.order_id AND o.user_id = auth.uid())
);
CREATE POLICY "Admins can update order items" ON public.order_items FOR UPDATE TO authenticated USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));
CREATE POLICY "Admins can delete order items" ON public.order_items FOR DELETE TO authenticated USING (has_role(auth.uid(),'admin'));

CREATE TRIGGER trg_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
