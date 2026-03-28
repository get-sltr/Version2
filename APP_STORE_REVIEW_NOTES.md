# Primal Men - App Store Review Notes

## Demo Accounts for Testing

### Active Subscription Account
**Email:** reviewer@primalgay.com
**Password:** PrimalReview2026!

This account has been pre-configured with:
- Profile photo uploaded
- Location set to Los Angeles, CA
- Sample messages from test users
- Active subscription (sandbox)

### Expired Subscription Account
**Email:** reviewer-expired@primalgay.com
**Password:** PrimalExpired2026!

This account has been pre-configured with:
- Profile photo uploaded
- Location set to Los Angeles, CA
- Expired subscription (premium features are gated)
- Use this account to test the full subscription purchase flow

---

## App Overview

Primal Men is a dating app exclusively for gay and bisexual men aged 18+. The app helps users connect with others nearby through a location-based grid, map view, and messaging.

**Unique Feature:** Mission Control - A split-screen dashboard showing Grid, Map, Messages, and Cruising updates simultaneously. No other dating app offers this feature.

---

## Key Features to Test

### 1. Authentication
- **Email/Password:** Create account or use demo account above
- **Sign in with Apple:** Available on login and signup screens
- **Sign in with Google:** Available on login and signup screens

### 2. Profile & Photos
- Photos are scanned on-device for explicit content before upload
- Shirtless/swimwear photos are allowed
- Only explicit nudity is blocked from public profiles
- Private albums can contain adult content (shared between consenting users)

### 3. Subscription (Primal Pro)
- **Price:** $12.99/month
- **Restore Purchases:** Available in Settings and on subscription screens
- **Manage Subscription:** Links to iOS Settings for cancellation

### 4. Account Management
- **Delete Account:** Settings → Account → Delete Account
- Requires confirmation (type "DELETE" or re-enter password)
- 24-hour grace period before permanent deletion
- All user data is removed from our servers

### 5. Safety Features
- **Block & Report:** Available on every user profile
- **Report Reasons:** Harassment, fake profile, inappropriate content, spam, underage, other
- All reports reviewed by safety team within 24 hours

### 6. Age Verification
- 18+ required at signup (date of birth verification)
- Users must be 18 on the day of signup
- Underage accounts are immediately terminated

---

## Content Rating

**Rating:** 17+ (Mature)

**Reasons:**
- Dating app for adults
- Infrequent/Mild Sexual Content and Nudity (in private albums between consenting adults)
- Location-based features

---

## In-App Purchases

| Product | Price | Product ID |
|---------|-------|------------|
| Primal Pro Monthly | $12.99 | com.sltrdigital.primal.monthly |

*Additional subscription tiers will be added post-approval.*

---

## Privacy & Legal

- **Privacy Policy:** https://primalgay.com/privacy (also accessible in-app)
- **Terms of Service:** https://primalgay.com/terms (also accessible in-app)
- **Support Email:** support@primalgay.com
- **Data Requests:** privacy@primalgay.com

---

## Technical Notes

- Location permission required for core functionality (showing nearby users on the grid)
- **Map visibility is opt-in:** Users must manually tap "Go Live" on the map to appear as a marker to other users. Check-in expires after 1 hour and there is no automatic check-in option.
- Camera permission required for profile photos
- Push notifications optional (for messages and matches)
- All photos processed on-device using AI - no photos sent to external servers for scanning
- Sign in with Apple and Google Sign-In use native SDKs (no external browser)

---

## Testing Specific Features

### To Test Messaging:
1. Login with demo account
2. Tap any profile in the grid
3. Tap the message icon
4. Send a message

### To Test Subscription (In-App Purchases):
1. Log in with the **Expired Subscription Account** above
2. Tap the **"PRO"** button — this is the leftmost icon in the bottom navigation bar
3. The Premium page will load showing subscription options
4. Tap **"SUBSCRIBE"** to initiate the in-app purchase
5. Complete the purchase using the sandbox test account
6. **"Restore Purchases"** button is available at the bottom of the Premium page
7. Note: In-app purchases are only available on native iOS (not web)

### To Test Account Deletion:
1. Go to Settings (gear icon in menu)
2. Tap "Account"
3. Tap "Delete Account"
4. Follow confirmation steps
5. Note: Use a test account, not the demo account

### To Test Block/Report:
1. Tap any user profile
2. Tap the "..." menu (top right)
3. Select "Block" or "Report"
4. Follow prompts

---

## Contact

**Developer:** SLTR Digital LLC
**Support:** support@primalgay.com
**Website:** https://primalgay.com

---

*Last updated: February 2026*
