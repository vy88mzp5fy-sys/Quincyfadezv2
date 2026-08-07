# QuincyFadez — Barber Marketing Site

## Original Problem Statement
Rebuild https://quincyfadez.barbr.site to be more enticing for clients and add personal story: 25 years old, self-taught, cutting since 2022, loves being a barber, loved the idea of cutting hair before ever picking up clippers.

## Type
Frontend-only single-page marketing site (React + Tailwind + framer-motion + lenis). No backend, no auth, no DB. All actions link out.

## User Choices
- Booking = "Book now" button linking out to https://www.barbr.me/quincyfadez (no on-site booking)
- Vibe = modern/premium, dark editorial like original
- Photos/videos = reuse original site media (Bunny CDN)
- Services/prices = keep same
- Contact = WhatsApp + Instagram; map kept
- Title Case for all copy; bold brand wordmark

## Key Data / Links
- Booking: https://www.barbr.me/quincyfadez
- Instagram: https://www.instagram.com/QuincyFadez
- WhatsApp: https://wa.me/447490194682 (07490 194682)
- Address: 8 Gillians Way, Oxford OX4 2YD
- Gallery: 6 Bunny CDN videos (vz-d1735d3f-314.b-cdn.net/<id>/play_720p.mp4 + thumbnail.jpg)
- Profile img: barbr-assets-prod.b-cdn.net/media/user/583640/barber_profile/2ae04014_profile-1785752577750.png

## Implemented (2026-06)
- Kinetic hero with masked line reveal + parallax; Lenis smooth scroll
- About manifesto (3 numbered chapters) with personal story + profile photo
- Work gallery: uniform 3-col square tiles, hover-play videos with play icons
- Services menu (Hair Cut £20, Haircut & Beard £25, Shape Up £10, Beard Trim £10)
- VIP x4 membership card (£64/mo)
- Hours table with live "Today" indicator + dark Mapbox map (directions link)
- Footer CTA with Book / Instagram / WhatsApp
- Title Case globally (CSS capitalize), bold serif QuincyFadez wordmark
- Verified via testing_agent iteration_1 & iteration_2 (100% frontend)

## Structure
- /app/frontend/src/App.js (Lenis + section composition)
- /app/frontend/src/data/site.js (all content/links)
- /app/frontend/src/components/site/*.jsx (sections + primitives)

## Backlog / Possible Next
- Additional gallery media behind original "View more (11)" — not accessible from static page (loaded via dynamic API)
- Testimonials/reviews section
- OG/social share image
