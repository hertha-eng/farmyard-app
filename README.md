# FarmYard

FarmYard is an agriculture-focused marketplace prototype built with plain HTML, CSS, and JavaScript.

## Features

- Agriculture-only marketplace for produce, raw materials, finished goods, and services
- Listing creation and account management
- Messaging and user trust flows
- Seller and company profiles with privacy controls
- Saved listings, order requests, and scheduled orders
- Legal and account security sections

## Project Structure

- `index.html` - app structure and screens
- `style.css` - styling and responsive layout
- `script.js` - app behavior and UI state
- `netlify.toml` - Netlify deploy configuration

## Deploying To Netlify

This project is configured as a static site.

- Build command: leave blank
- Publish directory: `.`

## Supabase Persistence Setup

To make profile edits and user-created listings persist after refresh:

1. Open the Supabase SQL editor.
2. Run the SQL in `supabase-schema.sql`.
3. Make sure the authenticated user can access the `profiles` and `listings` tables through the included RLS policies.

After the schema is created, the app will:

- save signed-in user profile edits to `profiles`
- save created and edited listings to `listings`
- reload both on refresh after login

## Shared Listings Policy Update

To let authenticated users see listings created by other authenticated users, run the updated policy in the Supabase SQL Editor.

You can either rerun the full `supabase-schema.sql` file or run just this policy update:

```sql
drop policy if exists "Authenticated users can read all listings" on public.listings;
drop policy if exists "Users can read their own listings" on public.listings;

create policy "Authenticated users can read all listings"
on public.listings
for select
to authenticated
using (true);
```

After this runs successfully, marketplace listing updates will be visible to other signed-in users.

## Local Preview

Open `index.html` in a browser, or serve the folder with any static file server.
