# Primal — App Store Connect Metadata

## App Name
Primal

## Subtitle (30 chars max)
Dating for Gay & Bi Men

## Promotional Text (170 chars — can update without review)
The dating app built for the way you actually connect. Live video rooms, real-time updates, and a community that gets it.

## Description
Primal is a dating and social app designed exclusively for gay and bisexual men. Built from the ground up for authentic connection — not just swiping.

EXPLORE YOUR WAY
Browse a location-based grid of nearby guys, or switch to the interactive Map View to see who's around you in real time. Filter by age, position, tribes, and more.

PULSE — LIVE VIDEO ROOMS
Join live video and audio rooms with up to 400 people. Hang out, meet new faces, and connect beyond a profile pic. Always-on community spaces with HD video and spatial audio.

DOWN TO HOST (DTH)
Broadcast that you're available right now with a 2-hour timed signal. It auto-expires, so you're only visible when you want to be.

REAL-TIME MESSAGING
Chat with guys nearby. Send photos, share profiles, and see typing indicators. Pin your favorite conversations for quick access.

VIDEO CALLS
Go face-to-face with 1-on-1 video calls. No third-party apps needed — it's all built in.

CRUISING UPDATES
Post and discover location-based status updates from guys nearby. Like, comment, and connect in the moment.

GROUPS & MEETUPS
Create or join real-world hangouts — parties, dinners, sports, gaming, and more. Set a time, location, and capacity.

YOUR PROFILE, YOUR WAY
Express yourself with 15 identity tribes (Bear, Twink, Jock, Otter, Daddy, and more), detailed stats, health transparency, and social links.

4 WAYS TO SAY HI
Send a Flame, Wave, Wink, or Looking tap to break the ice — each one says something different.

PREMIUM FEATURES
Upgrade for unlimited profiles, incognito mode, see who viewed you, read receipts, travel mode, priority support, and much more.

BUILT FOR SAFETY
Report users, block anyone, and manage your privacy. Content moderation keeps the community respectful. Your data is encrypted and your location is never shared without permission.

Primal. Rules Don't Apply.

Terms of Service: https://primalgay.com/terms
Privacy Policy: https://primalgay.com/privacy

## Keywords (100 chars max)
gay,dating,bisexual,men,lgbtq,chat,video,map,nearby,social,pulse,community,meetup,local

## Category
Primary: Social Networking
Secondary: Lifestyle

## Age Rating
17+

## Support URL
https://primalgay.com/settings/help

## Marketing URL
https://primalgay.com

## Privacy Policy URL
https://primalgay.com/privacy

---

## App Review Notes

WHAT MAKES PRIMAL UNIQUE

Primal is purpose-built for the gay and bisexual male community with features no other dating app offers:

1. PULSE — Live video rooms for up to 400 people simultaneously. Not 1-on-1 matching — real group social spaces with HD video, spatial audio, and live chat. Always-on community rooms.

2. DTH (DOWN TO HOST) — A timed 2-hour availability signal. Users activate DTH to broadcast they're available right now. It auto-expires, creating urgency and real-time connection.

3. CRUISING UPDATES — Location-based real-time status posts with comments, likes, and threading. A social feed tied to proximity, not a static grid.

4. GROUPS — Create and join real-world meetups (parties, sports, dinners, gaming) with event scheduling, capacity tracking, and location tagging.

5. MAP VIEW — Interactive Mapbox-powered map with live user clustering, toggling between Users/Groups/Venues. Real-time location presence.

6. COMPREHENSIVE HEALTH TRANSPARENCY — HIV status, last tested date, health practices, vaccinations, and safety preferences built into profiles. This level of health integration is unique to the LGBTQ+ dating space.

7. TRIBES — 15 identity-based community labels (Bear, Twink, Jock, Otter, Daddy, Leather, Pup, etc.) for authentic self-expression.

8. 4 TAP TYPES — Flame, Wave, Wink, and Looking — nuanced interest signals beyond a simple "like."

NATIVE CAPABILITIES:
- Push notifications (APNs)
- Camera & photo library access
- Haptic feedback
- Real-time geolocation with proximity matching
- In-app purchases via StoreKit/RevenueCat
- Offline state handling

DEMO ACCOUNT:
(Credentials provided separately — not stored in version control)

---

## Screenshots (saved in /app-store-screenshots/)

| # | Screen | File | What it shows |
|---|--------|------|---------------|
| 1 | Grid/Explore | 01-grid.png | Main dashboard with profile grid, filters, bottom nav |
| 2 | Messages | 02-messages.png | Message inbox with conversations and unread badges |
| 3 | Chat | 03-chat.png | 1-on-1 conversation with video call button |
| 4 | Taps | 04-taps.png | Received taps with tap-back and message options |
| 5 | Views | 05-views.png | Who viewed your profile |
| 6 | Map | 06-map.png | Interactive map with user markers and venue pins |
| 7 | Profile | 07-profile.png | User profile with stats, health, tribes, groups |
| 8 | Premium | 08-premium.png | Subscription page with 24 premium features |

**Note**: These are 430x932 web captures. For App Store Connect:
- 6.7" display: Need 1290x2796px — take from Xcode simulator or device
- 6.1" display: Need 1179x2556px — take from Xcode simulator or device
- Recommended: Take final screenshots from Kevin's iPhone using Xcode (Cmd+S in simulator or device screenshot)

---

## Privacy Nutrition Labels (App Store Connect > App Privacy)

Fill out each section below in App Store Connect under "App Privacy."

### Data Linked to You (associated with user identity)

#### 1. Contact Info
| Data Type | Collection Purpose | Linked to Identity |
|-----------|-------------------|-------------------|
| Email Address | App Functionality, Account Registration | Yes |
| Phone Number | App Functionality (optional, verification) | Yes |

#### 2. Location
| Data Type | Collection Purpose | Linked to Identity |
|-----------|-------------------|-------------------|
| Precise Location | App Functionality (nearby profiles, map) | Yes |

#### 3. User Content
| Data Type | Collection Purpose | Linked to Identity |
|-----------|-------------------|-------------------|
| Photos or Videos | App Functionality (profile photos, messages) | Yes |
| Other User Content | App Functionality (messages, bio, posts) | Yes |

#### 4. Identifiers
| Data Type | Collection Purpose | Linked to Identity |
|-----------|-------------------|-------------------|
| User ID | App Functionality | Yes |

#### 5. Health & Fitness
| Data Type | Collection Purpose | Linked to Identity |
|-----------|-------------------|-------------------|
| Health | App Functionality (HIV status, vaccinations — user-provided, optional) | Yes |

#### 6. Usage Data
| Data Type | Collection Purpose | Linked to Identity |
|-----------|-------------------|-------------------|
| Product Interaction | Analytics (PostHog — taps sent, messages, page views) | Yes |

#### 7. Purchases
| Data Type | Collection Purpose | Linked to Identity |
|-----------|-------------------|-------------------|
| Purchase History | App Functionality (subscription status via RevenueCat) | Yes |

### Data NOT Collected
- Financial Info (payments handled by Apple/StoreKit)
- Sensitive Info (beyond health fields above)
- Browsing History
- Search History (searches are local, not stored)
- Contacts
- Diagnostics (only Sentry error reports — optional)

### Tracking Declaration
**Does your app track users?** → **No**
- PostHog is used for product analytics only, not cross-app tracking
- No IDFA/AdSupport framework used
- No advertising SDKs
- No data shared with data brokers

If Apple asks: PostHog analytics are first-party product analytics used to improve the app experience, not for advertising or cross-app tracking.

---

## Age Rating Questionnaire Answers

When filling out the age rating in App Store Connect:

| Question | Answer |
|----------|--------|
| Cartoon or Fantasy Violence | None |
| Realistic Violence | None |
| Prolonged Graphic or Sadistic Realistic Violence | None |
| Profanity or Crude Humor | Infrequent/Mild |
| Mature/Suggestive Themes | Frequent/Intense |
| Horror/Fear Themes | None |
| Medical/Treatment Information | Infrequent/Mild (health fields) |
| Alcohol, Tobacco, or Drug Use or References | None |
| Simulated Gambling | None |
| Sexual Content and Nudity | Frequent/Intense |
| Unrestricted Web Access | No |
| Gambling with Real Currency | No |

**This will result in a 17+ rating, which is correct for a dating app.**

### Additional Age Rating Notes
- Select "Yes" for "Is this app designed for or marketed to children?" → **No**
- Apple's updated age rating system (effective Jan 2026) requires answering updated questions — make sure to complete them all to avoid submission blocks
