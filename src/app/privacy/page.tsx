export default function PrivacyPolicy() {
  return (
    <div style={{ minHeight: '100vh', background: '#fff', color: '#000', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif" }}>
      <header style={{ padding: '30px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <a href="/" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '32px', fontWeight: 700, letterSpacing: '0.3em', textDecoration: 'none', color: '#000' }}>s l t r</a>
        <a href="/" style={{ fontSize: '12px', color: '#666', textDecoration: 'none' }}>← Back to Home</a>
      </header>
      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 30px' }}>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '48px', fontWeight: 300, marginBottom: '10px' }}>Privacy Policy</h1>
        <p style={{ color: '#666', marginBottom: '40px', fontSize: '14px' }}>Last updated: January 2025</p>
        <div style={{ background: '#f9f9f9', padding: '30px', marginBottom: '50px', borderLeft: '3px solid #000' }}>
          <h3 style={{ marginBottom: '15px', fontSize: '16px', fontWeight: 600 }}>Quick Summary</h3>
          <p style={{ lineHeight: 1.8, color: '#444' }}>SLTR is a location-based dating platform for the LGBTQ+ community. We collect information you provide to connect you with nearby users. We never sell your data. You can delete your information anytime.</p>
        </div>
        <Section title="1. Information We Collect">
          <p><strong>Account:</strong> Email, date of birth, display name, password</p>
          <p><strong>Profile:</strong> Photos, bio, physical attributes, gender identity, orientation</p>
          <p><strong>Location:</strong> Precise geolocation when enabled</p>
          <p><strong>Usage:</strong> Device info, pages viewed, features used</p>
        </Section>
        <Section title="2. How We Use Your Information">
          <p>Create and manage your account. Display your profile to other users based on proximity. Enable messaging, voice, and video calls. Detect and prevent fraud and abuse. Verify age compliance (18+).</p>
        </Section>
        <Section title="3. Information Sharing">
          <p><strong>We do not sell your personal information.</strong></p>
          <p>Your public profile is visible to other users within your radius. We share data with service providers who help operate our platform. We may share data to comply with legal requirements.</p>
        </Section>
        <Section title="4. Data Security">
          <p>TLS 1.3+ encryption in transit. AES-256 encryption at rest. Role-based access control. Secure password hashing with bcrypt.</p>
        </Section>
        <Section title="5. Your Rights">
          <p>Access, correct, or delete your data anytime. Export your data in portable format. Opt out of marketing communications.</p>
        </Section>
        <Section title="6. Contact">
          <p><strong>Email:</strong> support@primalgay.com</p>
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

