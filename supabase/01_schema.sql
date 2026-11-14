-- MadLease, file 1 of 6: tables, constraints, indexes and triggers.
--
-- Paste the files in this folder into the Supabase SQL editor in number order.
-- Every file is safe to run again: nothing here drops data.

-- ---------------------------------------------------------------------------
-- profiles: one row per signed-in user, made by a trigger (see the bottom of
-- this file), never by the browser.
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text check (char_length(full_name) <= 80),
  avatar_path text,
  major text check (char_length(major) <= 80),
  grad_year smallint check (grad_year between 2020 and 2035),
  bio text check (char_length(bio) <= 300),
  phone text check (char_length(phone) <= 30),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- buildings: the places listings are attached to.
--
-- The 26 seeded buildings keep their short text ids ("james", "hub") so links
-- stay readable. Places added by users get a random id from the default.
-- ---------------------------------------------------------------------------
create table if not exists public.buildings (
  id text primary key default gen_random_uuid()::text,
  name text not null check (char_length(name) between 1 and 80),
  address text not null check (char_length(address) between 1 and 120),
  lat double precision not null,
  lng double precision not null,
  -- GeoJSON Polygon or MultiPolygon from OpenStreetMap. Null for places added
  -- by users, which the map draws as a dot instead.
  footprint jsonb,
  osm_id bigint,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  -- A pin can't be dropped outside Madison. The box is the City of Madison's
  -- boundary from OpenStreetMap, rounded outward (scripts/fetch-osm.mjs prints it).
  constraint buildings_in_madison check (
    lat between 42.99 and 43.18 and lng between -89.58 and -89.23
  )
);

-- ---------------------------------------------------------------------------
-- listings: one sublease.
-- ---------------------------------------------------------------------------
create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  building_id text not null references public.buildings (id),
  owner_id uuid references public.profiles (id) on delete cascade,
  is_demo boolean not null default false,
  title text not null check (char_length(title) between 3 and 80),
  unit_type text not null check (unit_type in ('entire', 'room')),
  -- 0 beds means a studio.
  beds smallint not null check (beds between 0 and 8),
  -- Half steps only: 1, 1.5, 2 ...
  baths numeric(3, 1) not null check (baths between 0.5 and 8 and baths * 2 = trunc(baths * 2)),
  roommates smallint,
  -- Whole dollars per month.
  rent integer not null check (rent between 100 and 10000),
  rent_basis text not null check (rent_basis in ('per_person', 'whole_unit')),
  furnished boolean not null default false,
  amenities text[] not null default '{}' check (
    amenities <@ array['laundry', 'parking', 'gym', 'pets', 'utilities', 'ac', 'balcony', 'dishwasher']
  ),
  start_date date not null,
  end_date date not null,
  description text not null default '' check (char_length(description) <= 2000),
  -- Storage paths inside the listing-photos bucket. The first one is the cover.
  photos text[] not null default '{}' check (cardinality(photos) <= 6),
  status text not null default 'active' check (status in ('active', 'taken')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint listings_dates check (end_date > start_date),
  -- Roommates only make sense for a room in a shared place, and a room must
  -- say how many. "is not null" is spelled out because a check that works out
  -- to "unknown" counts as passing, which would let an empty value through.
  constraint listings_roommates check (
    (unit_type = 'room' and roommates is not null and roommates between 1 and 10)
    or (unit_type = 'entire' and roommates is null)
  ),
  -- The price of a room is always what one person pays.
  constraint listings_room_basis check (unit_type = 'entire' or rent_basis = 'per_person'),
  -- Only demo rows may have no owner, and demo rows never have one.
  constraint listings_demo_owner check (is_demo = (owner_id is null))
);

create index if not exists listings_building_id_idx on public.listings (building_id);
create index if not exists listings_owner_id_idx on public.listings (owner_id);
create index if not exists listings_status_end_date_idx on public.listings (status, end_date);

-- ---------------------------------------------------------------------------
-- saved_listings: which user hearted which listing.
-- ---------------------------------------------------------------------------
create table if not exists public.saved_listings (
  user_id uuid not null references public.profiles (id) on delete cascade,
  listing_id uuid not null references public.listings (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, listing_id)
);

create index if not exists saved_listings_listing_id_idx on public.saved_listings (listing_id);

-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------

-- Keeps updated_at honest without trusting the browser to send it.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists listings_set_updated_at on public.listings;
create trigger listings_set_updated_at
  before update on public.listings
  for each row execute function public.set_updated_at();

-- Makes the profile row when someone signs up. It runs as the function's owner
-- (security definer) because the person signing up has no right to insert
-- into profiles themselves.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, lower(new.email))
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Anyone who signed up before this file was run still gets a profile.
insert into public.profiles (id, email)
select id, lower(email) from auth.users where email is not null
on conflict (id) do nothing;
