# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Primal** is a dating app for gay and bisexual men, deployed as a PWA and wrapped in Capacitor for iOS/Android.
- **Domain**: primalgay.com
- **Parent Company**: SLTR Digital LLC
- **App ID**: com.sltrdigital.primal

## Commands

```bash
npm run dev          # Start dev server (Next.js)
npm run build        # Production build — NOTE: typescript.ignoreBuildErrors is true in next.config.js, so builds do NOT catch type errors
npm run lint         # ESLint via next lint
npm test             # Jest (jsdom environment)
npm test -- --watch  # Watch mode
npm test -- path/to/file.test.ts   # Single test file
```

Node 20.x (see `.nvmrc`). Path alias `@/*` maps to `./src/*`.

## Architecture

**Next.js 15 App Router** with all source under `src/`. No Tailwind — styling is inline styles + CSS modules + design tokens (`src/tokens/`, `src/styles/design-tokens.ts`). Dark-mode only (black background, `#FF6B35` orange accent, `#CCFF00` electric lime). Fonts: DM Sans (body), Orbitron (display).

### Source Layout

- `src/app/` — Next.js App Router pages. Key routes: `/dashboard` (user grid), `/map`, `/messages`, `/pulse` (LiveKit video rooms), `/groups`, `/admin`
- `src/components/` — Atomic design: `atoms/` (Button, Avatar, Input, etc.), `molecules/` (Header, Modal, ProfileCard, Toast), `map/` (MapPage and related), `LiveKit/` (VideoConference, VoiceChannel), `landing/` (marketing page effects)
- `src/lib/` — Backend utilities and Supabase clients
- `src/hooks/` — Custom hooks (barrel-exported from `index.ts`)
- `src/matching/` — AI-powered match scoring pipeline: builds user features, sends to AI scorer, ranks candidates
- `src/map/` — Custom WebGL avatar renderer for Mapbox (GLSL shaders, instanced rendering)
- `src/tokens/` — Design token system (colors, typography, spacing, effects)
- `src/types/` — TypeScript definitions (`database.ts` for Supabase types)
- `src/emails/` — React Email templates (sent via Resend)
- `supabase/migrations/` — SQL migrations (push with `npx supabase db push`)

### Supabase Clients

Two Supabase clients — use the right one:
- **Browser**: `import { supabase } from '@/lib/supabase'` — uses `createBrowserClient` from `@supabase/ssr`
- **Server (RSC, API routes)**: `import { getSupabaseServerClient } from '@/lib/supabaseServer'` — uses `createServerClient` with cookie handling
- **Admin (bypasses RLS)**: `import { getSupabaseAdmin } from '@/lib/admin'` — uses service role key, server-only

### Auth & Middleware

`middleware.ts` (project root) protects routes by checking for Supabase auth cookies. It does NOT validate sessions server-side — just checks cookie presence. Protected routes are listed in `PROTECTED_ROUTES` array. Auth routes (`/login`, `/signup`) redirect authenticated users to `/dashboard`.

### Premium / Subscriptions

CCBill is the payment processor (not Apple IAP or Stripe):
- Webhook handler: `src/lib/ccbill-webhook.ts` — verifies MD5 digest (tries both `subscriptionId + "0" + salt` and `"1"` variants), maps events to premium status, updates `profiles.is_premium` and `profiles.premium_until`
- Webhook route: `src/app/api/webhooks/ccbill/route.ts`
- Client hook: `src/hooks/usePremium.ts` — caches premium status for 5 minutes client-side
- Gating component: `src/components/PremiumGate.tsx` — wraps premium-only UI
- Premium-only features defined in `canAccessFeature()` in `usePremium.ts`: video_call, viewed_me, incognito, travel_mode, pulse, map_posting, read_receipts, unlimited_messages, unlimited_filters

### Video / Voice (LiveKit)

Video calls use **LiveKit** (not raw WebRTC). Server config in `src/lib/livekit.ts` defines three room types:
- `pulse` — large community rooms (up to 400 participants, 5min empty timeout)
- `channel` — persistent voice channels (100 participants, never times out)
- `group` — event rooms (50 participants, 10min empty timeout)

API routes: `src/app/api/livekit/token/route.ts` (token generation), `src/app/api/livekit/rooms/route.ts` (room management).

### Admin System

Admin roles are environment-driven (`src/lib/admin.ts`):
- `FOUNDER_EMAIL` env var gets `founder` role (full access)
- `ADMIN_EMAILS` env var: comma-separated `email:role` pairs (roles: `admin`, `moderator`, `support`)
- Admin UI at `/admin` with sub-pages: users, photos, reports, user-reports, payments, errors

### Map System

Mapbox GL JS with a custom WebGL avatar renderer (`src/map/renderers/`) that uses GLSL shaders and instanced rendering for performance. The map has a vector tile API at `src/app/api/tiles/[type]/[z]/[x]/[y]/route.ts` that queries PostGIS directly via `pg`.

### Global Providers (Root Layout)

`src/app/layout.tsx` wraps the app in: `ThemeProvider` → `PhotoGate` (requires profile photo before accessing app) → `AuthListener` + `ServiceWorkerRegistration` + `LocationPermission` + `OneSignalProvider`. Analytics: Vercel Analytics + PostHog (reverse-proxied via `/ingest/*` rewrites) + Google Analytics.

### Native Apps (Capacitor)

The Capacitor shell (`capacitor.config.ts`) points at `https://primalgay.com` — the native apps are web wrappers around the production PWA, not standalone builds. iOS and Android directories exist at project root.

## Environment Variables

See `.env.local.example` for base config. Additional variables used in production:
- `SUPABASE_SERVICE_ROLE_KEY` — admin Supabase access (server-only)
- `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`, `NEXT_PUBLIC_LIVEKIT_URL` — video/voice
- `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` — distributed rate limiting
- `CCBILL_WEBHOOK_SALT` — webhook verification
- `FOUNDER_EMAIL`, `ADMIN_EMAILS` — admin role assignment
- `RESEND_API_KEY` — transactional email

## Key Gotchas

- **TypeScript errors are silent during build** — `next.config.js` sets `typescript.ignoreBuildErrors: true` and `webpack.cache: false`. Run the IDE type checker or `npx tsc --noEmit` to catch type issues.
- **Rate limiting**: Two implementations exist — in-memory (`src/lib/rate-limit.ts`, does NOT work across serverless instances) and Upstash Redis (`src/lib/upstash-rate-limit.ts`, distributed). Prefer the Upstash version.
- **NSFW detection**: Client-side TensorFlow.js model (`src/lib/nsfwDetection.ts`) scans photos before upload via `PhotoGate`.
- **CSP headers** are set in `next.config.js` `headers()` — update them when adding new external services.
- **Domain redirects**: `vercel.json` redirects `getsltr.com` → `primalgay.com`.
