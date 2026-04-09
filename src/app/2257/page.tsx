import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '18 U.S.C. 2257 Exemption Statement | Primal',
  description: 'Primal 18 U.S.C. 2257 Record-Keeping Requirements Exemption Statement.',
  alternates: { canonical: '/2257' },
};

export default function Statement2257() {
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
        <p style={{ fontSize: '11px', letterSpacing: '0.4em', textTransform: 'uppercase', color: '#FF6B35', marginBottom: '16px', fontWeight: 500, position: 'relative' }}>Legal</p>
        <h1 style={{ fontFamily: "var(--font-orbitron), 'Orbitron', sans-serif", fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 600, marginBottom: '12px', color: '#fff', position: 'relative' }}>18 U.S.C. &sect; 2257 Exemption Statement</h1>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '14px', position: 'relative' }}>Effective Date: April 1, 2026 &middot; SLTR Digital LLC</p>
      </div>

      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '0 30px 80px' }}>
        <div style={{ lineHeight: 1.85, color: 'rgba(255,255,255,0.65)', fontSize: '15px' }}>
          <p style={{ marginBottom: '24px' }}>SLTR Digital LLC, doing business as Primal (&quot;Primal,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;), operates the website located at primalgay.com and the associated mobile application (the &quot;Service&quot;).</p>

          <p style={{ marginBottom: '24px' }}>Primal is a social networking and dating application. Primal is not a producer (primary or secondary) of any visual depiction of actual or simulated sexually explicit conduct as those terms are defined in 18 U.S.C. &sect; 2257 and 28 C.F.R. Part 75.</p>

          <p style={{ marginBottom: '24px' }}>All content that appears on Primal is user-generated. Users upload their own photographs and other media to their own profiles and share content at their own discretion. Primal does not create, commission, produce, direct, or otherwise control the creation of any visual depiction of sexually explicit conduct.</p>

          <p style={{ marginBottom: '24px' }}>Accordingly, Primal is exempt from the record-keeping requirements of 18 U.S.C. &sect; 2257 and 28 C.F.R. Part 75 because:</p>

          <ul style={{ paddingLeft: '20px', marginBottom: '24px' }}>
            <li style={{ marginBottom: '12px' }}>Primal does not produce any content, whether actual or simulated sexually explicit conduct.</li>
            <li style={{ marginBottom: '12px' }}>All visual content on the platform is uploaded by individual users who are solely responsible for the content they post.</li>
            <li style={{ marginBottom: '12px' }}>All users must verify that they are at least 18 years of age before creating an account or accessing the Service. Age verification is required at registration and is enforced through a mandatory date-of-birth check as well as an 18+ age confirmation gate presented upon first visit.</li>
            <li style={{ marginBottom: '12px' }}>Primal does not host, store, or distribute content that meets the definition of &quot;actual sexually explicit conduct&quot; on public profiles. Automated content moderation systems scan public profile photographs and block explicit material before publication.</li>
          </ul>

          <p style={{ marginBottom: '24px' }}>Notwithstanding this exemption, Primal is committed to preventing the exploitation of minors and maintains robust content moderation, age verification, and reporting mechanisms as described in our <a href="/terms" style={{ color: '#FF6B35', textDecoration: 'underline', textUnderlineOffset: '2px' }}>Terms of Service</a>, <a href="/guidelines" style={{ color: '#FF6B35', textDecoration: 'underline', textUnderlineOffset: '2px' }}>Community Guidelines</a>, and <a href="/anti-trafficking" style={{ color: '#FF6B35', textDecoration: 'underline', textUnderlineOffset: '2px' }}>Anti-Human Trafficking Policy</a>.</p>

          <p style={{ marginBottom: '24px' }}>Any user who encounters content that they believe depicts minors or non-consensual sexually explicit material should report it immediately through the in-app reporting feature or by contacting <a href="mailto:safety@primalgay.com" style={{ color: '#FF6B35', textDecoration: 'underline', textUnderlineOffset: '2px' }}>safety@primalgay.com</a>. All such reports are immediately reviewed and, where appropriate, referred to the National Center for Missing &amp; Exploited Children (NCMEC) and law enforcement.</p>

          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '28px', marginTop: '40px', borderRadius: '12px' }}>
            <p style={{ fontWeight: 600, color: 'rgba(255,255,255,0.85)', marginBottom: '12px' }}>Operator Information</p>
            <p>SLTR Digital LLC<br />Primal<br />Los Angeles, CA<br />United States</p>
            <p style={{ marginTop: '12px' }}>Contact: <a href="mailto:legal@primalgay.com" style={{ color: '#FF6B35', textDecoration: 'underline', textUnderlineOffset: '2px' }}>legal@primalgay.com</a></p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '40px 30px', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <a href="/terms" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '13px' }}>Terms</a>
          <a href="/privacy" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '13px' }}>Privacy</a>
          <a href="/complaints" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '13px' }}>Complaints</a>
          <a href="/anti-trafficking" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '13px' }}>Anti-Trafficking</a>
          <a href="/" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '13px' }}>Home</a>
        </div>
        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)' }}>&copy; 2025&ndash;2026 SLTR Digital LLC. All rights reserved.</p>
      </footer>
    </div>
  );
}
