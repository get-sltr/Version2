# Primal Men - App Store Submission Checklist

## Pre-Submission Checklist

### Code Quality
- [x] TypeScript compiles with zero errors
- [x] No "SLTR" text visible anywhere in UI
- [x] No explicit terminology in public-facing UI
- [x] No console.log with sensitive data
- [x] No hardcoded API keys in source code

### Apple Guidelines Compliance
- [x] Sign in with Apple implemented (required with Google OAuth)
- [x] Restore Purchases button visible (Settings + Paywall)
- [x] Account deletion works end-to-end (Settings → Account → Delete)
- [x] Privacy Policy accessible in-app
- [x] Terms of Service accessible in-app
- [x] 18+ age gate at signup with date verification

### Accessibility (HIG Compliance)
- [x] All touch targets 44x44pt minimum
- [x] VoiceOver labels on interactive elements
- [x] Safe area insets respected (notch, Dynamic Island, home indicator)
- [x] Reduce Motion preference respected
- [x] Skeleton loaders for async content

### Content Moderation
- [x] NSFW scanner blocks explicit public photos
- [x] NSFW scanner allows shirtless/swimwear photos
- [x] Private album photos NOT scanned (consenting adults)
- [x] Block & Report accessible on every profile
- [x] Photo moderation logging enabled

### Legal Documents Updated
- [x] Privacy Policy includes NSFW scanning disclosure
- [x] Terms of Service includes content moderation clause
- [x] Community Guidelines updated

---

## App Store Connect Setup

### App Information
- **App Name:** Primal Men
- **Subtitle:** Mission Control
- **Bundle ID:** com.sltrdigital.primal
- **SKU:** primal-men-ios
- **Primary Language:** English (US)
- **Category:** Social Networking
- **Secondary Category:** Lifestyle

### Age Rating Questionnaire (17+)
- Infrequent/Mild: Sexual Content and Nudity
- Infrequent/Mild: Mature/Suggestive Themes
- Unrestricted Web Access: No
- Gambling: No
- Contests: No

### Pricing
- **Price:** Free (with In-App Purchases)

### In-App Purchases (Initial Submission)
| Product | Type | Price | Product ID |
|---------|------|-------|------------|
| Primal Pro Monthly | Auto-Renewable | $12.99 | com.sltrdigital.primal.monthly |

*Add additional tiers after initial approval.*

---

## Review Information

### Demo Account
- **Email:** reviewer@primalgay.com
- **Password:** PrimalReview2026!

### Review Notes
Copy from: `APP_STORE_REVIEW_NOTES.md`

### Contact Information
- **First Name:** [Your Name]
- **Last Name:** [Your Last Name]
- **Phone:** [Your Phone]
- **Email:** support@primalgay.com

---

## Build & Submit Commands

```bash
# 1. Clean install
rm -rf node_modules
npm install

# 2. Build for production
npm run build

# 3. Sync to iOS
npx cap sync ios

# 4. Open in Xcode
npx cap open ios

# 5. In Xcode:
#    - Select "Any iOS Device (arm64)" as target
#    - Product → Archive
#    - Distribute App → App Store Connect → Upload
```

---

## Post-Submission

### If Rejected
1. Read rejection reason carefully
2. Check App Store Review Guidelines for the cited section
3. Fix the issue
4. Resubmit with explanation in Resolution Center

### After Approval
1. Add additional subscription tiers:
   - Weekly: $7.99
   - 3 Months: $24.99
   - 6 Months: $39.99
2. Monitor crash reports in App Store Connect
3. Respond to user reviews
4. Plan first update with bug fixes

---

## Common Rejection Reasons to Avoid

| Guideline | Issue | Our Status |
|-----------|-------|------------|
| 4.3 Design Spam | Not unique enough | ✅ Mission Control is unique |
| 5.1.1 Data Collection | No account deletion | ✅ Full deletion implemented |
| 5.1.1 Data Collection | No privacy policy | ✅ Accessible in Settings |
| 4.0 Design | Missing Sign in with Apple | ✅ Implemented |
| 3.1.1 In-App Purchase | No restore purchases | ✅ Implemented |
| 1.2 User Generated Content | No report/block | ✅ Implemented |
| 2.1 App Completeness | Crashes/bugs | Test thoroughly |

---

## Final Verification

Before clicking "Submit for Review":

1. [ ] Demo account works and has profile photo
2. [ ] App doesn't crash on launch
3. [ ] All IAP products are "Ready to Submit"
4. [ ] Screenshots uploaded for all required sizes
5. [ ] App Preview video (optional but recommended)
6. [ ] Privacy Policy URL is live and accessible
7. [ ] Support URL is live and accessible
8. [ ] All metadata fields completed
9. [ ] Age rating questionnaire completed
10. [ ] Review notes include demo account

---

*Last updated: February 2026*
