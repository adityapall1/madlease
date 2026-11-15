-- MadLease, file 3 of 6: photo storage.
--
-- Two buckets. Anyone can view a file through its public URL (listings are
-- public, and so are the photos on them), but writing is locked down below.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars', 'avatars', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('listing-photos', 'listing-photos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Every file lives in a folder named after its owner's user id:
--   avatars/<user id>/avatar.webp
--   listing-photos/<user id>/<listing id>/<number>.webp
-- storage.foldername(name) splits the path into folders, so [1] is that first
-- folder. Each rule below only passes when it matches the signed-in user,
-- which means nobody can write into, replace or delete someone else's files.

-- Replacing or deleting a file needs to "see" it first, so owners can read
-- their own folder through the API. Public viewing goes through the public
-- URL and doesn't use this rule.
drop policy if exists "madlease: read your own files" on storage.objects;
create policy "madlease: read your own files"
  on storage.objects for select to authenticated
  using (
    bucket_id in ('avatars', 'listing-photos')
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "madlease: upload into your own folder" on storage.objects;
create policy "madlease: upload into your own folder"
  on storage.objects for insert to authenticated
  with check (
    bucket_id in ('avatars', 'listing-photos')
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "madlease: replace your own files" on storage.objects;
create policy "madlease: replace your own files"
  on storage.objects for update to authenticated
  using (
    bucket_id in ('avatars', 'listing-photos')
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id in ('avatars', 'listing-photos')
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "madlease: delete your own files" on storage.objects;
create policy "madlease: delete your own files"
  on storage.objects for delete to authenticated
  using (
    bucket_id in ('avatars', 'listing-photos')
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
