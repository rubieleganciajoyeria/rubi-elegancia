create table if not exists public.product_reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null,
  user_id uuid not null,
  rating int not null check (rating between 1 and 5),
  title text not null default '',
  body text not null default '',
  is_approved boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, user_id)
);

create index if not exists product_reviews_product_idx on public.product_reviews(product_id);

alter table public.product_reviews enable row level security;

create policy "Anyone can view approved reviews"
  on public.product_reviews for select
  using (is_approved = true);

create policy "Users view own reviews"
  on public.product_reviews for select
  to authenticated
  using (user_id = auth.uid());

create policy "Admins view all reviews"
  on public.product_reviews for select
  to authenticated
  using (has_role(auth.uid(), 'admin'));

create policy "Users insert own review"
  on public.product_reviews for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "Users update own review"
  on public.product_reviews for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Users delete own review"
  on public.product_reviews for delete
  to authenticated
  using (user_id = auth.uid());

create policy "Admins manage reviews"
  on public.product_reviews for all
  to authenticated
  using (has_role(auth.uid(), 'admin'))
  with check (has_role(auth.uid(), 'admin'));

create trigger product_reviews_set_updated_at
  before update on public.product_reviews
  for each row execute function public.set_updated_at();