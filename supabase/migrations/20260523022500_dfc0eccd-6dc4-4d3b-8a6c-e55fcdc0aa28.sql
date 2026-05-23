
-- Public bucket for product/banner images
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do update set public = true;

-- Public read
create policy "media public read"
on storage.objects for select
using (bucket_id = 'media');

-- Admin write/update/delete
create policy "media admin insert"
on storage.objects for insert
to authenticated
with check (bucket_id = 'media' and public.has_role(auth.uid(), 'admin'));

create policy "media admin update"
on storage.objects for update
to authenticated
using (bucket_id = 'media' and public.has_role(auth.uid(), 'admin'));

create policy "media admin delete"
on storage.objects for delete
to authenticated
using (bucket_id = 'media' and public.has_role(auth.uid(), 'admin'));
