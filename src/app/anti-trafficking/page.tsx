import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Anti-Human Trafficking Policy | Primal',
  description: 'Primal Anti-Human Trafficking Policy — our commitment to combating human trafficking and sexual exploitation.',
  alternates: { canonical: '/anti-trafficking' },
};

export default function AntiTraffickingPolicy() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#e0e0e0', fontFamily: "var(--font-dm-sans), -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif" }}>
      {/* Header */}
      <header style={{ padding: '20px 30px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'rgba(10,10,15,0.95)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', zIndex: 100 }}>
        <a href="/" style={{ fontFamily: "var(--font-orbitron), 'Orbitron', sans-serif", fontSize: '24px', fontWeight: 700, letterSpacing: '0.1em', textDecoration: 'none', color: '#FF6B35' }}>PRIMAL</a>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <a href="/terms" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', textDecoration: 'none', padding: '10px', minHeight: '44px', display: 'inline-flex', alignItems: 'center' }}>Terms</a>
          <a href="/privacy" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', textDecoration: 'none', padding: '10px', minHeight: '44px', display: 'inline-flex', alignItems: 'center' }}>Privacy</a>
          <a href="/" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', textDecoration: 'none', padding: '10px', minHeight: '44px', display: 'inline-flex', alignItems: 'center' }}>Home</a>
        </div>
      </header>

      {/* Hero */}
      <div style={{ position: 'relative', padding: '80px 30px 60px', textAlign: 'center' }}>
        <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translateX(-50%)', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(255,107,53,0.06) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none' }} />
        <p style={{ fontSize: '11px', letterSpacing: '0.4em', textTransform: 'uppercase', color: '#FF6B35', marginBottom: '16px', fontWeight: 500, position: 'relative' }}>Policy</p>
        <h1 style={{ fontFamily: "var(--font-orbitron), 'Orbitron', sans-serif", fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 600, marginBottom: '12px', color: '#fff', position: 'relative' }}>Anti-Human Trafficking Policy</h1>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '14px', position: 'relative' }}>Effective Date: April 1, 2026 &middot; SLTR Digital LLC</p>
      </div>

      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '0 30px 80px' }}>
        {/* Intro */}
        <div style={{ background: 'rgba(255,107,53,0.06)', border: '1px solid rgba(255,107,53,0.2)', padding: '28px', marginBottom: '50px', borderRadius: '12px' }}>
          <h3 style={{ marginBottom: '12px', fontSize: '15px', fontWeight: 600, color: '#FF6B35', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Zero Tolerance</h3>
          <p style={{ lineHeight: 1.8, color: 'rgba(255,255,255,0.7)', fontSize: '15px' }}>SLTR Digital LLC (&quot;Primal&quot;) maintains a strict zero-tolerance policy against human trafficking, sexual exploitation, and all forms of modern slavery. We are committed to doing our part to prevent these crimes from occurring on or through our platform.</p>
        </div>

        <Section num="1" title="Our Commitment">
          <p>Primal is committed to combating human trafficking and sexual exploitation in all its forms. We recognize that online platforms can be misused by traffickers and exploiters, and we take proactive steps to identify, prevent, and report any such activity. This policy applies to all users, employees, contractors, and partners of Primal.</p>
        </Section>

        <Section num="2" title="Prohibited Activities">
          <p>The following activities are strictly prohibited on Primal and will result in immediate, permanent account termination and reporting to law enforcement:</p>
          <ul style={{ marginTop: '12px', paddingLeft: '20px' }}>
            <li>Sex trafficking or any form of commercial sexual exploitation</li>
            <li>Recruiting, advertising, soliciting, or facilitating prostitution or escort services</li>
            <li>Coercing, forcing, or compelling any individual to engage in sexual activity</li>
            <li>Labor trafficking or forced labor of any kind</li>
            <li>Transporting individuals for the purpose of exploitation</li>
            <li>Creating, distributing, or soliciting content that depicts or facilitates trafficking or exploitation</li>
            <li>Posting profiles, advertisements, or communications on behalf of another person who has not given free and voluntary consent</li>
          </ul>
        </Section>

        <Section num="3" title="Detection & Prevention">
          <p>Primal employs the following measures to detect and prevent trafficking on our platform:</p>
          <ul style={{ marginTop: '12px', paddingLeft: '20px' }}>
            <li><strong>Age Verification:</strong> All users must confirm they are 18 years of age or older before accessing any content on the platform. Accounts belonging to minors are immediately terminated.</li>
            <li><strong>Content Monitoring:</strong> We use a combination of automated systems and human review to identify language, patterns, and behavior associated with trafficking and exploitation.</li>
            <li><strong>User Reporting:</strong> Every user has the ability to report suspicious profiles, messages, or behavior directly from within the app. All reports are reviewed by our safety team.</li>
            <li><strong>Account Verification:</strong> We verify user identities and actively monitor for fake, duplicate, or suspicious accounts.</li>
            <li><strong>Pattern Analysis:</strong> We monitor for behavioral patterns commonly associated with trafficking, including accounts that appear to be controlled by third parties.</li>
          </ul>
        </Section>

        <Section num="4" title="Reporting & Cooperation with Law Enforcement">
          <p>When Primal identifies or receives a report of suspected human trafficking or sexual exploitation, we will:</p>
          <ul style={{ marginTop: '12px', paddingLeft: '20px' }}>
            <li>Immediately suspend the account(s) involved</li>
            <li>Preserve all relevant evidence and account data</li>
            <li>Report the activity to the National Center for Missing &amp; Exploited Children (NCMEC) when minors may be involved</li>
            <li>Cooperate fully with law enforcement investigations, including providing data pursuant to valid legal process</li>
            <li>Report suspected trafficking to the National Human Trafficking Hotline</li>
          </ul>
        </Section>

        <Section num="5" title="How to Report Suspected Trafficking">
          <p>If you suspect human trafficking or exploitation on Primal, please report it immediately through any of the following channels:</p>
          <ul style={{ marginTop: '12px', paddingLeft: '20px' }}>
            <li><strong>In-App:</strong> Use the Report button on any profile or message</li>
            <li><strong>Email:</strong> <a href="mailto:safety@primalgay.com" style={{ color: '#FF6B35', textDecoration: 'underline', textUnderlineOffset: '2px' }}>safety@primalgay.com</a></li>
          </ul>
          <p style={{ marginTop: '16px' }}>You can also report suspected trafficking to the following external resources:</p>
          <ul style={{ marginTop: '12px', paddingLeft: '20px' }}>
            <li><strong>National Human Trafficking Hotline:</strong> 1-888-373-7888 or text &quot;HELP&quot; to 233733</li>
            <li><strong>NCMEC CyberTipline:</strong> <a href="https://report.cybertip.org" style={{ color: '#FF6B35', textDecoration: 'underline', textUnderlineOffset: '2px' }}>report.cybertip.org</a></li>
            <li><strong>FBI Tips:</strong> <a href="https://tips.fbi.gov" style={{ color: '#FF6B35', textDecoration: 'underline', textUnderlineOffset: '2px' }}>tips.fbi.gov</a></li>
          </ul>
        </Section>

        <Section num="6" title="Employee & Contractor Training">
          <p>All Primal employees and contractors who interact with user content or safety reports receive training on identifying the signs of human trafficking and exploitation, proper reporting procedures, and applicable legal obligations. This training is conducted at onboarding and refreshed annually.</p>
        </Section>

        <Section num="7" title="Updates to This Policy">
          <p>We review and update this policy regularly to reflect changes in law, industry best practices, and our own capabilities. The effective date at the top of this page indicates the most recent revision. Continued use of the Service following any changes constitutes acceptance of the updated policy.</p>
        </Section>

        <Section num="8" title="Contact">
          <p>For questions about this policy, contact us at <a href="mailto:safety@primalgay.com" style={{ color: '#FF6B35', textDecoration: 'underline', textUnderlineOffset: '2px' }}>safety@primalgay.com</a>.</p>
        </Section>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '40px 30px', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <a href="/terms" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '13px' }}>Terms</a>
          <a href="/privacy" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '13px' }}>Privacy</a>
          <a href="/complaints" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '13px' }}>Complaints</a>
          <a href="/2257" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '13px' }}>18 U.S.C. 2257</a>
          <a href="/" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '13px' }}>Home</a>
        </div>
        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)' }}>&copy; 2025&ndash;2026 SLTR Digital LLC. All rights reserved.</p>
      </footer>
    </div>
  );
}

function Section({ num, title, children }: { num: string; title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: '48px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <span style={{ fontFamily: "var(--font-orbitron), 'Orbitron', sans-serif", fontSize: '13px', color: '#FF6B35', fontWeight: 600 }}>{num}.</span>
        <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#fff' }}>{title}</h2>
      </div>
      <div style={{ lineHeight: 1.85, color: 'rgba(255,255,255,0.65)', fontSize: '15px' }}>{children}</div>
    </section>
  );
}
