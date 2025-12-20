# SLTR Database Security Review

## Overview

This document provides a comprehensive security review of the SLTR database implementation, including Row Level Security (RLS) policies, data access patterns, and security recommendations.

## Security Architecture

### Row Level Security (RLS)

All tables have RLS enabled with policies that enforce:

1. **Authentication Required**: All data access requires a valid Supabase auth session
2. **Ownership-Based Access**: Users can only modify their own data
3. **Block Enforcement**: Blocked users cannot interact with each other
4. **Privacy Filters**: Incognito users are hidden from general queries

### Table-by-Table Security Analysis

#### 1. profiles

| Policy | Action | Rule |
|--------|--------|------|
| `profiles_select` | SELECT | Can view all non-incognito profiles, OR own profile, OR non-blocked users |
| `profiles_update` | UPDATE | Only own profile (`id = auth.uid()`) |
| `profiles_insert` | INSERT | Only own profile |

**Risk Assessment**: LOW
- Users cannot view or modify other users' profiles
- Incognito mode properly hides users from discovery
- Blocked users are filtered out

#### 2. messages

| Policy | Action | Rule |
|--------|--------|------|
| `messages_select` | SELECT | Own sent messages (not deleted) OR own received messages (not deleted) |
| `messages_insert` | INSERT | Must be sender AND recipient not blocked |
| `messages_update` | UPDATE | Sender OR recipient (for read receipts) |

**Risk Assessment**: LOW
- Soft delete supported (`deleted_by_sender`, `deleted_by_recipient`)
- Block enforcement prevents messaging blocked users
- Users can only read their own conversations

#### 3. taps

| Policy | Action | Rule |
|--------|--------|------|
| `taps_select` | SELECT | Sender OR recipient |
| `taps_insert` | INSERT | Must be sender AND recipient not blocked |
| `taps_update` | UPDATE | Only recipient (to mark viewed) |
| `taps_delete` | DELETE | Only sender |

**Risk Assessment**: LOW
- Users can only delete their own sent taps
- Block enforcement prevents tapping blocked users

#### 4. favorites

| Policy | Action | Rule |
|--------|--------|------|
| `favorites_select` | SELECT | Own favorites only |
| `favorites_insert` | INSERT | Must be own user_id |
| `favorites_delete` | DELETE | Own favorites only |

**Risk Assessment**: LOW
- Favorites are private; users cannot see who favorited them (unless notifications enabled)

#### 5. blocked_users

| Policy | Action | Rule |
|--------|--------|------|
| `blocked_users_select` | SELECT | Own blocks only |
| `blocked_users_insert` | INSERT | Must be blocker |
| `blocked_users_delete` | DELETE | Own blocks only |

**Risk Assessment**: LOW
- Block list is private to the blocking user

#### 6. notifications

| Policy | Action | Rule |
|--------|--------|------|
| `notifications_select` | SELECT | Own notifications only |
| `notifications_update` | UPDATE | Own notifications only |
| `notifications_delete` | DELETE | Own notifications only |

**Risk Assessment**: LOW
- Users can only access their own notifications

#### 7. groups

| Policy | Action | Rule |
|--------|--------|------|
| `groups_select` | SELECT | Active groups OR own hosted groups |
| `groups_insert` | INSERT | Must be host |
| `groups_update` | UPDATE | Only host |

**Risk Assessment**: MEDIUM
- Group address visible to all members (consider encrypting)
- Consider adding approval workflow for sensitive group types

#### 8. profile_albums & profile_photos

| Policy | Action | Rule |
|--------|--------|------|
| `profile_albums_select` | SELECT | Own albums OR public albums OR shared albums |
| `profile_photos_select` | SELECT | Own photos OR public OR in accessible album |
| `*_insert` | INSERT | Own user_id |
| `*_delete` | DELETE | Own user_id |

**Risk Assessment**: MEDIUM
- Private album sharing requires explicit share record
- Expiring shares add temporal access control

#### 9. reports

| Policy | Action | Rule |
|--------|--------|------|
| `reports_select` | SELECT | Own reports only |
| `reports_insert` | INSERT | Must be reporter |

**Risk Assessment**: LOW
- Users cannot see others' reports
- Admin access managed separately (service role)

---

## Security Functions

### `is_blocked(user_a, user_b)`

Returns `TRUE` if either user has blocked the other. Used in RLS policies to prevent:
- Messaging blocked users
- Tapping blocked users
- Viewing blocked users' profiles

### Automatic Notifications (SECURITY DEFINER)

Triggers run with elevated privileges to:
- Create notifications for taps
- Create notifications for messages
- Create notifications for favorites
- Create notifications for profile views

**Mitigation**: Triggers have limited scope and only insert into notifications table.

---

## Data Protection

### Sensitive Data Fields

| Field | Table | Protection |
|-------|-------|------------|
| `email` | profiles | Only visible to owner |
| `phone` | profiles | Only visible to owner |
| `hiv_status` | profiles | Optional, controlled visibility |
| `last_tested` | profiles | Optional, controlled visibility |
| `address` | groups | Only visible to approved members |
| `location_point` | profiles | PostGIS geography type |

### Encryption Recommendations

1. **At Rest**: Supabase encrypts all data at rest using AES-256
2. **In Transit**: All connections use TLS 1.2+
3. **Application Level**: Consider encrypting:
   - Group addresses before storage
   - Private message content (end-to-end encryption)
   - HIV status and health information

---

## Rate Limiting

The application uses Upstash Redis for rate limiting on:
- API endpoints
- Authentication attempts
- Message sending
- Tap sending

### Recommended Limits

| Action | Limit |
|--------|-------|
| Login attempts | 5/minute |
| Message sends | 60/minute |
| Tap sends | 30/minute |
| Profile views | 100/minute |
| Search queries | 30/minute |

---

## Audit Trail

### Logged Events

1. **Profile Views**: Stored in `profile_views` table with timestamp
2. **Message Read Receipts**: `read_at` timestamp on messages
3. **Notification Clicks**: `clicked_at` timestamp on notifications
4. **Group Membership Changes**: `joined_at`, `left_at` timestamps

### Missing Audit Trails (Recommendations)

1. Add `audit_log` table for admin actions
2. Log profile changes (before/after)
3. Log report status changes
4. Log account deletion requests

---

## Compliance Considerations

### GDPR

1. **Right to Access**: Users can export their data via API
2. **Right to Erasure**: Cascade delete on user deletion
3. **Data Portability**: Implement data export endpoint
4. **Consent**: Profile fields require explicit consent

### CCPA

1. **Do Not Sell**: No data selling; implement opt-out mechanism
2. **Disclosure**: Privacy policy must list all data collected

### LGBTQ+ Specific Concerns

1. **Outing Risk**: Ensure profile data cannot be scraped
2. **Location Safety**: Fuzzy location option in incognito mode
3. **Screenshot Prevention**: Block screenshots on iOS/Android (native only)

---

## Security Recommendations

### High Priority

1. **Implement end-to-end encryption for messages**
   - Use libsodium or similar
   - Store encryption keys on client device only

2. **Add CAPTCHA to authentication flows**
   - Prevent automated account creation
   - Rate limit after failed attempts

3. **Implement IP-based blocking**
   - Track suspicious IPs
   - Block known VPN/proxy ranges for registration

### Medium Priority

4. **Add two-factor authentication**
   - TOTP or SMS verification
   - Required for sensitive actions

5. **Implement session management**
   - Allow users to view active sessions
   - Remote session termination

6. **Add photo moderation**
   - AI-based NSFW detection
   - Manual review queue for flagged content

### Low Priority

7. **Add account recovery options**
   - Trusted contacts
   - Recovery codes

8. **Implement progressive disclosure**
   - Full profile visible only after message exchange
   - Location precision increases with trust level

---

## Database Backup & Recovery

### Current Implementation

- Supabase automatic daily backups
- Point-in-time recovery available
- Geographic replication (if enabled)

### Recommendations

1. **Test recovery procedures quarterly**
2. **Document RTO/RPO requirements**
3. **Implement backup verification**
4. **Store backup encryption keys separately**

---

## Monitoring & Alerting

### Metrics to Track

1. Failed authentication attempts
2. Unusual data access patterns
3. Report volume spikes
4. API error rates
5. Database connection pool usage

### Alert Thresholds

| Metric | Warning | Critical |
|--------|---------|----------|
| Failed logins/minute | 10 | 50 |
| Reports/hour | 10 | 50 |
| Error rate | 1% | 5% |
| DB connections | 80% | 95% |

---

## Incident Response

### Severity Levels

1. **Critical**: Data breach, service outage
2. **High**: Security vulnerability discovered
3. **Medium**: Spam/abuse wave
4. **Low**: Single user report

### Response Procedures

1. **Identify**: Detect and classify incident
2. **Contain**: Limit damage spread
3. **Eradicate**: Remove threat
4. **Recover**: Restore normal operation
5. **Review**: Post-incident analysis

---

## Security Checklist

- [x] RLS enabled on all tables
- [x] Block enforcement in policies
- [x] Soft delete for messages
- [x] Password hashing (Supabase Auth)
- [x] Session management (Supabase Auth)
- [x] Rate limiting configured
- [x] Input validation in API layer
- [ ] End-to-end message encryption
- [ ] Two-factor authentication
- [ ] Admin audit logging
- [ ] Automated vulnerability scanning
- [ ] Penetration testing

---

## Contact

For security concerns, contact: security@sltrapp.com

Last Updated: 2025-12-15
