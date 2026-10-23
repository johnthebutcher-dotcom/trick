-- Private per-user storage bucket. Files live under <user_id>/<filename> and
-- only that user can touch them. Use it only when a feature must keep files;
-- the default for photos is to extract data and discard the image.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('uploads', 'uploads', false, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "uploads: owner can read"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'uploads' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "uploads: owner can insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'uploads' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "uploads: owner can update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'uploads' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "uploads: owner can delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'uploads' and (storage.foldername(name))[1] = (select auth.uid())::text);
