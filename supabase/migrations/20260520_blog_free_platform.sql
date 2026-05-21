-- Blog post: Why Primal is free — dating app pricing analysis + security commitment
INSERT INTO blog_posts (
  title,
  slug,
  content,
  excerpt,
  meta_description,
  tags,
  categories,
  author,
  status,
  og_title,
  og_description,
  published_at
) VALUES (
  'Dating Apps Are Charging an Arm and a Leg. Primal Is Free.',
  'dating-apps-charging-arm-and-leg-primal-is-free',
  '<p>Let''s talk about the elephant in the room: dating apps have become absurdly expensive. What started as platforms to connect people has turned into subscription machines designed to extract as much money as possible from people who just want to meet someone.</p>

<h2>The Price of Connection in 2026</h2>

<p>Grindr Unlimited runs <strong>$49.99/month</strong>. Scruff Pro is $19.99. Tinder Platinum is $39.99. Hinge Preferred is $49.99. And that''s before the à la carte extras — boosts, super likes, roses, rewinds — all designed to make you pay more for features that should be standard.</p>

<p>The math is staggering. A Grindr Unlimited subscriber spends <strong>$600 per year</strong> just to see who viewed their profile and use basic filters. That''s more than Netflix, Spotify, and iCloud combined. For what? The privilege of using an app that''s existed for over a decade.</p>

<p>These apps aren''t building anything new. They''re gating features that already exist behind higher and higher paywalls, using dark patterns to nudge you toward subscriptions, and deliberately degrading the free experience to pressure you into paying.</p>

<h2>Why We Built Primal to Be Free</h2>

<p>Primal is different. <strong>Every feature is free.</strong> Unlimited messages, video calls, incognito mode, travel mode, read receipts, advanced filters, "who viewed me" — all of it. No paywall. No limits. No "upgrade to unlock."</p>

<p>Why? Because we believe the product should speak for itself. We''re building Primal to be the app we actually want to use — and we don''t want to use an app that holds features hostage until we pay up.</p>

<p>We may introduce optional paid features in the future. But right now, our focus is on building the best product possible and growing a real community. Not monetizing loneliness.</p>

<h2>Free Doesn''t Mean Cheap: Our Security Commitment</h2>

<p>"If it''s free, you''re the product." We hear this a lot, and it''s a fair concern. So let''s be transparent about what we''ve built under the hood. We recently completed a comprehensive security audit of the Primal platform. Here''s what it found.</p>

<h3>Authentication & Session Security</h3>
<p>Every protected route requires authentication via secure, HttpOnly session cookies. We use Supabase Auth with server-side session validation and proper cookie-based token management. Our auth endpoints are rate-limited to <strong>5 requests per 15 minutes</strong> to prevent brute force attacks. All users must be 18+ with date-of-birth verification at signup.</p>

<h3>Distributed Rate Limiting</h3>
<p>We use Upstash Redis for <strong>distributed rate limiting across all serverless instances</strong> — not the toy in-memory limiters that break under load. Every endpoint type has its own limit: auth (5/15min), API (100/min), email (10/min), video calls (10/min), admin operations (30/min). In production, if the rate limiter fails, requests are <strong>rejected by default</strong> — we fail secure, not open.</p>

<h3>Content Security & Headers</h3>
<p>We run a strict Content Security Policy that whitelists only trusted domains. Every response includes X-Frame-Options (SAMEORIGIN), X-Content-Type-Options (nosniff), a strict Referrer-Policy, and a Permissions-Policy that restricts camera, microphone, and geolocation access to our app and our video provider only.</p>

<h3>Data Privacy by Design</h3>
<p>Your location data is stored securely in our database with Row Level Security (RLS) policies that ensure users can only access their own data. Blocked users are completely invisible to each other — in both directions. Incognito mode hides you from browse and search entirely. Travel mode lets you appear in a different city without exposing your real location.</p>

<h3>Photo Safety</h3>
<p>Every photo upload goes through <strong>client-side NSFW detection</strong> using TensorFlow.js — your photos are scanned on your device, never sent to a third-party AI service. We use perceptual hashing to prevent re-upload of previously rejected photos, even if they''re cropped or resized. All photos are compressed and resized client-side before upload to prevent exfiltration of EXIF metadata.</p>

<h3>Payment Security</h3>
<p>When we do introduce payments, they''ll be handled by CCBill — a PCI DSS Level 1 compliant processor. We never see or store credit card numbers. Webhook signatures are verified with cryptographic digests, and we have idempotency checks to prevent double-charging on retry.</p>

<h3>Admin Controls</h3>
<p>Our admin system uses a four-tier role hierarchy (Support → Moderator → Admin → Founder) with granular permission checks on every operation. User deletion, payment refunds, and system settings are restricted to the highest authorization levels. Every admin action is logged.</p>

<h3>Row Level Security</h3>
<p>Every table in our database has Row Level Security enabled. This means even if our API had a bug, the database itself enforces that users can only read and write their own data. Profiles are only visible to other users if they''re not in incognito mode and there''s no active block between them.</p>

<h2>The Dark Patterns We Refuse to Use</h2>

<p>While other apps are engineering addiction and FOMO, here''s what you <strong>won''t</strong> find on Primal:</p>

<ul>
<li><strong>No algorithmic manipulation.</strong> We don''t hide profiles to make you swipe more. We don''t throttle your visibility to sell you boosts.</li>
<li><strong>No artificial scarcity.</strong> We don''t limit your daily likes, your messages, or your profile views to create urgency.</li>
<li><strong>No bait-and-switch.</strong> We don''t blur profiles to tease you into paying. If someone viewed you, you see who it was.</li>
<li><strong>No psychological tricks.</strong> We don''t send fake notifications. We don''t create phantom "likes" to pull you back into the app.</li>
<li><strong>No data selling.</strong> We don''t sell your data to advertisers. We don''t run third-party ads. Your data stays with us.</li>
</ul>

<h2>What We''re Building Instead</h2>

<p>Primal is focused on real connections. Built-in video calls so you can verify who you''re talking to. A map view to find people nearby. Pulse rooms for community hangouts. Group features for events. All secured with the kind of infrastructure that enterprise apps charge thousands for.</p>

<p>We''re a small team with a clear mission: build the dating app that gay and bisexual men actually deserve. One that treats you like a person, not a revenue target.</p>

<p><strong>Primal is free while we grow.</strong> We may add paid features in the future, but for now it''s just the product: no ads, no algorithmic manipulation, no dark patterns, and no tricks.</p>

<p>Download Primal at <a href="https://primalgay.com">primalgay.com</a> and see for yourself.</p>',
  'Dating apps now cost $40-50/month. Grindr Unlimited is $600/year. Primal is building something different: every feature is free, backed by enterprise-grade security. No dark patterns, no tricks.',
  'Dating apps charge $40-50/month for basic features. Primal is 100% free with enterprise-grade security: distributed rate limiting, client-side NSFW detection, row-level security, and zero dark patterns. Here''s why.',
  ARRAY['free dating app', 'gay dating app', 'grindr alternative', 'dating app security', 'dating app pricing', 'primal dating app', 'free gay dating', 'dating app dark patterns', 'dating app cost 2026'],
  ARRAY['Product', 'Security', 'Industry'],
  'Primal',
  'published',
  'Dating Apps Are Charging an Arm and a Leg. Primal Is Free.',
  'Every feature free. Enterprise-grade security. No dark patterns. Here''s why Primal refuses to charge $50/month for basic dating app features.',
  NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  excerpt = EXCLUDED.excerpt,
  meta_description = EXCLUDED.meta_description,
  tags = EXCLUDED.tags,
  categories = EXCLUDED.categories,
  og_title = EXCLUDED.og_title,
  og_description = EXCLUDED.og_description,
  status = EXCLUDED.status,
  published_at = EXCLUDED.published_at,
  updated_at = NOW();
