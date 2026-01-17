export default function CookiePolicy() {
  return (
    <div style={{ minHeight: '100vh', background: '#fff', color: '#000', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif" }}>
      <header style={{ padding: '30px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <a href="/" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '32px', fontWeight: 700, letterSpacing: '0.3em', textDecoration: 'none', color: '#000' }}>s l t r</a>
        <a href="/" style={{ fontSize: '12px', color: '#666', textDecoration: 'none' }}>← Back to Home</a>
      </header>
      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 30px' }}>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '48px', fontWeight: 300, marginBottom: '10px' }}>Cookie Policy</h1>
        <p style={{ color: '#666', marginBottom: '40px', fontSize: '14px' }}>Last updated: January 2025</p>
        <div style={{ background: '#f9f9f9', padding: '25px', marginBottom: '50px', borderLeft: '3px solid #000' }}>
          <p style={{ lineHeight: 1.7 }}>Cookies are small text files stored on your device to remember preferences and improve your experience.</p>
        </div>
        <Section title="Types of Cookies">
          <p><strong>Essential:</strong> Authentication, security, load balancing</p>
          <p><strong>Functional:</strong> Language, notifications, theme preferences</p>
          <p><strong>Analytics:</strong> Performance monitoring, usage patterns</p>
          <p><strong>Marketing:</strong> Ad tracking (optional, requires consent)</p>
        </Section>
        <Section title="Cookie Lifespan">
          <p>Session cookies: Deleted when browser closes</p>
          <p>Authentication: 30 days</p>
          <p>Preferences: 1 year</p>
          <p>Analytics: 1-2 years</p>
        </Section>
        <Section title="Managing Cookies">
          <p>Control cookies through your browser settings. Disabling may affect some functionality.</p>
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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: '40px' }}>
      <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '15px', paddingBottom: '10px', borderBottom: '1px solid #eee' }}>{title}</h2>
      <div style={{ lineHeight: 1.8, color: '#333' }}>{children}</div>
    </section>
  );
}
