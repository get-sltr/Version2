'use client';

export default function CommunityGuidelines() {
  return (
    <div style={{ minHeight: '100vh', background: '#fff', color: '#000', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif" }}>
      <header style={{ padding: '30px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <a href="/" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '32px', fontWeight: 700, letterSpacing: '0.3em', textDecoration: 'none', color: '#000' }}>s l t r</a>
        <a href="/" style={{ fontSize: '12px', color: '#666', textDecoration: 'none' }}>← Back to Home</a>
      </header>
      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 30px' }}>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '48px', fontWeight: 300, marginBottom: '10px' }}>Community Guidelines</h1>
        <p style={{ color: '#666', marginBottom: '40px', fontSize: '14px' }}>Last updated: January 2025</p>
        <div style={{ background: '#e3f2fd', padding: '25px', marginBottom: '50px', borderLeft: '4px solid #2196f3' }}>
          <p style={{ lineHeight: 1.7 }}>SLTR is a safe, inclusive space for the LGBTQ+ community to connect authentically.</p>
        </div>
        <Section title="Core Values">
          <p><strong>Respect:</strong> Treat everyone with kindness and dignity.</p>
          <p><strong>Consent:</strong> All interactions must be consensual.</p>
          <p><strong>Inclusivity:</strong> We celebrate diversity in all forms.</p>
          <p><strong>Safety:</strong> Your wellbeing is our priority.</p>
        </Section>
        <Section title="Age Requirement">
          <p><strong>SLTR is strictly 18+ only.</strong> We verify ages and remove underage accounts immediately.</p>
        </Section>
        <Section title="Zero Tolerance">
          <p>Harassment, stalking, or threatening behavior. Hate speech, homophobia, transphobia, racism. Non-consensual sharing of intimate content. Impersonation or catfishing.</p>
        </Section>
        <Section title="Crisis Support">
          <p><strong>Trevor Project:</strong> 1-866-488-7386</p>
          <p><strong>Trans Lifeline:</strong> 1-877-565-8860</p>
          <p><strong>Crisis Text Line:</strong> Text HOME to 741741</p>
        </Section>
        <Section title="Contact">
          <p><strong>Email:</strong> support@primalgay.com</p>
        </Section>
      </main>
      <footer style={{ padding: '40px 30px', borderTop: '1px solid #eee', textAlign: 'center' }}>
        <p style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", fontSize: '11px', opacity: 0.4 }}>© 2025 SLTR Digital LLC. All rights reserved.</p>
      </footer>
    </div>
  );
}

function Section({ title, children }: Readonly<{ title: string; children: React.ReactNode }>) {
  return (
    <section style={{ marginBottom: '40px' }}>
      <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '15px', paddingBottom: '10px', borderBottom: '1px solid #eee' }}>{title}</h2>
      <div style={{ lineHeight: 1.8, color: '#333' }}>{children}</div>
    </section>
  );
}

function Page() {
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 30px' }}>
      <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '30px' }}>Community Guidelines</h1>
      <Section title="Respect & Kindness">
        Be respectful to all members of our community. Treat others how you'd like to be treated.
      </Section>
      <Section title="Safety First">
        Never share personal information like your home address or phone number. Report suspicious behavior.
      </Section>
      <Section title="No Harassment">
        Harassment, bullying, or hate speech is strictly prohibited. Violators will be removed.
      </Section>
      <Section title="Authenticity">
        Be yourself. Use a real photo and honest information in your profile.
      </Section>
      <footer style={{ borderTop: '1px solid #eee', padding: '40px 30px', textAlign: 'center' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', gap: '30px', justifyContent: 'center', fontSize: '14px' }}>
          <a href="/terms" style={{ color: '#666', textDecoration: 'none' }}>Terms of Service</a>
          <a href="/privacy" style={{ color: '#666', textDecoration: 'none' }}>Privacy Policy</a>
          <a href="/" style={{ color: '#666', textDecoration: 'none' }}>Home</a>
        </div>
      </footer>
    </div>
  );
}
