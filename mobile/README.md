# QuincyFadez Mobile App

Official QuincyFadez iOS and Android app, built with Expo and React Native.

## Current build

- Premium black, gold and white QuincyFadez visual system
- Native Home, Services, Booking, Gallery, Reviews and Account screens
- Five-item mobile navigation: Home, Book, Gallery, Reviews and Account
- Service pricing and booking summary
- Secure Stripe payment-method verification before live booking
- Stripe Payment Method Settings Sheet in Account
- Barbr live availability handoff after verification
- Google reviews, WhatsApp, directions and website shortcuts
- Branded app icon and splash screen
- Expo/EAS preview and production build profiles
- iOS and Android identifiers reserved as `com.quincyfadez.app`

## Payment architecture

The mobile app never receives or stores a customer's full card number or CVC. Stripe's native SDK collects payment details. The QuincyFadez backend stores only Stripe references and safe display metadata such as card brand and last four digits.

Booking flow:

1. Choose a QuincyFadez service.
2. Verify a payment method securely with Stripe.
3. Open Barbr for live date and time availability.

Account flow:

1. Open Account from the bottom navigation or home screen.
2. View saved-card status.
3. Open Stripe's Payment Method Settings Sheet to add or remove cards.
4. Removing the final attached card automatically locks the protected booking step again.

## Environment configuration

Mobile environment values:

- `EXPO_PUBLIC_API_URL` — deployed QuincyFadez backend URL
- `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` — optional client-side fallback; the app can also fetch the publishable key from the backend

Backend environment values:

- `STRIPE_SECRET_KEY` — Stripe server secret key only
- `STRIPE_PUBLISHABLE_KEY` — key returned to the mobile app through `/api/payments/config`
- Existing MongoDB environment values used by the backend

Never place a Stripe secret key in the mobile app or commit it to the repository.

## Development

This project targets Expo SDK 57 and lives separately from the production website in `/mobile`.

```bash
cd mobile
npm install
npx expo start
```

## Build commands

```bash
npm run build:ios
npm run build:android
npm run build:preview
```

## Remaining release checks

- Configure the deployed backend URL for the preview build
- Add Stripe test credentials to the backend environment
- Complete an end-to-end Stripe test-card booking on a physical iPhone
- Test card removal and re-verification from Account
- Test Barbr, WhatsApp, review, website and Maps handoffs
- Check layout on small and large iPhones
- Create the final EAS production build after preview sign-off
- Complete App Store / Play Store listing metadata and screenshots
