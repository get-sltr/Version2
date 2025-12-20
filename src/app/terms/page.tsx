export default function TermsOfService() {
  return (
    <div style={{ minHeight: '100vh', background: '#fff', color: '#000', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif" }}>
      <header style={{ padding: '30px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <a href="/" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '32px', fontWeight: 700, letterSpacing: '0.3em', textDecoration: 'none', color: '#000' }}>s l t r</a>
        <a href="/" style={{ fontSize: '12px', color: '#666', textDecoration: 'none' }}>← Back to Home</a>
      </header>
      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 30px' }}>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '48px', fontWeight: 300, marginBottom: '10px' }}>Terms of Service</h1>
        <p style={{ color: '#666', marginBottom: '40px', fontSize: '14px' }}>Last updated: January 2025</p>
        <div style={{ background: '#fff3cd', padding: '25px', marginBottom: '50px', borderLeft: '4px solid #ffc107' }}>
          <p style={{ lineHeight: 1.7 }}><strong>Important:</strong> These Terms contain a mandatory arbitration clause and class action waiver. By using SLTR, you agree to these Terms.</p>
        </div>
        <Section title="1. Acceptance of Terms">
          <p>By creating an account or using the Service, you agree to be bound by these Terms and our Privacy Policy.</p>
        </Section>
        <Section title="2. Eligibility">
          <p>You must be at least 18 years old and have never been convicted of a sex crime or required to register as a sex offender.</p>
        </Section>
        <Section title="3. Prohibited Conduct">
          <p>Harassment, stalking, threatening, or bullying. Hate speech or discrimination. Sexual exploitation or non-consensual content. Fraud, scams, or impersonation. Spam or unsolicited content.</p>
        </Section>
        <Section title="4. Content Ownership">
          <p>You retain ownership of your content. By posting, you grant SLTR a license to use and display your content to provide the Service.</p>
        </Section>
        <Section title="5. Subscriptions">
          <p>Subscriptions auto-renew unless canceled. No refunds for partial periods. Price changes communicated 30 days in advance.</p>
        </Section>
        <Section title="6. Disclaimers">
          <p>THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND.</p>
        </Section>
        <Section title="7. Arbitration">
          <p>Disputes will be resolved by binding arbitration. You may opt out within 30 days by emailing customersupport@getsltr.com</p>
        </Section>
        <Section title="8. Contact">
          <p><strong>Email:</strong> customersupport@getsltr.com</p>
          <p><strong>Company:</strong> SLTR DIGITAL LLC, Los Angeles, CA</p>
        </Section>
      </main>
      <footer style={{ padding: '40px 30px', borderTop: '1px solid #eee', textAlign: 'center' }}>
        <p style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", fontSize: '11px', opacity: 0.4 }}>© 2025 SLTR Digital LLC. All rights reserved.</p>
      </footer>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: '40px' }}>
      <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '15px', paddingBottom: '10px', borderBottom: '1px solid #eee' }}>{title}</h2>
      <div style={{ lineHeight: 1.8, color: '#333' }}>{children}</div>
    </section>
  );
}
