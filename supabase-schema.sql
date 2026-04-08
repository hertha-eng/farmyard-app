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
    image_url text not null default 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%22640%22%20height%3D%22420%22%20viewBox%3D%220%200%20640%20420%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22farmyardListingGradient%22%20x1%3D%220%25%22%20y1%3D%220%25%22%20x2%3D%22100%25%22%20y2%3D%22100%25%22%3E%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%23eef5df%22%20/%3E%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%23d7e7c1%22%20/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect%20width%3D%22640%22%20height%3D%22420%22%20rx%3D%2228%22%20fill%3D%22url%28%23farmyardListingGradient%29%22%20/%3E%3Ccircle%20cx%3D%22144%22%20cy%3D%22126%22%20r%3D%2244%22%20fill%3D%22%23f5d98a%22%20/%3E%3Cpath%20d%3D%22M0%20320%20C110%20248%20198%20248%20296%20320%20S490%20392%20640%20286%20V420%20H0%20Z%22%20fill%3D%22%23a7c97f%22%20/%3E%3Cpath%20d%3D%22M0%20356%20C134%20292%20244%20304%20368%20360%20S518%20402%20640%20336%20V420%20H0%20Z%22%20fill%3D%22%236f9b58%22%20opacity%3D%220.92%22%20/%3E%3Crect%20x%3D%22228%22%20y%3D%22154%22%20width%3D%22184%22%20height%3D%22112%22%20rx%3D%2220%22%20fill%3D%22%23fffdf6%22%20opacity%3D%220.96%22%20/%3E%3Ctext%20x%3D%22320%22%20y%3D%22204%22%20text-anchor%3D%22middle%22%20fill%3D%22%232f6b3b%22%20font-family%3D%22Segoe%20UI%2C%20Arial%2C%20sans-serif%22%20font-size%3D%2230%22%20font-weight%3D%22700%22%3EFarmYard%3C/text%3E%3Ctext%20x%3D%22320%22%20y%3D%22238%22%20text-anchor%3D%22middle%22%20fill%3D%22%23617067%22%20font-family%3D%22Segoe%20UI%2C%20Arial%2C%20sans-serif%22%20font-size%3D%2218%22%3EListing%20photo%3C/text%3E%3C/svg%3E',
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
    reactions jsonb not null default '{}'::jsonb,
    deleted_at timestamptz,
    deleted_by_user_id uuid references auth.users (id) on delete set null,
    created_at timestamptz not null default timezone('utc', now())
);

alter table public.messages add column if not exists reactions jsonb not null default '{}'::jsonb;
alter table public.messages add column if not exists deleted_at timestamptz;
alter table public.messages add column if not exists deleted_by_user_id uuid references auth.users (id) on delete set null;

create table if not exists public.call_sessions (
    id uuid primary key default gen_random_uuid(),
    caller_user_id uuid not null references auth.users (id) on delete cascade,
    caller_name text not null default '',
    callee_user_id uuid not null references auth.users (id) on delete cascade,
    callee_name text not null default '',
    status text not null default 'ringing',
    offer_sdp jsonb,
    answer_sdp jsonb,
    started_at timestamptz,
    ended_at timestamptz,
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now()),
    constraint call_sessions_participants_different check (caller_user_id <> callee_user_id)
);

create table if not exists public.call_ice_candidates (
    id uuid primary key default gen_random_uuid(),
    session_id uuid not null references public.call_sessions (id) on delete cascade,
    sender_user_id uuid not null references auth.users (id) on delete cascade,
    candidate jsonb not null,
    created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.user_blocks (
    id uuid primary key default gen_random_uuid(),
    blocker_user_id uuid not null references auth.users (id) on delete cascade,
    blocked_user_id uuid not null references auth.users (id) on delete cascade,
    created_at timestamptz not null default timezone('utc', now()),
    unique (blocker_user_id, blocked_user_id)
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

    if exists (
        select 1
        from pg_publication
        where pubname = 'supabase_realtime'
    ) and not exists (
        select 1
        from pg_publication_tables
        where pubname = 'supabase_realtime'
          and schemaname = 'public'
          and tablename = 'call_sessions'
    ) then
        execute 'alter publication supabase_realtime add table public.call_sessions';
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
          and tablename = 'call_ice_candidates'
    ) then
        execute 'alter publication supabase_realtime add table public.call_ice_candidates';
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

drop trigger if exists set_call_sessions_updated_at on public.call_sessions;
create trigger set_call_sessions_updated_at
before update on public.call_sessions
for each row
execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.listings enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.call_sessions enable row level security;
alter table public.call_ice_candidates enable row level security;
alter table public.user_blocks enable row level security;

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
drop policy if exists "Anyone can read all listings" on public.listings;
create policy "Anyone can read all listings"
on public.listings
for select
to public
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

drop policy if exists "Conversation participants can update messages" on public.messages;
create policy "Conversation participants can update messages"
on public.messages
for update
to authenticated
using (
    exists (
        select 1
        from public.conversations
        where public.conversations.id = conversation_id
          and (auth.uid() = public.conversations.owner_user_id or auth.uid() = public.conversations.buyer_user_id)
    )
)
with check (
    exists (
        select 1
        from public.conversations
        where public.conversations.id = conversation_id
          and (auth.uid() = public.conversations.owner_user_id or auth.uid() = public.conversations.buyer_user_id)
    )
);

drop policy if exists "Call participants can read sessions" on public.call_sessions;
create policy "Call participants can read sessions"
on public.call_sessions
for select
to authenticated
using (auth.uid() = caller_user_id or auth.uid() = callee_user_id);

drop policy if exists "Users can create outgoing call sessions" on public.call_sessions;
create policy "Users can create outgoing call sessions"
on public.call_sessions
for insert
to authenticated
with check (auth.uid() = caller_user_id and caller_user_id <> callee_user_id);

drop policy if exists "Call participants can update sessions" on public.call_sessions;
create policy "Call participants can update sessions"
on public.call_sessions
for update
to authenticated
using (auth.uid() = caller_user_id or auth.uid() = callee_user_id)
with check (auth.uid() = caller_user_id or auth.uid() = callee_user_id);

drop policy if exists "Call participants can read ICE candidates" on public.call_ice_candidates;
create policy "Call participants can read ICE candidates"
on public.call_ice_candidates
for select
to authenticated
using (
    exists (
        select 1
        from public.call_sessions
        where public.call_sessions.id = session_id
          and (auth.uid() = public.call_sessions.caller_user_id or auth.uid() = public.call_sessions.callee_user_id)
    )
);

drop policy if exists "Call participants can create ICE candidates" on public.call_ice_candidates;
create policy "Call participants can create ICE candidates"
on public.call_ice_candidates
for insert
to authenticated
with check (
    auth.uid() = sender_user_id
    and exists (
        select 1
        from public.call_sessions
        where public.call_sessions.id = session_id
          and (auth.uid() = public.call_sessions.caller_user_id or auth.uid() = public.call_sessions.callee_user_id)
    )
);

drop policy if exists "Users can read related blocks" on public.user_blocks;
create policy "Users can read related blocks"
on public.user_blocks
for select
to authenticated
using (auth.uid() = blocker_user_id or auth.uid() = blocked_user_id);

drop policy if exists "Users can create their own blocks" on public.user_blocks;
create policy "Users can create their own blocks"
on public.user_blocks
for insert
to authenticated
with check (auth.uid() = blocker_user_id and blocker_user_id <> blocked_user_id);

drop policy if exists "Users can remove their own blocks" on public.user_blocks;
create policy "Users can remove their own blocks"
on public.user_blocks
for delete
to authenticated
using (auth.uid() = blocker_user_id);
