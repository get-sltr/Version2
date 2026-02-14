'use client';

export default function CommunityGuidelines() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#e0e0e0', fontFamily: "var(--font-dm-sans), -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif" }}>
      <header style={{ padding: '30px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <a href="/" style={{ fontFamily: "var(--font-orbitron), 'Orbitron', sans-serif", fontSize: '28px', fontWeight: 700, letterSpacing: '0.1em', textDecoration: 'none', color: '#FF6B35' }}>PRIMAL MEN</a>
        <a href="/" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', textDecoration: 'none', padding: '10px', minHeight: '44px', display: 'inline-flex', alignItems: 'center' }}>← Back to Home</a>
      </header>
      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 30px' }}>
        <h1 style={{ fontFamily: "var(--font-orbitron), 'Orbitron', sans-serif", fontSize: '36px', fontWeight: 600, marginBottom: '10px', color: '#fff' }}>Community Guidelines</h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: '40px', fontSize: '14px' }}>Last updated: February 2026</p>
        <div style={{ background: 'rgba(255,107,53,0.08)', padding: '25px', marginBottom: '50px', borderLeft: '4px solid #FF6B35', borderRadius: '0 8px 8px 0' }}>
          <p style={{ lineHeight: 1.7, color: 'rgba(255,255,255,0.8)' }}>Primal Men is a safe, inclusive space for the LGBTQ+ community to connect authentically. These guidelines help us maintain a positive environment for everyone.</p>
        </div>
        <Section title="Core Values">
          <p><strong>Respect:</strong> Treat everyone with kindness and dignity, regardless of their identity, appearance, or preferences.</p>
          <p><strong>Consent:</strong> All interactions must be consensual. No means no. Respect boundaries.</p>
          <p><strong>Inclusivity:</strong> We celebrate diversity in all forms—race, gender identity, body type, HIV status, and more.</p>
          <p><strong>Safety:</strong> Your wellbeing is our priority. Report anyone who makes you feel unsafe.</p>
        </Section>
        <Section title="Age Requirement">
          <p><strong>Primal Men is strictly 18+ only.</strong> We verify ages and immediately remove accounts that violate this requirement. If you encounter someone you believe is underage, report them immediately.</p>
        </Section>
        <Section title="Zero Tolerance Policy">
          <p>The following will result in immediate account termination:</p>
          <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
            <li>Harassment, stalking, or threatening behavior</li>
            <li>Hate speech, homophobia, transphobia, racism, or discrimination</li>
            <li>Non-consensual sharing of intimate content ("revenge porn")</li>
            <li>Impersonation, catfishing, or using someone else's photos</li>
            <li>Sexual exploitation of minors in any form</li>
            <li>Solicitation, promotion, or references to illegal drugs or controlled substances</li>
            <li>Scams, fraud, or attempts to deceive users</li>
            <li>Content depicting or promoting violence, gore, horror, or imagery intended to shock, frighten, or disturb</li>
          </ul>
        </Section>
        <Section title="Drug & Substance Policy">
          <p><strong>Primal Men has zero tolerance for drug-related content.</strong> This includes but is not limited to:</p>
          <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
            <li>References to illegal drugs or controlled substances in profiles, bios, or messages</li>
            <li>Using coded language, emojis, or symbols to solicit or promote drug use</li>
            <li>Sharing photos or content depicting drug use or paraphernalia</li>
            <li>Soliciting, buying, selling, or distributing any illegal substances</li>
          </ul>
          <p style={{ marginTop: '15px' }}>Accounts found violating this policy will be permanently banned without warning. We actively monitor for this content and cooperate with law enforcement when required.</p>
        </Section>
        <Section title="Harmful & Disturbing Content">
          <p><strong>Primal Men does not tolerate content designed to frighten, shock, or disturb.</strong> This includes:</p>
          <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
            <li>Graphic violence, gore, or depictions of injury</li>
            <li>Horror imagery, jump scares, or content intended to cause fear or anxiety</li>
            <li>Threats of violence, self-harm, or harm to others</li>
            <li>Content glorifying or promoting dangerous or life-threatening behavior</li>
          </ul>
          <p style={{ marginTop: '15px' }}>If you encounter any such content, report it immediately. Our safety team takes these reports seriously and acts swiftly.</p>
        </Section>
        <Section title="Profile Guidelines">
          <p><strong>Photos:</strong> Must be of yourself. No explicit nudity in public profile photos—shirtless, swimwear, and fitness photos are allowed. Private albums may contain NSFW content but must follow consent rules.</p>
          <p><strong>Automated Scanning:</strong> Public profile photos are automatically scanned on your device for explicit content before upload. This keeps the platform safe while respecting your privacy—photos are never sent to external servers for analysis.</p>
          <p><strong>Bio:</strong> Be authentic. Don't include contact info that bypasses our messaging system.</p>
          <p><strong>Verification:</strong> Verified profiles help build trust. Consider getting verified.</p>
        </Section>
        <Section title="Messaging Etiquette">
          <p>Start conversations respectfully. Don't send unsolicited explicit content without consent. Accept rejection gracefully. One "no" or no response is a complete answer—don't persist.</p>
        </Section>
        <Section title="Meeting Safely">
          <p>When meeting someone in person:</p>
          <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
            <li>Meet in public first</li>
            <li>Tell a friend where you're going</li>
            <li>Trust your instincts—if something feels wrong, leave</li>
            <li>Don't share your exact address until you're comfortable</li>
          </ul>
        </Section>
        <Section title="Reporting & Blocking">
          <p>If someone violates these guidelines or makes you uncomfortable:</p>
          <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
            <li><strong>Block:</strong> Immediately prevents them from contacting you or seeing your profile</li>
            <li><strong>Report:</strong> Our safety team reviews all reports within 24 hours</li>
          </ul>
          <p style={{ marginTop: '15px' }}>Reports are confidential—the reported user won't know who reported them.</p>
        </Section>
        <Section title="Crisis Support">
          <p>If you or someone you know is in crisis:</p>
          <p><strong>Trevor Project:</strong> 1-866-488-7386 (LGBTQ+ youth)</p>
          <p><strong>Trans Lifeline:</strong> 1-877-565-8860</p>
          <p><strong>Crisis Text Line:</strong> Text HOME to 741741</p>
          <p><strong>National Suicide Prevention:</strong> 988</p>
        </Section>
        <Section title="Contact Us">
          <p>Questions about these guidelines? Contact us at:</p>
          <p><strong>Email:</strong> support@primalgay.com</p>
          <p><strong>Report abuse:</strong> safety@primalgay.com</p>
        </Section>
      </main>
      <footer style={{ padding: '40px 30px', borderTop: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginBottom: '20px' }}>
          <a href="/privacy" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '13px' }}>Privacy Policy</a>
          <a href="/terms" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '13px' }}>Terms of Service</a>
        </div>
        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>© 2025–2026 Primal Men. All rights reserved.</p>
      </footer>
    </div>
  );
}

function Section({ title, children }: Readonly<{ title: string; children: React.ReactNode }>) {
  return (
    <section style={{ marginBottom: '40px' }}>
      <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '15px', paddingBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}>{title}</h2>
      <div style={{ lineHeight: 1.8, color: 'rgba(255,255,255,0.7)' }}>{children}</div>
    </section>
  );
}
