# FarmYard Android

This folder is a standalone Android handoff repo for packaging the FarmYard web app with Capacitor.

## Included

- `web/` with the current FarmYard HTML, CSS, JS, manifest, service worker, and app icon
- `package.json` with Android-focused Capacitor scripts
- `capacitor.config.json` configured for the Play Store package id
- `docs/` with release, QA, and store metadata checklists
- deployable `web/privacy.html` and `web/support.html` pages for Play Store metadata URLs
- `scripts/bootstrap-android.sh` to generate the native Android project once Node.js is available

## Current Status

Android repo creation is complete.

Native Android project generation is still pending because this workspace currently does not have a working Node.js toolchain and the disk was full during setup. On a machine with Node.js 20+ and Android Studio installed, this folder is ready for:

```bash
npm install
npm run cap:add:android
npm run cap:sync
npm run cap:assets
```

## Launch Blockers Still Requiring A Build Machine

- generate the real `android/` folder with Capacitor
- open the project in Android Studio
- create the Play Store signing key
- build and test on at least one physical Android device
- produce the signed `.aab` for Play Console upload

## Supabase And OAuth

Keep the same Supabase project used by the web app and add this mobile redirect:

- `farmyard://auth/callback`

Google sign-in should be tested after the generated Android project is installed on a device.
