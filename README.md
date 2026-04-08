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
- `manifest.webmanifest` - installable web app metadata
- `capacitor.config.json` - Android and iPhone wrapper configuration starter
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
- save shared conversations to `conversations`
- save shared messages to `messages`
- save in-app call sessions and WebRTC signaling data to `call_sessions` and `call_ice_candidates`
- reload both on refresh after login

## Web, Android, And iPhone Access

FarmYard now has a platform-aware setup:

- `Web App`: browser users can open the phone dialer for seller calls
- `Android App`: installed app builds can use in-app audio calling
- `iPhone App`: installed app builds can use in-app audio calling

All three should point to the same Supabase project so users can sign in normally and keep the same listings, chats, and account history everywhere.

## Mobile Build Starter

The included `capacitor.config.json` is a starter split for packaging the same FarmYard codebase into Android and iPhone app-store builds.

To continue from here:

1. Add Capacitor to the project.
2. Create Android and iOS platform folders.
3. Keep the same Supabase URL and publishable key in all builds.
4. Request microphone permission in the mobile app builds so in-app audio calling can work.

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

## Agriculture-Only Enforcement

The included `supabase-schema.sql` now adds a database trigger on `public.listings` that rejects inserts or updates when the title and description do not look agriculture-related.

If you already created the tables before this update:

1. Open the Supabase SQL editor.
2. Rerun the full `supabase-schema.sql` file, or at minimum rerun the new function and trigger definitions for `public.ensure_agriculture_listing()`.
3. Test by trying one valid listing and one unrelated listing.

This matters because browser-only validation can be bypassed, but the database trigger still blocks invalid posts before they are stored.

## Real-Time Messaging

Messages and conversations now use Supabase Realtime instead of the old 5-second polling loop.

To enable it in an existing project:

1. Open the Supabase SQL editor.
2. Rerun the full `supabase-schema.sql` file so `public.conversations` and `public.messages` are added to the `supabase_realtime` publication.
3. Keep Realtime enabled for the project in Supabase.

After that, users in the same conversation should see new messages appear immediately.

## Direct User Messaging

Users can now message each other directly from profile pages, not only from listing cards.

To make that work in Supabase:

1. Rerun `supabase-schema.sql`.
2. Make sure authenticated users can read `public.profiles`, because profile discovery is what powers direct user-to-user messaging.
3. Sign in with two different accounts and open one profile from the marketplace search results, then use the new message action.

## Local Preview

Open `index.html` in a browser, or serve the folder with any static file server.
