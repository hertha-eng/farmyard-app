# FarmYard iPhone

This folder is a standalone iPhone handoff repo for packaging the FarmYard web app with Capacitor.

## Included

- `web/` with the current FarmYard HTML, CSS, JS, manifest, service worker, and app icon
- `package.json` with iPhone-focused Capacitor scripts
- `capacitor.config.json` configured for the App Store bundle id
- `docs/` with release, QA, and App Store metadata checklists
- `scripts/bootstrap-ios.sh` to generate the native iOS project once Node.js is available

## Current Status

iPhone repo creation is complete.

Native iOS project generation is still pending because this workspace currently does not have a working Node.js toolchain and the disk was full during setup. On a Mac with Node.js 20+ and Xcode installed, this folder is ready for:

```bash
npm install
npm run cap:add:ios
npm run cap:sync
npm run cap:assets
```

## Launch Blockers Still Requiring A Mac

- generate the real `ios/` folder with Capacitor
- open the project in Xcode
- set the Apple developer team and signing profile
- add the final App Store build number and version
- test on at least one physical iPhone
- archive the app for App Store Connect

## Supabase And OAuth

Keep the same Supabase project used by the web app and add this mobile redirect:

- `farmyard://auth/callback`

Google sign-in should be tested after the generated iPhone project is installed on a device.
