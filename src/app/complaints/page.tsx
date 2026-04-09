import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Complaints & Content Removal Policy | Primal',
  description: 'Primal Complaints and Content Removal Policy — how to report content and our review process.',
  alternates: { canonical: '/complaints' },
};

export default function ComplaintsPolicy() {
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
        <h1 style={{ fontFamily: "var(--font-orbitron), 'Orbitron', sans-serif", fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 600, marginBottom: '12px', color: '#fff', position: 'relative' }}>Complaints &amp; Content Removal Policy</h1>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '14px', position: 'relative' }}>Effective Date: April 1, 2026 &middot; SLTR Digital LLC</p>
      </div>

      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '0 30px 80px' }}>
        {/* Intro */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '28px', marginBottom: '50px', borderRadius: '12px' }}>
          <p style={{ lineHeight: 1.8, color: 'rgba(255,255,255,0.6)', fontSize: '15px' }}>SLTR Digital LLC (&quot;Primal&quot;) is committed to maintaining a safe platform. This policy outlines how users, depicted individuals, and any member of the public can report content that may be illegal or that violates our standards, and how we investigate, resolve, and communicate the outcome of such reports.</p>
        </div>

        <Section num="1" title="How to Submit a Complaint">
          <p>Any person may report content that they believe is illegal, non-consensual, or otherwise violates our <a href="/terms" style={{ color: '#FF6B35', textDecoration: 'underline', textUnderlineOffset: '2px' }}>Terms of Service</a> or <a href="/guidelines" style={{ color: '#FF6B35', textDecoration: 'underline', textUnderlineOffset: '2px' }}>Community Guidelines</a> through any of the following channels:</p>
          <ul style={{ marginTop: '12px', paddingLeft: '20px' }}>
            <li><strong>In-App Report:</strong> Tap the Report button on any profile, photo, or message within the Primal app.</li>
            <li><strong>Email:</strong> Send a detailed report to <a href="mailto:complaints@primalgay.com" style={{ color: '#FF6B35', textDecoration: 'underline', textUnderlineOffset: '2px' }}>complaints@primalgay.com</a>. Include a description of the content, the username or profile URL involved, and the reason for the complaint.</li>
            <li><strong>CCBill Content Removal Request:</strong> You may also submit a complaint or content removal request through our payment processor&apos;s independent complaint form: <a href="https://www.ccbillcomplaintform.com/ccbill/form/CCBillContentRemovalRequest1/formperma/sBK2jfIoZWAFw2hRRt5Rv2PQncscFzpvOH6bPcwopas" style={{ color: '#FF6B35', textDecoration: 'underline', textUnderlineOffset: '2px' }} rel="nofollow">CCBill Complaint / Take Down Request</a></li>
          </ul>
        </Section>

        <Section num="2" title="What You Can Report">
          <p>Complaints may be submitted regarding any content that:</p>
          <ul style={{ marginTop: '12px', paddingLeft: '20px' }}>
            <li>Is illegal under applicable law</li>
            <li>Depicts or involves minors in any sexual context</li>
            <li>Contains non-consensual intimate imagery</li>
            <li>Constitutes harassment, threats, or hate speech</li>
            <li>Involves human trafficking or sexual exploitation</li>
            <li>Infringes intellectual property rights</li>
            <li>Violates any provision of our Terms of Service or Community Guidelines</li>
          </ul>
        </Section>

        <Section num="3" title="Review Process">
          <SubHead>3.1 Acknowledgment</SubHead>
          <p>All complaints are acknowledged within one (1) business day of receipt. You will receive a confirmation with a reference number for tracking purposes.</p>

          <SubHead>3.2 Investigation</SubHead>
          <p>Our safety and compliance team reviews every complaint. The investigation includes examining the reported content, the account associated with it, any relevant context, and applicable laws and platform policies.</p>

          <SubHead>3.3 Resolution Timeline</SubHead>
          <p>All complaints will be reviewed and resolved within five (5) business days of receipt. If a complaint requires additional investigation (for example, where law enforcement coordination is necessary), we will notify the complainant of the expected timeline.</p>

          <SubHead>3.4 Possible Outcomes</SubHead>
          <p>Following review, Primal may take one or more of the following actions:</p>
          <ul style={{ marginTop: '12px', paddingLeft: '20px' }}>
            <li><strong>No Action:</strong> The content is found not to violate our policies or applicable law.</li>
            <li><strong>Content Removal:</strong> The reported content is removed from the platform.</li>
            <li><strong>Account Warning:</strong> The account owner receives a formal warning about the violation.</li>
            <li><strong>Account Suspension:</strong> The account is temporarily suspended pending further review or corrective action.</li>
            <li><strong>Account Termination:</strong> The account is permanently terminated. This is the immediate outcome for zero-tolerance violations (child exploitation, trafficking, non-consensual intimate imagery).</li>
            <li><strong>Law Enforcement Referral:</strong> The matter is reported to law enforcement and/or NCMEC.</li>
          </ul>
          <p style={{ marginTop: '16px' }}>The complainant will be notified of the outcome of the investigation. For privacy and safety reasons, we may not disclose all details of actions taken against another user&apos;s account.</p>
        </Section>

        <Section num="4" title="Content Removal Requests by Depicted Individuals">
          <p>Any person who is depicted in content on Primal may request removal of that content. If you appear in a photograph, video, or other media on the platform and did not consent to its publication, or if your consent was obtained through fraud, coercion, or deception, you have the right to request its immediate removal.</p>
          <p style={{ marginTop: '12px' }}>To request removal, contact <a href="mailto:complaints@primalgay.com" style={{ color: '#FF6B35', textDecoration: 'underline', textUnderlineOffset: '2px' }}>complaints@primalgay.com</a> with:</p>
          <ul style={{ marginTop: '12px', paddingLeft: '20px' }}>
            <li>A description or screenshot of the content</li>
            <li>The profile URL or username where the content appears</li>
            <li>A statement that you are the person depicted and that you did not consent to publication, or that your consent has been revoked</li>
          </ul>
          <p style={{ marginTop: '12px' }}>Content removal requests from depicted individuals are treated as priority and are reviewed within two (2) business days. If the investigation confirms that consent was not given or is void under applicable law, the content will be removed.</p>
        </Section>

        <Section num="5" title="Appeals Process">
          <SubHead>5.1 Right to Appeal</SubHead>
          <p>Any user whose content has been removed or whose account has been actioned (warning, suspension, or termination) has the right to appeal the decision. Appeals must be submitted within thirty (30) days of the action.</p>

          <SubHead>5.2 How to Appeal</SubHead>
          <p>Submit your appeal by email to <a href="mailto:appeals@primalgay.com" style={{ color: '#FF6B35', textDecoration: 'underline', textUnderlineOffset: '2px' }}>appeals@primalgay.com</a> with:</p>
          <ul style={{ marginTop: '12px', paddingLeft: '20px' }}>
            <li>Your username or account email address</li>
            <li>The reference number of the original complaint (if available)</li>
            <li>A clear explanation of why you believe the decision was incorrect</li>
            <li>Any supporting evidence or context</li>
          </ul>

          <SubHead>5.3 Appeal Review</SubHead>
          <p>Appeals are reviewed by a member of our team who was not involved in the original decision. The appeal review will be completed within five (5) business days. You will be notified of the outcome.</p>

          <SubHead>5.4 Appeal Outcomes</SubHead>
          <p>The appeal may result in:</p>
          <ul style={{ marginTop: '12px', paddingLeft: '20px' }}>
            <li><strong>Decision Upheld:</strong> The original action stands.</li>
            <li><strong>Decision Reversed:</strong> The content is restored and/or the account action is lifted.</li>
            <li><strong>Decision Modified:</strong> The original action is adjusted (for example, a termination may be reduced to a suspension).</li>
          </ul>

          <SubHead>5.5 Neutral Third-Party Resolution</SubHead>
          <p>If the appealing party disagrees with the outcome of the internal appeal, they may request that the dispute be resolved by an independent, neutral third-party arbitrator. This request must be made in writing to <a href="mailto:appeals@primalgay.com" style={{ color: '#FF6B35', textDecoration: 'underline', textUnderlineOffset: '2px' }}>appeals@primalgay.com</a> within fourteen (14) days of receiving the appeal outcome. The arbitration will be conducted in accordance with the rules of the American Arbitration Association (AAA) and will be binding on both parties. Each party bears its own costs unless the arbitrator determines otherwise.</p>
        </Section>

        <Section num="6" title="Retaliation Prohibited">
          <p>Primal strictly prohibits retaliation against any person who submits a good-faith complaint, cooperates with an investigation, or participates in an appeal. Retaliatory conduct will result in account termination.</p>
        </Section>

        <Section num="7" title="Contact">
          <p>For questions about this policy:</p>
          <ul style={{ marginTop: '12px', paddingLeft: '20px' }}>
            <li><strong>Complaints:</strong> <a href="mailto:complaints@primalgay.com" style={{ color: '#FF6B35', textDecoration: 'underline', textUnderlineOffset: '2px' }}>complaints@primalgay.com</a></li>
            <li><strong>Appeals:</strong> <a href="mailto:appeals@primalgay.com" style={{ color: '#FF6B35', textDecoration: 'underline', textUnderlineOffset: '2px' }}>appeals@primalgay.com</a></li>
            <li><strong>General:</strong> <a href="mailto:support@primalgay.com" style={{ color: '#FF6B35', textDecoration: 'underline', textUnderlineOffset: '2px' }}>support@primalgay.com</a></li>
          </ul>
        </Section>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '40px 30px', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <a href="/terms" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '13px' }}>Terms</a>
          <a href="/privacy" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '13px' }}>Privacy</a>
          <a href="/anti-trafficking" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '13px' }}>Anti-Trafficking</a>
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

function SubHead({ children }: { children: React.ReactNode }) {
  return <p style={{ fontWeight: 600, color: 'rgba(255,255,255,0.85)', marginTop: '20px', marginBottom: '8px', fontSize: '15px' }}>{children}</p>;
}
