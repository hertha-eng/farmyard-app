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

create table if not exists public.conversations (
    id uuid primary key default gen_random_uuid(),
    listing_id uuid,
    listing_title text not null default '',
    seller_id text,
    owner_user_id uuid not null references auth.users (id) on delete cascade,
    owner_name text not null default '',
    buyer_user_id uuid not null references auth.users (id) on delete cascade,
    buyer_name text not null default '',
    location text not null default '',
    owner_last_read_at timestamptz,
    buyer_last_read_at timestamptz,
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now())
);

alter table public.conversations add column if not exists owner_last_read_at timestamptz;
alter table public.conversations add column if not exists buyer_last_read_at timestamptz;

create table if not exists public.messages (
    id uuid primary key default gen_random_uuid(),
    conversation_id uuid not null references public.conversations (id) on delete cascade,
    sender_user_id uuid not null references auth.users (id) on delete cascade,
    sender_name text not null default '',
    body text not null default '',
    attachments jsonb not null default '[]'::jsonb,
    created_at timestamptz not null default timezone('utc', now())
);

do $$
begin
    if exists (
        select 1
        from pg_publication
        where pubname = 'supabase_realtime'
    ) and not exists (
        select 1
        from pg_publication_tables
        where pubname = 'supabase_realtime'
          and schemaname = 'public'
          and tablename = 'conversations'
    ) then
        execute 'alter publication supabase_realtime add table public.conversations';
    end if;

    if exists (
        select 1
        from pg_publication
        where pubname = 'supabase_realtime'
    ) and not exists (
        select 1
        from pg_publication_tables
        where pubname = 'supabase_realtime'
          and schemaname = 'public'
          and tablename = 'messages'
    ) then
        execute 'alter publication supabase_realtime add table public.messages';
    end if;
end
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = timezone('utc', now());
    return new;
end;
$$;

create or replace function public.ensure_agriculture_listing()
returns trigger
language plpgsql
as $$
declare
    normalized_text text;
    agriculture_keywords text[] := array[
        'agriculture', 'agricultural', 'farm', 'farming', 'farmer', 'crop', 'crops', 'harvest',
        'produce', 'grain', 'grains', 'maize', 'corn', 'beans', 'rice', 'cassava', 'banana',
        'plantain', 'coffee', 'tea', 'sorghum', 'millet', 'groundnut', 'peanut', 'soy', 'soybean',
        'tomato', 'onion', 'cabbage', 'pepper', 'okra', 'carrot', 'potato', 'avocado', 'mango',
        'fruit', 'vegetable', 'vegetables', 'seed', 'seeds', 'seedling', 'seedlings', 'nursery',
        'fertilizer', 'manure', 'compost', 'pesticide', 'herbicide', 'feed', 'hay', 'silage',
        'livestock', 'poultry', 'chicken', 'broiler', 'layer', 'goat', 'goats', 'cow', 'cattle',
        'dairy', 'milk', 'egg', 'eggs', 'pig', 'pigs', 'fish', 'fingerling', 'beekeeping', 'honey',
        'tractor', 'plough', 'ploughing', 'harrow', 'irrigation', 'greenhouse', 'acre', 'hectare',
        'farm input', 'farm inputs', 'feed mill'
    ];
    blocked_keywords text[] := array[
        'iphone', 'smartphone', 'phone', 'android phone', 'laptop', 'macbook', 'tablet', 'airpods',
        'television', 'tv', 'speaker', 'headphones', 'fridge', 'microwave', 'sofa', 'mattress',
        'handbag', 'shoes', 'sneakers', 'dress', 'watch', 'jewelry', 'perfume', 'makeup',
        'playstation', 'ps5', 'xbox', 'gaming', 'crypto', 'forex'
    ];
    matched_agriculture_term text;
    matched_blocked_term text;
begin
    normalized_text := lower(
        regexp_replace(
            concat_ws(' ', coalesce(new.title, ''), coalesce(new.description, ''), coalesce(new.unit, '')),
            '[^a-z0-9\s]+',
            ' ',
            'g'
        )
    );

    select keyword
    into matched_agriculture_term
    from unnest(agriculture_keywords) as keyword
    where normalized_text like '%' || keyword || '%'
    limit 1;

    select keyword
    into matched_blocked_term
    from unnest(blocked_keywords) as keyword
    where normalized_text like '%' || keyword || '%'
    limit 1;

    if matched_blocked_term is not null and matched_agriculture_term is null then
        raise exception 'FarmYard only accepts agriculture-related listings. Found unrelated term: %', matched_blocked_term
            using errcode = '23514';
    end if;

    if matched_agriculture_term is null then
        raise exception 'FarmYard only accepts agriculture-related listings. Add a clear farm product, input, livestock item, or agricultural service to the title or description.'
            using errcode = '23514';
    end if;

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

drop trigger if exists ensure_agriculture_listing on public.listings;
create trigger ensure_agriculture_listing
before insert or update on public.listings
for each row
execute function public.ensure_agriculture_listing();

drop trigger if exists set_conversations_updated_at on public.conversations;
create trigger set_conversations_updated_at
before update on public.conversations
for each row
execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.listings enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;

drop policy if exists "Users can read their own profile" on public.profiles;
drop policy if exists "Authenticated users can read all profiles" on public.profiles;
create policy "Authenticated users can read all profiles"
on public.profiles
for select
to authenticated
using (true);

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

drop policy if exists "Conversation participants can read conversations" on public.conversations;
create policy "Conversation participants can read conversations"
on public.conversations
for select
to authenticated
using (auth.uid() = owner_user_id or auth.uid() = buyer_user_id);

drop policy if exists "Authenticated users can create conversations they join" on public.conversations;
create policy "Authenticated users can create conversations they join"
on public.conversations
for insert
to authenticated
with check (auth.uid() = owner_user_id or auth.uid() = buyer_user_id);

drop policy if exists "Conversation participants can update conversations" on public.conversations;
create policy "Conversation participants can update conversations"
on public.conversations
for update
to authenticated
using (auth.uid() = owner_user_id or auth.uid() = buyer_user_id)
with check (auth.uid() = owner_user_id or auth.uid() = buyer_user_id);

drop policy if exists "Conversation participants can read messages" on public.messages;
create policy "Conversation participants can read messages"
on public.messages
for select
to authenticated
using (
    exists (
        select 1
        from public.conversations
        where public.conversations.id = conversation_id
          and (auth.uid() = public.conversations.owner_user_id or auth.uid() = public.conversations.buyer_user_id)
    )
);

drop policy if exists "Conversation participants can create messages" on public.messages;
create policy "Conversation participants can create messages"
on public.messages
for insert
to authenticated
with check (
    auth.uid() = sender_user_id
    and exists (
        select 1
        from public.conversations
        where public.conversations.id = conversation_id
          and (auth.uid() = public.conversations.owner_user_id or auth.uid() = public.conversations.buyer_user_id)
    )
);
