# FarmYard Mobile Launch Prep

This repo is now scaffolded for Capacitor packaging, and separate mobile handoff folders have been created for Android and iPhone. The remaining work that must happen on a build machine is native project generation and store-signing setup.

## Current Blocker In This Workspace

- Node.js and npm are not installed in this environment.
- The filesystem is full, so native Android and iPhone folders could not be generated here yet.
- Because of that, `android/` and `ios/` are still pending creation.

## What Is Ready In This Repo

- `package.json` with Capacitor dependencies and common commands
- `capacitor.config.json` with app-level plugin defaults
- `script.js` with native-friendly Google OAuth handling for Capacitor app builds
- `farmyard-draft-logo.png` as the source app icon
- `index.html`, `manifest.webmanifest`, and `style.css` updated for mobile safe-area and install metadata
- `farmyard-android/` as a standalone Android packaging workspace
- `farmyard-ios/` as a standalone iPhone packaging workspace

## First-Time Setup

1. Install Node.js 20 or newer.
2. Run `npm install`.
3. Run `npm run cap:add:android`.
4. Run `npm run cap:add:ios`.
5. Run `npm run cap:sync`.
6. Run `npm run cap:assets`.

## Separate Mobile Folders

The split mobile workspaces already exist:

- `farmyard-android/`
- `farmyard-ios/`

Each folder includes copied web assets, a platform-specific `package.json`, a `capacitor.config.json`, a bootstrap script, and store submission docs.

## Android Requirements

1. Install Android Studio.
2. Open the project with `npm run cap:open:android`.
3. Set the final app name, version code, and version name.
4. Confirm microphone permission is present for in-app audio calling.
5. Build and test on a real Android device.
6. Create a signed release build for Play Store upload.

## iPhone Requirements

1. Use a Mac with Xcode installed.
2. Open the project with `npm run cap:open:ios`.
3. Set the final bundle signing team and version numbers.
4. Add microphone permission text in `Info.plist`.
5. Add the custom URL scheme `farmyard` for OAuth callback handling.
6. Test on a real iPhone before App Store submission.

## Supabase OAuth Configuration

Add both of these redirect URLs in Supabase Auth:

- web: your deployed web URL
- mobile: `farmyard://auth/callback`

Make sure Google OAuth in Supabase is configured to allow the final deployed website URL and the mobile callback flow.

## Store Submission Checklist

- privacy policy URL is public and final
- screenshots are prepared for Android and iPhone
- support email is active
- app category, age rating, and metadata are filled in
- microphone usage text clearly explains in-app calling
- Google sign-in and email sign-in both work on real devices
- chat, notifications, and audio call flows are tested on two real accounts

## Suggested Command Order

```bash
npm install
npm run cap:add:android
npm run cap:add:ios
npm run cap:sync
npm run cap:assets
```
