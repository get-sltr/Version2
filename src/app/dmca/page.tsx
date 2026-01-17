export default function DMCAPolicy() {
  return (
    <div style={{ minHeight: '100vh', background: '#fff', color: '#000', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif" }}>
      <header style={{ padding: '30px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <a href="/" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '32px', fontWeight: 700, letterSpacing: '0.3em', textDecoration: 'none', color: '#000' }}>s l t r</a>
        <a href="/" style={{ fontSize: '12px', color: '#666', textDecoration: 'none' }}>← Back to Home</a>
      </header>
      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 30px' }}>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '48px', fontWeight: 300, marginBottom: '10px' }}>DMCA Policy</h1>
        <p style={{ color: '#666', marginBottom: '40px', fontSize: '14px' }}>Digital Millennium Copyright Act | Last updated: January 2025</p>
        <Section title="Overview">
          <p>SLTR DIGITAL LLC respects intellectual property rights and complies with the Digital Millennium Copyright Act of 1998.</p>
        </Section>
        <Section title="Reporting Infringement">
          <p>To report copyright infringement, send a notice including: Identification of the copyrighted work. Location of the infringing material. Your contact information. Good faith statement. Accuracy statement under penalty of perjury. Your signature.</p>
        </Section>
        <Section title="DMCA Agent">
          <p><strong>SLTR DIGITAL LLC</strong></p>
          <p>Attn: DMCA Agent</p>
          <p>Los Angeles, CA</p>
          <p><strong>Email:</strong> support@primalgay.com</p>
        </Section>
        <Section title="Counter-Notification">
          <p>If you believe content was removed by mistake, submit a counter-notification with your contact info, consent to jurisdiction, and good faith statement.</p>
        </Section>
        <Section title="Repeat Infringer Policy">
          <p>We terminate accounts of repeat infringers.</p>
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
