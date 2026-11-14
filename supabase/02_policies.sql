-- MadLease, file 2 of 6: who is allowed to do what.
--
-- The browser talks to the database directly with a public key, so these rules
-- are the only thing standing between a visitor and the data. Two layers:
--   1. Grants say which tables and columns a role may touch at all.
--   2. Row Level Security policies say which rows.
-- "anon" is a signed-out visitor. "authenticated" is anyone signed in.

alter table public.profiles enable row level security;
alter table public.buildings enable row level security;
alter table public.listings enable row level security;
alter table public.saved_listings enable row level security;

-- Start from nothing, then hand back exactly what each role needs. Supabase
-- gives both roles full access to new tables by default, which is more than
-- we want.
revoke all on public.profiles, public.buildings, public.listings, public.saved_listings
  from anon, authenticated;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------

-- Signed-out visitors get nothing, so names and emails can't be scraped.
grant select on public.profiles to authenticated;

-- Column-level grant: you can edit these fields on your own row, but never
-- your id or email, even with a hand-written request.
grant update (full_name, avatar_path, major, grad_year, bio, phone)
  on public.profiles to authenticated;

drop policy if exists "profiles: signed-in users can read" on public.profiles;
create policy "profiles: signed-in users can read"
  on public.profiles for select to authenticated
  using (true);

drop policy if exists "profiles: update your own" on public.profiles;
create policy "profiles: update your own"
  on public.profiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- No insert or delete policy on purpose: rows are made by the sign-up trigger
-- and removed when the account is deleted.

-- ---------------------------------------------------------------------------
-- buildings
-- ---------------------------------------------------------------------------

grant select on public.buildings to anon, authenticated;

-- A signed-in user can add a place that isn't in the table yet. They can't
-- choose its id or give it a footprint; those columns aren't granted.
grant insert (name, address, lat, lng, created_by) on public.buildings to authenticated;

drop policy if exists "buildings: anyone can read" on public.buildings;
create policy "buildings: anyone can read"
  on public.buildings for select to anon, authenticated
  using (true);

drop policy if exists "buildings: signed-in users can add a place" on public.buildings;
create policy "buildings: signed-in users can add a place"
  on public.buildings for insert to authenticated
  with check (
    created_by = (select auth.uid())
    and footprint is null
    and osm_id is null
  );

-- ---------------------------------------------------------------------------
-- listings
-- ---------------------------------------------------------------------------

grant select on public.listings to anon, authenticated;

-- is_demo, id and the timestamps are left out, so they always take their
-- defaults. owner_id can be set once here and never changed afterwards,
-- because it is missing from the update grant below.
grant insert (
  building_id, owner_id, title, unit_type, beds, baths, roommates, rent, rent_basis,
  furnished, amenities, start_date, end_date, description, photos, status
) on public.listings to authenticated;

grant update (
  building_id, title, unit_type, beds, baths, roommates, rent, rent_basis,
  furnished, amenities, start_date, end_date, description, photos, status
) on public.listings to authenticated;

grant delete on public.listings to authenticated;

-- Everyone sees listings that are active and haven't ended. Owners also see
-- their own taken and expired ones. This is how old listings drop out of
-- browse with no scheduled job: the date check runs on every read.
-- "Today" is Madison's date, not the server's (UTC), so a listing doesn't
-- vanish at 6 pm on its last day.
drop policy if exists "listings: read active ones, plus your own" on public.listings;
create policy "listings: read active ones, plus your own"
  on public.listings for select to anon, authenticated
  using (
    (status = 'active' and end_date >= (now() at time zone 'America/Chicago')::date)
    or owner_id = (select auth.uid())
  );

drop policy if exists "listings: post as yourself" on public.listings;
create policy "listings: post as yourself"
  on public.listings for insert to authenticated
  with check (owner_id = (select auth.uid()) and is_demo = false);

drop policy if exists "listings: edit your own" on public.listings;
create policy "listings: edit your own"
  on public.listings for update to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

drop policy if exists "listings: delete your own" on public.listings;
create policy "listings: delete your own"
  on public.listings for delete to authenticated
  using (owner_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- saved_listings
-- ---------------------------------------------------------------------------

grant select, insert, delete on public.saved_listings to authenticated;

drop policy if exists "saved: read your own" on public.saved_listings;
create policy "saved: read your own"
  on public.saved_listings for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "saved: save as yourself" on public.saved_listings;
create policy "saved: save as yourself"
  on public.saved_listings for insert to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists "saved: unsave your own" on public.saved_listings;
create policy "saved: unsave your own"
  on public.saved_listings for delete to authenticated
  using (user_id = (select auth.uid()));
