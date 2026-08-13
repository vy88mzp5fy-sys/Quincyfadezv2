# QuincyFadez Backend Deployment

## Canonical application

Deploy the backend with the working directory set to `backend` and the ASGI application set to:

```text
app:app
```

`app.py` mounts the existing booking/admin API from `server.py` and adds the client account routes under `/api/client`.

## Required environment

```text
MONGO_URL=<production MongoDB connection string>
DB_NAME=quincyfadez
CORS_ORIGINS=*
ADMIN_PIN_SHA256=<sha256 owner PIN hash>
STRIPE_SECRET_KEY=<Stripe secret key>
STRIPE_PUBLISHABLE_KEY=<Stripe publishable key>
```

Optional settings include `ADMIN_SESSION_HOURS`, `CLIENT_SESSION_HOURS`, and the guarded payment capability flags already read by the API.

## Required public checks

After deployment, confirm these endpoints before using the host in an iOS or Android build:

```text
GET /health
GET /api/booking/services
POST /api/client/signup
POST /api/client/login
GET /api/client/me
```

Do not point `EXPO_PUBLIC_API_URL` at the host until `/health` and `/api/booking/services` both return successful responses.

## Booking availability

A healthy API does not invent opening hours. The booking API intentionally returns setup-required/no real slots until `weekly_hours` is configured through the owner admin settings. Once working hours exist, the mobile app can request the real 21-day availability window from `/api/booking/availability`.

## Mobile builds

Use the same HTTPS API base URL for both platforms:

```text
EXPO_PUBLIC_API_URL=https://<backend-host>
```

The iOS and Android clients share the same booking, client-account, admin, and Stripe backend.
