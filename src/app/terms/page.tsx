export default function TermsOfService() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#e0e0e0', fontFamily: "var(--font-dm-sans), -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif" }}>
      <header style={{ padding: '30px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <a href="/" style={{ fontFamily: "var(--font-orbitron), 'Orbitron', sans-serif", fontSize: '28px', fontWeight: 700, letterSpacing: '0.1em', textDecoration: 'none', color: '#FF6B35' }}>PRIMAL</a>
        <a href="/" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', textDecoration: 'none', padding: '10px', minHeight: '44px', display: 'inline-flex', alignItems: 'center' }}>← Back to Home</a>
      </header>
      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 30px' }}>
        <h1 style={{ fontFamily: "var(--font-orbitron), 'Orbitron', sans-serif", fontSize: '36px', fontWeight: 600, marginBottom: '10px', color: '#fff' }}>Terms of Service</h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: '40px', fontSize: '14px' }}>Last updated: February 2026</p>
        <div style={{ background: 'rgba(255,107,53,0.08)', padding: '25px', marginBottom: '50px', borderLeft: '4px solid #FF6B35', borderRadius: '0 8px 8px 0' }}>
          <p style={{ lineHeight: 1.7, color: 'rgba(255,255,255,0.8)' }}><strong>Important:</strong> These Terms contain a mandatory arbitration clause and class action waiver. By using Primal, you agree to these Terms.</p>
        </div>
        <Section title="1. Acceptance of Terms">
          <p>By creating an account or using the Service, you agree to be bound by these Terms and our Privacy Policy. If you do not agree, do not use Primal.</p>
        </Section>
        <Section title="2. Eligibility">
          <p><strong>Age Requirement:</strong> You must be 18 years old or older on the day you create your account. Primal Men is strictly for adults aged 18 and over. We do not permit users under the age of 18 under any circumstances. Accounts found to belong to minors will be immediately terminated.</p>
          <p><strong>Legal Restrictions:</strong> You must never have been convicted of a sex crime or required to register as a sex offender. You must not be prohibited from using the Service under applicable law.</p>
        </Section>
        <Section title="3. Account Security">
          <p>You are responsible for maintaining the security of your account credentials. Do not share your password or allow others to access your account. Notify us immediately if you suspect unauthorized access.</p>
        </Section>
        <Section title="4. Prohibited Conduct">
          <p>You agree not to:</p>
          <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
            <li>Harass, stalk, threaten, or bully other users</li>
            <li>Post hate speech, discriminatory content, or slurs</li>
            <li>Share sexual content involving minors or non-consensual content</li>
            <li>Engage in fraud, scams, or impersonation</li>
            <li>Send spam or unsolicited advertising</li>
            <li>Use bots, scrapers, or automated tools</li>
            <li>Attempt to hack, exploit, or compromise the Service</li>
            <li>Violate any applicable laws or regulations</li>
          </ul>
        </Section>
        <Section title="5. Content Ownership">
          <p>You retain ownership of content you post. By posting content, you grant Primal a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and display your content to provide and promote the Service.</p>
          <p>You represent that you have the right to post all content and that it does not infringe any third-party rights.</p>
        </Section>
        <Section title="6. Content Moderation & Automated Scanning">
          <p><strong>Automated Photo Scanning:</strong> Public profile photos are automatically scanned for explicit content using on-device AI technology before upload. Photos that violate our content policies will be blocked.</p>
          <p><strong>What Is Allowed:</strong> Shirtless, swimwear, fitness, and similar photos are permitted on public profiles. Only explicit nudity and sexual content is blocked.</p>
          <p><strong>Private Content:</strong> Private albums and direct messages between consenting adults are not subject to automated scanning.</p>
          <p><strong>Consent to Scanning:</strong> By uploading photos, you consent to automated content moderation. This is required to maintain a safe platform and comply with app store policies.</p>
          <p><strong>Appeals:</strong> If you believe your content was incorrectly blocked, contact support@primalgay.com.</p>
        </Section>
        <Section title="7. Subscriptions & Payments">
          <p><strong>In-App Purchases:</strong> Premium features are available through in-app subscriptions processed by the Apple App Store or Google Play Store.</p>
          <p><strong>Auto-Renewal:</strong> Subscriptions automatically renew unless canceled at least 24 hours before the end of the current period.</p>
          <p><strong>Managing Subscriptions:</strong></p>
          <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
            <li><strong>iOS:</strong> Settings → [Your Name] → Subscriptions → Primal</li>
            <li><strong>Android:</strong> Google Play → Menu → Subscriptions → Primal</li>
          </ul>
          <p style={{ marginTop: '15px' }}><strong>Refunds:</strong> Refund requests must be submitted to Apple or Google, as they process all payments. Primal does not have access to your payment information and cannot process refunds directly.</p>
          <p><strong>Price Changes:</strong> We may change subscription prices. You will be notified in advance, and price changes will apply to subsequent billing periods.</p>
        </Section>
        <Section title="8. Account Deletion">
          <p>You may delete your account at any time from Settings → Delete Account. After initiating deletion:</p>
          <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
            <li>You have 24 hours to cancel the deletion by logging back in</li>
            <li>After 24 hours, your account and data will be permanently deleted</li>
            <li>Active subscriptions are not automatically canceled—manage them via Apple/Google</li>
          </ul>
        </Section>
        <Section title="9. Disclaimers">
          <p>THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. We do not guarantee that the Service will be uninterrupted, secure, or error-free.</p>
          <p>We are not responsible for the actions, content, or behavior of other users. Use caution when meeting people in person.</p>
        </Section>
        <Section title="10. Limitation of Liability">
          <p>TO THE MAXIMUM EXTENT PERMITTED BY LAW, PRIMAL SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE SERVICE.</p>
        </Section>
        <Section title="11. Arbitration & Class Action Waiver">
          <p>Any disputes will be resolved by binding individual arbitration, not in court. You waive any right to participate in class actions.</p>
          <p><strong>Opt-Out:</strong> You may opt out of this arbitration provision within 30 days of account creation by emailing legal@primalgay.com with "Arbitration Opt-Out" in the subject line.</p>
        </Section>
        <Section title="12. Governing Law">
          <p>These Terms are governed by the laws of the State of California, without regard to conflict of law principles.</p>
        </Section>
        <Section title="13. Changes to Terms">
          <p>We may modify these Terms at any time. Continued use after changes constitutes acceptance. We will notify you of material changes via email or in-app notification.</p>
        </Section>
        <Section title="14. Contact">
          <p><strong>Email:</strong> support@primalgay.com</p>
          <p><strong>Legal:</strong> legal@primalgay.com</p>
          <p><strong>Company:</strong> Primal / SLTR DIGITAL LLC, Los Angeles, CA</p>
        </Section>
      </main>
      <footer style={{ padding: '40px 30px', borderTop: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginBottom: '20px' }}>
          <a href="/privacy" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '13px' }}>Privacy Policy</a>
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
