create extension if not exists pgcrypto;

create table if not exists public.profiles (
    id uuid primary key references auth.users (id) on delete cascade,
    email text not null,
    full_name text not null default '',
    role text not null default 'Buyer and Seller',
    account_type text not null default 'Individual Profile',
    location text not null default 'Set your trading location',
    phone text not null default 'Add your phone number',
    verified boolean not null default false,
    community_rating numeric(3,2) not null default 5,
    rating_count integer not null default 1,
    company_id text,
    company_role text,
    access_status text not null default 'Independent account',
    about text not null default '',
    profile_fields jsonb not null default '{}'::jsonb,
    security jsonb not null default '{}'::jsonb,
    verification_plan jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.listings (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users (id) on delete cascade,
    seller_id text not null,
    category text not null,
    title text not null,
    price text not null,
    unit text not null,
    min_order text not null default '',
    location text not null,
    description text not null default '',
    image_url text not null default 'https://via.placeholder.com/150',
    negotiable boolean not null default false,
    slug text not null,
    verified boolean not null default false,
    posted_by_name text not null default '',
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now())
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = timezone('utc', now());
    return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

drop trigger if exists set_listings_updated_at on public.listings;
create trigger set_listings_updated_at
before update on public.listings
for each row
execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.listings enable row level security;

drop policy if exists "Users can read their own profile" on public.profiles;
create policy "Users can read their own profile"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Authenticated users can read all listings" on public.listings;
drop policy if exists "Users can read their own listings" on public.listings;
create policy "Authenticated users can read all listings"
on public.listings
for select
to authenticated
using (true);

drop policy if exists "Users can insert their own listings" on public.listings;
create policy "Users can insert their own listings"
on public.listings
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own listings" on public.listings;
create policy "Users can update their own listings"
on public.listings
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own listings" on public.listings;
create policy "Users can delete their own listings"
on public.listings
for delete
to authenticated
using (auth.uid() = user_id);
