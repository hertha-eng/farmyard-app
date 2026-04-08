# FarmYard Android Launch Checklist

## Native Build

- Install Node.js 20+ and Android Studio
- Run `npm install`
- Run `npm run cap:add:android`
- Run `npm run cap:sync`
- Run `npm run cap:assets`
- Open Android Studio with `npm run cap:open:android`

## Android Studio

- Set application id to `com.farmyard.marketplace`
- Set final `versionCode` and `versionName`
- Confirm min and target SDK values are current
- Confirm app label is `FarmYard`
- Confirm `RECORD_AUDIO` is present for in-app calling if the call flow remains enabled

## Device QA

- Email/password sign-in works
- Google sign-in works
- Deep link callback returns to the app after auth
- Listing creation works with image upload
- Messaging works between two test accounts
- Audio calling works with microphone permission granted
- App survives offline relaunch for the cached shell

## Play Console Assets

- Privacy policy URL
- Support email
- Short description
- Full description
- Feature graphic
- Phone screenshots
- App icon and adaptive icon look correct
- Data safety answers completed
- Content rating completed
