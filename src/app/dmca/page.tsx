export default function DMCAPolicy() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#e0e0e0', fontFamily: "var(--font-dm-sans), -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif" }}>
      <header style={{ padding: '30px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <a href="/" style={{ fontFamily: "var(--font-orbitron), 'Orbitron', sans-serif", fontSize: '28px', fontWeight: 700, letterSpacing: '0.1em', textDecoration: 'none', color: '#FF6B35' }}>PRIMAL MEN</a>
        <a href="/" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', textDecoration: 'none', padding: '10px', minHeight: '44px', display: 'inline-flex', alignItems: 'center' }}>← Back to Home</a>
      </header>
      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 30px' }}>
        <h1 style={{ fontFamily: "var(--font-orbitron), 'Orbitron', sans-serif", fontSize: '36px', fontWeight: 600, marginBottom: '10px', color: '#fff' }}>DMCA Policy</h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: '40px', fontSize: '14px' }}>Digital Millennium Copyright Act | Last updated: February 2026</p>
        <Section title="Overview">
          <p>Primal Men (&quot;Primal&quot;), operated by SLTR Digital LLC, respects intellectual property rights and complies with the Digital Millennium Copyright Act of 1998 (17 U.S.C. § 512). We respond promptly to notices of alleged copyright infringement that comply with the DMCA.</p>
        </Section>
        <Section title="Reporting Infringement">
          <p>If you believe that content on Primal infringes your copyright, please send a written notice to our designated DMCA Agent that includes:</p>
          <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
            <li>A physical or electronic signature of the copyright owner or authorized representative.</li>
            <li>Identification of the copyrighted work you claim has been infringed.</li>
            <li>Identification of the material that is claimed to be infringing, including its location on Primal (e.g., a URL or screenshot).</li>
            <li>Your contact information (name, address, telephone number, and email).</li>
            <li>A statement that you have a good faith belief the disputed use is not authorized by the copyright owner, its agent, or the law.</li>
            <li>A statement, made under penalty of perjury, that the information in your notice is accurate and that you are the copyright owner or authorized to act on their behalf.</li>
          </ul>
        </Section>
        <Section title="Designated DMCA Agent">
          <p><strong>SLTR Digital LLC</strong></p>
          <p>Attn: DMCA Agent</p>
          <p>1541 Wilshire Blvd, Suite 300</p>
          <p>Los Angeles, CA 90017</p>
          <p>United States</p>
          <p style={{ marginTop: '10px' }}><strong>Email:</strong> legal@primalgay.com</p>
        </Section>
        <Section title="Counter-Notification">
          <p>If you believe content was removed or disabled by mistake or misidentification, you may submit a counter-notification to our DMCA Agent. Your counter-notification must include:</p>
          <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
            <li>Your physical or electronic signature.</li>
            <li>Identification of the material that was removed and its prior location.</li>
            <li>A statement under penalty of perjury that you have a good faith belief the material was removed as a result of mistake or misidentification.</li>
            <li>Your name, address, and telephone number.</li>
            <li>A statement that you consent to the jurisdiction of the federal court in your district and will accept service of process from the person who filed the original DMCA notice.</li>
          </ul>
          <p style={{ marginTop: '10px' }}>Please note that filing a false counter-notification constitutes perjury under federal law.</p>
        </Section>
        <Section title="Repeat Infringer Policy">
          <p>In accordance with the DMCA, Primal has adopted a policy of terminating, in appropriate circumstances, the accounts of users who are repeat copyright infringers. If a user receives three or more valid DMCA notices, their account may be permanently terminated without further notice.</p>
        </Section>
      </main>
      <footer style={{ padding: '40px 30px', borderTop: '1px solid rgba(255,255,255,0.1)', textAlign: 'center', background: '#0a0a0f' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <a href="/privacy" style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Privacy Policy</a>
          <a href="/terms" style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Terms of Service</a>
          <a href="/guidelines" style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Community Guidelines</a>
        </div>
        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)' }}>© 2025–2026 Primal Men. All rights reserved.</p>
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
