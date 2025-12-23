# PostHog post-wizard report

The wizard has completed a deep integration of your Next.js project with PostHog analytics. The integration includes:

- **Client-side initialization** via `instrumentation-client.ts` (Next.js 15.3+ recommended approach)
- **Server-side PostHog client** in `src/lib/posthog-server.ts` for backend event tracking
- **Reverse proxy configuration** in `next.config.js` to route analytics through `/ingest` for improved reliability
- **User identification** on signup and login to link anonymous sessions with authenticated users
- **13 custom events** tracking key user actions across the conversion funnel and engagement lifecycle
- **Error tracking** enabled via `capture_exceptions: true` for automatic exception capture

## Events Added

| Event Name | Description | File |
|------------|-------------|------|
| `user_signed_up` | User successfully completed the signup process and was redirected to verification | `src/app/signup/page.tsx` |
| `user_logged_in` | User successfully logged in and was redirected to dashboard | `src/app/login/page.tsx` |
| `onboarding_completed` | User completed the onboarding flow and saved their profile information | `src/app/onboarding/page.tsx` |
| `premium_plan_selected` | User selected a premium plan and initiated checkout | `src/app/premium/page.tsx` |
| `checkout_completed` | User successfully completed payment checkout | `src/app/checkout/success/page.tsx` |
| `tap_sent` | User sent a tap (flame, wave, wink, looking) to another user | `src/app/profile/[id]/page.tsx` |
| `favorite_added` | User added another user to their favorites | `src/app/profile/[id]/page.tsx` |
| `message_sent` | User sent a message (text, image, profile share) to another user | `src/app/messages/[id]/page.tsx` |
| `video_call_started` | User initiated a video call with another user | `src/app/messages/[id]/page.tsx` |
| `user_reported` | User submitted a report about another user | `src/app/report/page.tsx` |
| `user_blocked` | User blocked another user from messaging them | `src/app/messages/[id]/page.tsx` |
| `tap_back_sent` | User tapped back to a received tap from another user | `src/app/taps/page.tsx` |
| `favorite_removed` | User removed another user from their favorites | `src/app/favorites/page.tsx` |

## Files Created/Modified

| File | Change Type | Description |
|------|-------------|-------------|
| `instrumentation-client.ts` | Created | PostHog client-side initialization with error tracking |
| `src/lib/posthog-server.ts` | Created | Server-side PostHog client singleton |
| `next.config.js` | Modified | Added reverse proxy rewrites for `/ingest` |
| `.env` | Created | Environment variables for PostHog API key and host |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

### Dashboard
- [Analytics basics](https://us.posthog.com/project/271596/dashboard/938347) - Core business metrics dashboard

### Insights
- [User Signups](https://us.posthog.com/project/271596/insights/A4KxhQfs) - Track new user signups over time
- [Signup to Premium Conversion Funnel](https://us.posthog.com/project/271596/insights/5dmvwkqU) - Track conversion from signup through to premium subscription
- [User Engagement - Taps & Messages](https://us.posthog.com/project/271596/insights/Hzmotew0) - Track key user engagement actions
- [Favorites Activity](https://us.posthog.com/project/271596/insights/zxUpbWRC) - Track users adding and removing favorites
- [User Reports & Blocks (Churn Signals)](https://us.posthog.com/project/271596/insights/2xAyO7xG) - Track negative user interactions that may indicate churn risk

## Configuration

Environment variables are stored in `.env`:
```
NEXT_PUBLIC_POSTHOG_KEY=phc_UBPeQXeLJAABkWzcf81SUQp3zSedmbjvBWJk0tcsVro
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

Make sure to add these to your deployment environment (Vercel, Netlify, etc.) as well.
