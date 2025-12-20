export default function SecurityPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#fff', color: '#000', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif" }}>
      <header style={{ padding: '30px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <a href="/" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '32px', fontWeight: 700, letterSpacing: '0.3em', textDecoration: 'none', color: '#000' }}>s l t r</a>
        <a href="/" style={{ fontSize: '12px', color: '#666', textDecoration: 'none' }}>← Back to Home</a>
      </header>
      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 30px' }}>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '48px', fontWeight: 300, marginBottom: '10px' }}>Security & Trust</h1>
        <p style={{ color: '#666', marginBottom: '40px', fontSize: '14px' }}>Last updated: January 2025</p>
        <div style={{ background: '#e8f5e9', padding: '25px', marginBottom: '50px', borderLeft: '4px solid #4caf50' }}>
          <p style={{ lineHeight: 1.7 }}>Security is built into everything we do at SLTR.</p>
        </div>
        <Section title="Data Encryption">
          <p>TLS 1.3+ encryption for all data in transit. AES-256 encryption for data at rest. PCI-DSS certified payment processing.</p>
        </Section>
        <Section title="Account Security">
          <p>Secure password hashing with bcrypt. Session management and automatic expiration. Identity verification for account recovery.</p>
        </Section>
        <Section title="Privacy Controls">
          <p>Block and report features. Incognito mode for private browsing. Granular location sharing controls. Delete your data anytime.</p>
        </Section>
        <Section title="Platform Safety">
          <p>24/7 automated threat monitoring. Regular security updates. Certified infrastructure providers.</p>
        </Section>
        <Section title="Report Issues">
          <p><strong>Email:</strong> customersupport@getsltr.com</p>
          <p><strong>Response Time:</strong> 24-48 hours</p>
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
