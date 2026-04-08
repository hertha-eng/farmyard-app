# FarmYard iPhone Launch Checklist

## Native Build

- Use a Mac with Node.js 20+ and Xcode installed
- Run `npm install`
- Run `npm run cap:add:ios`
- Run `npm run cap:sync`
- Run `npm run cap:assets`
- Open Xcode with `npm run cap:open:ios`

## Xcode

- Set bundle identifier to `com.farmyard.marketplace`
- Set the Apple team and signing certificate
- Set final version and build number
- Add microphone permission text to `Info.plist`
- Add photo library usage text if listing image upload remains enabled
- Confirm URL scheme `farmyard` exists for OAuth callback handling

## Device QA

- Email/password sign-in works
- Google sign-in works
- OAuth callback returns into the app
- Listing creation works with image upload
- Messaging works between two test accounts
- Audio calling works with microphone permission granted
- Layout respects iPhone safe areas and notch spacing

## App Store Connect Assets

- Privacy policy URL
- Support URL or support email
- Subtitle
- Promotional text
- Description
- Keywords
- iPhone screenshots
- App icon renders clearly
- Age rating completed
- App privacy questionnaire completed
