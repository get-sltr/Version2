import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Community Guidelines | Primal',
  description: 'Primal Community Guidelines — the standards of behavior expected of all users on the Primal platform.',
  alternates: { canonical: '/guidelines' },
};

export default function CommunityGuidelines() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#e0e0e0', fontFamily: "var(--font-dm-sans), -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif" }}>
      {/* Header */}
      <header style={{ padding: '20px 30px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'rgba(10,10,15,0.95)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', zIndex: 100 }}>
        <a href="/" style={{ fontFamily: "var(--font-orbitron), 'Orbitron', sans-serif", fontSize: '24px', fontWeight: 700, letterSpacing: '0.1em', textDecoration: 'none', color: '#FF6B35' }}>PRIMAL</a>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <a href="/privacy" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', textDecoration: 'none', padding: '10px', minHeight: '44px', display: 'inline-flex', alignItems: 'center' }}>Privacy</a>
          <a href="/terms" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', textDecoration: 'none', padding: '10px', minHeight: '44px', display: 'inline-flex', alignItems: 'center' }}>Terms</a>
          <a href="/" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', textDecoration: 'none', padding: '10px', minHeight: '44px', display: 'inline-flex', alignItems: 'center' }}>Home</a>
        </div>
      </header>

      {/* Hero */}
      <div style={{ position: 'relative', padding: '80px 30px 60px', textAlign: 'center' }}>
        <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translateX(-50%)', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(255,107,53,0.06) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none' }} />
        <p style={{ fontSize: '11px', letterSpacing: '0.4em', textTransform: 'uppercase', color: '#FF6B35', marginBottom: '16px', fontWeight: 500, position: 'relative' }}>Community</p>
        <h1 style={{ fontFamily: "var(--font-orbitron), 'Orbitron', sans-serif", fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 600, marginBottom: '12px', color: '#fff', position: 'relative' }}>Community Guidelines</h1>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '14px', position: 'relative' }}>Effective Date: February 16, 2026 &middot; SLTR Digital LLC</p>
      </div>

      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '0 30px 80px' }}>
        {/* Intro */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '28px', marginBottom: '50px', borderRadius: '12px' }}>
          <h3 style={{ marginBottom: '12px', fontSize: '15px', fontWeight: 600, color: '#FF6B35', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Our Commitment</h3>
          <p style={{ lineHeight: 1.8, color: 'rgba(255,255,255,0.6)', fontSize: '15px' }}>Primal is built for real connection. These guidelines exist to maintain a safe, respectful, and inclusive environment for every member of our community. Every user is expected to read, understand, and follow these guidelines. Violations may result in content removal, account suspension, or permanent termination.</p>
        </div>

        <Section num="1" title="Core Principles">
          <div style={{ display: 'grid', gap: '16px', marginTop: '8px' }}>
            <Principle title="Respect" text="Treat every user with dignity and kindness, regardless of their identity, appearance, background, or preferences. Respectful disagreement is welcome; personal attacks are not." />
            <Principle title="Consent" text="All interactions on Primal must be consensual. No means no. Silence is not consent. Respect stated boundaries immediately and without question." />
            <Principle title="Authenticity" text="Be yourself. Represent yourself honestly in your profile, photos, and conversations. Trust is the foundation of meaningful connection." />
            <Principle title="Inclusivity" text="We celebrate the full spectrum of the LGBTQ+ community. Discrimination based on race, ethnicity, gender identity, body type, HIV status, disability, age, or any other characteristic is not tolerated." />
            <Principle title="Safety" text="Your wellbeing and the wellbeing of every community member is our highest priority. If you feel unsafe, report it. We act on every report." />
          </div>
        </Section>

        <Section num="2" title="Age Requirement">
          <div style={{ background: 'rgba(255,107,53,0.06)', borderLeft: '3px solid #FF6B35', padding: '16px 20px', borderRadius: '0 8px 8px 0', marginBottom: '12px' }}>
            <p style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>Primal is strictly for adults aged 18 and older. There are no exceptions to this policy.</p>
          </div>
          <p>We verify ages at registration and actively monitor for underage users. Any account found to belong to an individual under 18 will be immediately and permanently terminated, and all associated data will be deleted. If you encounter someone you believe to be underage, report them immediately through the in-app reporting feature or by contacting safety@primalgay.com.</p>
        </Section>

        <Section num="3" title="Zero Tolerance Violations">
          <p>The following behaviors result in <strong style={{ color: '#FF6B35' }}>immediate and permanent account termination</strong> without prior warning:</p>
          <ul style={{ marginTop: '12px', paddingLeft: '20px' }}>
            <li><strong>Harassment & Threats:</strong> Stalking, threatening, intimidating, or systematically bullying any user, whether on or off the platform</li>
            <li><strong>Hate Speech & Discrimination:</strong> Content or behavior that promotes hatred, violence, or discrimination based on race, ethnicity, national origin, religion, gender, gender identity, sexual orientation, disability, or medical condition</li>
            <li><strong>Child Safety:</strong> Any content depicting, soliciting, or referencing the sexual exploitation of minors. We report all such content to the National Center for Missing & Exploited Children (NCMEC) and relevant law enforcement</li>
            <li><strong>Non-Consensual Intimate Imagery:</strong> Sharing, threatening to share, or soliciting intimate images of any person without their explicit consent (&quot;revenge porn&quot;)</li>
            <li><strong>Identity Fraud:</strong> Impersonation, catfishing, or using another person&apos;s photographs, identity, or likeness without authorization</li>
            <li><strong>Sexual Exploitation:</strong> Solicitation of or participation in sex trafficking, prostitution, or any form of commercial sexual exploitation</li>
            <li><strong>Scams & Fraud:</strong> Phishing, financial scams, romance scams, or any attempt to deceive users for personal or financial gain</li>
            <li><strong>Violence:</strong> Content depicting, promoting, or glorifying violence, gore, self-harm, or harm to others</li>
          </ul>
        </Section>

        <Section num="4" title="Controlled Substances Policy">
          <div style={{ background: 'rgba(255,107,53,0.06)', borderLeft: '3px solid #FF6B35', padding: '16px 20px', borderRadius: '0 8px 8px 0', marginBottom: '12px' }}>
            <p style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>Primal maintains a strict zero-tolerance policy regarding illegal drugs and controlled substances.</p>
          </div>
          <p>The following are prohibited and will result in permanent account termination:</p>
          <ul style={{ marginTop: '12px', paddingLeft: '20px' }}>
            <li>References to illegal drugs or controlled substances in profiles, bios, display names, or messages</li>
            <li>Use of coded language, slang, emojis, or symbols to solicit, promote, or reference drug use</li>
            <li>Photographs or content depicting drug use, paraphernalia, or drug-related activity</li>
            <li>Soliciting, buying, selling, distributing, or facilitating access to any illegal substance</li>
          </ul>
          <p style={{ marginTop: '16px' }}>We actively monitor for violations of this policy using both automated detection and human review. We cooperate fully with law enforcement agencies when required by law or when we believe there is an imminent threat to user safety.</p>
        </Section>

        <Section num="5" title="Profile Standards">
          <SubHead>5.1 Photographs</SubHead>
          <p>All profile photographs must be of yourself. Group photos are permitted only if you are clearly identifiable. Stock photos, celebrity images, memes, and AI-generated images are not permitted as profile photos.</p>

          <SubHead>5.2 Public Profile Content</SubHead>
          <p>Public profile photographs are automatically scanned on your device for explicit content before upload. Shirtless, swimwear, fitness, and similar photographs are permitted. Photographs containing explicit nudity or sexual content are blocked from public profiles to comply with platform safety standards and app store policies.</p>

          <SubHead>5.3 Private Content</SubHead>
          <p>Private albums and direct messages between consenting adults are not subject to automated scanning. You are responsible for ensuring that any content you share privately is shared with the recipient&apos;s informed consent and complies with applicable laws.</p>

          <SubHead>5.4 Bio & Display Name</SubHead>
          <p>Your bio and display name must not contain: contact information intended to bypass our messaging system (phone numbers, social media handles, external URLs), hate speech or discriminatory language, drug references, or solicitation for illegal activities.</p>
        </Section>

        <Section num="6" title="Communication Standards">
          <SubHead>6.1 Starting Conversations</SubHead>
          <p>Initiate conversations respectfully. A thoughtful first message goes further than a generic one. Read the other person&apos;s profile before reaching out.</p>

          <SubHead>6.2 Unsolicited Content</SubHead>
          <p>Do not send unsolicited explicit photographs or sexual content. Explicit content should only be shared after clear, mutual consent has been established in the conversation.</p>

          <SubHead>6.3 Respecting Boundaries</SubHead>
          <p>Accept rejection gracefully and immediately. One &quot;no,&quot; one non-response, or one indication of disinterest is a complete and final answer. Continued messaging after rejection constitutes harassment and will result in account action.</p>

          <SubHead>6.4 Commercial Activity</SubHead>
          <p>Primal is not a platform for commercial solicitation. Do not use the Service to promote businesses, products, services, or external platforms. Do not send spam or chain messages.</p>
        </Section>

        <Section num="7" title="Meeting in Person">
          <p>If you choose to meet someone from Primal in person, we strongly recommend the following safety precautions:</p>
          <ul style={{ marginTop: '12px', paddingLeft: '20px' }}>
            <li><strong>Meet publicly first.</strong> Choose a well-lit, populated location for your initial meeting</li>
            <li><strong>Tell someone.</strong> Share your plans, including the person&apos;s profile and your meeting location, with a trusted friend or family member</li>
            <li><strong>Arrange your own transportation.</strong> Do not depend on your date for a ride to or from the meeting</li>
            <li><strong>Protect your address.</strong> Do not share your exact home or work address until you are fully comfortable</li>
            <li><strong>Stay sober.</strong> Avoid excessive alcohol or substance use when meeting someone new</li>
            <li><strong>Trust your instincts.</strong> If something feels wrong, leave immediately. Your safety is more important than politeness</li>
            <li><strong>Verify identity.</strong> Consider using our video call feature before meeting in person to confirm the person matches their profile</li>
          </ul>
        </Section>

        <Section num="8" title="Reporting & Enforcement">
          <SubHead>8.1 How to Report</SubHead>
          <p>If a user violates these guidelines or makes you feel uncomfortable or unsafe, you have two immediate options:</p>
          <ul style={{ marginTop: '12px', paddingLeft: '20px' }}>
            <li><strong>Block:</strong> Instantly prevents the user from contacting you, viewing your profile, or appearing in your grid</li>
            <li><strong>Report:</strong> Sends the matter to our safety team for review and investigation</li>
          </ul>

          <SubHead>8.2 Confidentiality</SubHead>
          <p>All reports are treated as strictly confidential. The reported user will not be informed of who filed the report. Retaliatory behavior against users who report in good faith is itself a violation of these guidelines.</p>

          <SubHead>8.3 Review Process</SubHead>
          <p>Our safety team reviews all reports. Depending on the severity and nature of the violation, we may take one or more of the following actions: issue a warning, remove content, temporarily suspend the account, or permanently terminate the account. Decisions regarding account termination for zero-tolerance violations are final and not subject to appeal.</p>

          <SubHead>8.4 Appeals</SubHead>
          <p>If you believe your account was actioned in error, you may submit an appeal to support@primalgay.com within thirty (30) days. Appeals for zero-tolerance violations (Section 3) are not accepted.</p>
        </Section>

        <Section num="9" title="Crisis & Support Resources">
          <p>If you or someone you know is in crisis or experiencing a mental health emergency, please reach out to one of the following resources:</p>
          <div style={{ display: 'grid', gap: '12px', marginTop: '16px' }}>
            <Resource name="988 Suicide & Crisis Lifeline" detail="Call or text 988 (United States)" />
            <Resource name="The Trevor Project" detail="1-866-488-7386 — LGBTQ+ youth crisis support" />
            <Resource name="Trans Lifeline" detail="1-877-565-8860 — Support for trans and non-binary individuals" />
            <Resource name="Crisis Text Line" detail="Text HOME to 741741" />
            <Resource name="GLBT National Hotline" detail="1-888-843-4564" />
          </div>
          <p style={{ marginTop: '16px' }}>If you believe someone on Primal is in immediate danger, please contact your local emergency services (911 in the US) and report the situation to safety@primalgay.com.</p>
        </Section>

        <Section num="10" title="Contact Us">
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '24px', marginTop: '8px' }}>
            <p><strong>General Support:</strong> support@primalgay.com</p>
            <p><strong>Safety & Abuse Reports:</strong> safety@primalgay.com</p>
            <p><strong>Legal Department:</strong> legal@primalgay.com</p>
            <p style={{ marginTop: '16px' }}><strong>SLTR Digital LLC</strong></p>
            <p>Los Angeles, California, United States</p>
          </div>
        </Section>
      </main>

      {/* Footer */}
      <footer style={{ padding: '40px 30px', borderTop: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <a href="/privacy" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '13px' }}>Privacy Policy</a>
          <a href="/terms" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '13px' }}>Terms of Service</a>
          <a href="/about" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '13px' }}>About</a>
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

function Principle({ title, text }: { title: string; text: string }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '20px' }}>
      <p style={{ fontWeight: 600, color: '#FF6B35', marginBottom: '6px', fontSize: '15px' }}>{title}</p>
      <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', lineHeight: 1.7 }}>{text}</p>
    </div>
  );
}

function Resource({ name, detail }: { name: string; detail: string }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '16px 20px' }}>
      <p style={{ fontWeight: 600, color: '#fff', fontSize: '14px', marginBottom: '4px' }}>{name}</p>
      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>{detail}</p>
    </div>
  );
}
