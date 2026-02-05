export default function PrivacyPolicy() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#e0e0e0', fontFamily: "var(--font-dm-sans), -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif" }}>
      <header style={{ padding: '30px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <a href="/" style={{ fontFamily: "var(--font-orbitron), 'Orbitron', sans-serif", fontSize: '28px', fontWeight: 700, letterSpacing: '0.1em', textDecoration: 'none', color: '#FF6B35' }}>PRIMAL</a>
        <a href="/" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', textDecoration: 'none', padding: '10px', minHeight: '44px', display: 'inline-flex', alignItems: 'center' }}>← Back to Home</a>
      </header>
      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 30px' }}>
        <h1 style={{ fontFamily: "var(--font-orbitron), 'Orbitron', sans-serif", fontSize: '36px', fontWeight: 600, marginBottom: '10px', color: '#fff' }}>Privacy Policy</h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: '40px', fontSize: '14px' }}>Last updated: February 2026</p>
        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '30px', marginBottom: '50px', borderLeft: '3px solid rgba(255,255,255,0.3)', borderRadius: '0 8px 8px 0' }}>
          <h3 style={{ marginBottom: '15px', fontSize: '16px', fontWeight: 600, color: '#fff' }}>Quick Summary</h3>
          <p style={{ lineHeight: 1.8, color: 'rgba(255,255,255,0.6)' }}>Primal is a location-based dating platform for the LGBTQ+ community. We collect information you provide to connect you with nearby users. We never sell your data. You can export or delete your information anytime from Settings.</p>
        </div>
        <Section title="1. Information We Collect">
          <p><strong>Account:</strong> Email, date of birth, display name, password</p>
          <p><strong>Profile:</strong> Photos, bio, physical attributes, gender identity, orientation</p>
          <p><strong>Location:</strong> Precise geolocation when enabled (required for core features)</p>
          <p><strong>Usage:</strong> Device info, pages viewed, features used, crash reports</p>
          <p><strong>Payments:</strong> Purchase history, subscription status (processed by Apple/Google via RevenueCat)</p>
        </Section>
        <Section title="2. How We Use Your Information">
          <p>Create and manage your account. Display your profile to other users based on proximity. Enable messaging, voice, and video calls. Detect and prevent fraud and abuse. Verify age compliance (18+). Process and manage subscriptions. Send service-related notifications.</p>
        </Section>
        <Section title="3. Information Sharing">
          <p><strong>We do not sell your personal information.</strong></p>
          <p>Your public profile is visible to other users within your radius. We share data with service providers who help operate our platform:</p>
          <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
            <li><strong>Supabase</strong> - Database and authentication</li>
            <li><strong>RevenueCat</strong> - Subscription management (Apple/Google payments)</li>
            <li><strong>PostHog</strong> - Analytics</li>
            <li><strong>Sentry</strong> - Error tracking</li>
            <li><strong>OneSignal</strong> - Push notifications</li>
            <li><strong>Mapbox</strong> - Location services</li>
            <li><strong>LiveKit</strong> - Video calling</li>
          </ul>
          <p style={{ marginTop: '15px' }}>We may share data to comply with legal requirements or protect user safety.</p>
        </Section>
        <Section title="4. Data Security">
          <p>TLS 1.3+ encryption in transit. AES-256 encryption at rest. Role-based access control. Secure password hashing with bcrypt. Regular security audits. Row-level security on all database tables.</p>
        </Section>
        <Section title="5. Your Rights (CCPA/GDPR)">
          <p><strong>Access:</strong> View all data we have about you via data export.</p>
          <p><strong>Portability:</strong> Export your data in JSON format from Settings → Export Data.</p>
          <p><strong>Correction:</strong> Update your profile information at any time.</p>
          <p><strong>Deletion:</strong> Delete your account from Settings → Delete Account. After a 24-hour grace period, all your data will be permanently removed.</p>
          <p><strong>Opt-out:</strong> Disable marketing communications in notification settings.</p>
          <p style={{ marginTop: '15px' }}>California residents: You have the right to know what personal information is collected, request deletion, and opt-out of the sale of personal information (we do not sell your data).</p>
        </Section>
        <Section title="6. Data Retention">
          <p>We retain your data while your account is active. When you delete your account, we delete your personal data within 30 days, except where required for legal compliance, fraud prevention, or legitimate business purposes.</p>
        </Section>
        <Section title="7. Children's Privacy">
          <p>Primal is strictly for users 18 years and older. We do not knowingly collect information from minors. If we discover an underage user, we immediately terminate the account.</p>
        </Section>
        <Section title="8. International Transfers">
          <p>Your data may be processed in the United States. By using Primal, you consent to this transfer. We use industry-standard safeguards to protect data during international transfers.</p>
        </Section>
        <Section title="9. Changes to This Policy">
          <p>We may update this policy periodically. We will notify you of significant changes via email or in-app notification. Continued use after changes constitutes acceptance.</p>
        </Section>
        <Section title="10. Contact">
          <p><strong>Email:</strong> support@primalgay.com</p>
          <p><strong>Company:</strong> Primal / SLTR DIGITAL LLC, Los Angeles, CA</p>
          <p style={{ marginTop: '15px' }}>For data requests, email privacy@primalgay.com with "Data Request" in the subject line.</p>
        </Section>
      </main>
      <footer style={{ padding: '40px 30px', borderTop: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginBottom: '20px' }}>
          <a href="/terms" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '13px' }}>Terms of Service</a>
          <a href="/guidelines" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '13px' }}>Community Guidelines</a>
        </div>
        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>© 2025–2026 Primal. All rights reserved.</p>
      </footer>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: '40px' }}>
      <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '15px', paddingBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}>{title}</h2>
      <div style={{ lineHeight: 1.8, color: 'rgba(255,255,255,0.7)' }}>{children}</div>
    </section>
  );
}
