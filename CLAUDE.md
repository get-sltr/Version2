# Primal — Project Instructions

## Overview
**Primal** is a dating PWA for gay and bisexual men.
- **Domain**: primalgay.com
- **Tagline**: "Rules Don't Apply"
- **Parent Company**: SLTR Digital LLC

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **UI**: Liquid glass effects, glossy buttons, dark navy theme
- **Backend**: Supabase (Postgres, Auth, Realtime, Storage, Edge Functions)
- **Hosting**: Vercel
- **Payments**: CCBill (subscriptions via FlexForms + webhooks)
- **Maps**: Mapbox GL JS
- **Video**: WebRTC for video calls
- **PWA**: Service worker, manifest, installable

## Color Palette
```css
--navy: #0A1628;
--navy-light: #132038;
--orange: #FF6B35;
--orange-dark: #E55A2B;
--lavender: #B8A9C9;
--lavender-glow: #9D8AB8;
--white: #FFFFFF;
```

## Typography
- **Logo/Headers**: Russo One (or Orbitron/Audiowide)
- **Body**: Inter

## Core Features
1. **Auth** — Email/password, OAuth (Google, Apple)
2. **Profiles** — Photos, bio, stats, preferences, verification
3. **Grid View** — Location-based user grid (like Grindr)
4. **Messaging** — Real-time chat with Supabase Realtime
5. **Video Calls** — WebRTC peer-to-peer
6. **Map View** — Mapbox showing nearby users
7. **Filters** — Age, distance, preferences, online status
8. **Subscriptions** — Free tier + Premium via CCBill
9. **Push Notifications** — Web push for messages
10. **Discreet Mode** — Hide from grid, incognito browsing

## Database Schema (Supabase)

### Key Tables
- `profiles` — User profiles (linked to auth.users)
- `photos` — User photos with moderation status
- `conversations` — Chat threads between users
- `messages` — Individual messages
- `blocks` — Blocked users
- `reports` — User reports for moderation
- `apple_subscriptions` — Subscription status (synced by CCBill webhooks)
- `locations` — User location data (encrypted)

### RLS Rules
- Users can only read/write their own data
- Blocked users cannot see each other
- Location data restricted to proximity queries
- Photos require moderation approval

## File Structure
```
/app
  /(auth)         → Login, signup, forgot password
  /(main)         → Grid, messages, profile, settings
  /api            → API routes
/components
  /ui             → Buttons, inputs, cards, modals
  /features       → Grid, chat, profile components
/lib
  /supabase       → Client, server, types
  /ccbill-webhook → CCBill webhook helpers
  /mapbox         → Map utilities
/hooks            → Custom React hooks
/types            → TypeScript definitions
/public           → Icons, manifest, service worker
/supabase
  /migrations     → SQL migrations
  /seed           → Test data
```

## API Routes
- `/api/auth/*` — Auth callbacks
- `/api/webhooks/ccbill` — CCBill subscription webhooks
- `/api/moderation/*` — Photo/report review

## Environment Variables Required
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_MAPBOX_TOKEN=
CCBILL_WEBHOOK_SALT=
NEXT_PUBLIC_CCBILL_FLEX_FORM_ID=
CCBILL_CLIENT_ACCNUM=
CCBILL_CLIENT_SUBACC=
```

## Commands
```bash
# Dev
npm run dev

# Build
npm run build

# Supabase
npx supabase start          # Local dev
npx supabase db push        # Push migrations
npx supabase gen types      # Generate TS types

# Deploy
vercel --prod
```

## Git Branches
- `main` — Production (auto-deploys to Vercel)
- `develop` — Staging
- `feature/*` — New features
- `fix/*` — Bug fixes

## Performance Targets
- Lighthouse: 90+ all categories
- First Contentful Paint: <1.5s
- Time to Interactive: <3s
- Core Web Vitals: All green

## Security Checklist
- [ ] RLS enabled on all tables
- [ ] API routes validate auth
- [ ] Rate limiting on sensitive endpoints
- [ ] Input sanitization
- [ ] CSRF protection
- [ ] Content Security Policy headers

## Launch Checklist
- [ ] Domain connected (primalgay.com)
- [ ] SSL active
- [ ] Email routing configured
- [ ] CCBill webhooks verified
- [ ] PWA manifest complete
- [ ] App icons all sizes
- [ ] Privacy policy page
- [ ] Terms of service page
- [ ] Age verification gate (18+)
