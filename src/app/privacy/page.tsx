import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Primal',
  description: 'Primal Privacy Policy — how we collect, use, and protect your personal information.',
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPolicy() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#e0e0e0', fontFamily: "var(--font-dm-sans), -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif" }}>
      {/* Header */}
      <header style={{ padding: '20px 30px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'rgba(10,10,15,0.95)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', zIndex: 100 }}>
        <a href="/" style={{ fontFamily: "var(--font-orbitron), 'Orbitron', sans-serif", fontSize: '24px', fontWeight: 700, letterSpacing: '0.1em', textDecoration: 'none', color: '#FF6B35' }}>PRIMAL</a>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <a href="/terms" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', textDecoration: 'none', padding: '10px', minHeight: '44px', display: 'inline-flex', alignItems: 'center' }}>Terms</a>
          <a href="/guidelines" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', textDecoration: 'none', padding: '10px', minHeight: '44px', display: 'inline-flex', alignItems: 'center' }}>Guidelines</a>
          <a href="/" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', textDecoration: 'none', padding: '10px', minHeight: '44px', display: 'inline-flex', alignItems: 'center' }}>Home</a>
        </div>
      </header>

      {/* Hero */}
      <div style={{ position: 'relative', padding: '80px 30px 60px', textAlign: 'center' }}>
        <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translateX(-50%)', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(255,107,53,0.06) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none' }} />
        <p style={{ fontSize: '11px', letterSpacing: '0.4em', textTransform: 'uppercase', color: '#FF6B35', marginBottom: '16px', fontWeight: 500, position: 'relative' }}>Legal</p>
        <h1 style={{ fontFamily: "var(--font-orbitron), 'Orbitron', sans-serif", fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 600, marginBottom: '12px', color: '#fff', position: 'relative' }}>Privacy Policy</h1>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '14px', position: 'relative' }}>Effective Date: February 16, 2026 &middot; SLTR Digital LLC</p>
      </div>

      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '0 30px 80px' }}>
        {/* Quick Summary */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '28px', marginBottom: '50px', borderRadius: '12px' }}>
          <h3 style={{ marginBottom: '12px', fontSize: '15px', fontWeight: 600, color: '#FF6B35', letterSpacing: '0.05em', textTransform: 'uppercase' }}>At a Glance</h3>
          <p style={{ lineHeight: 1.8, color: 'rgba(255,255,255,0.6)', fontSize: '15px' }}>Primal is a location-based social networking and dating platform operated by SLTR Digital LLC. We collect the information you provide to connect you with nearby users. We never sell your personal data to third parties. You may export or delete your information at any time through the application&apos;s Settings.</p>
        </div>

        <Section num="1" title="Scope & Applicability">
          <p>This Privacy Policy (&quot;Policy&quot;) describes how SLTR Digital LLC, doing business as Primal (&quot;Primal,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;), collects, uses, discloses, and otherwise processes your personal information in connection with the Primal mobile application and website (collectively, the &quot;Service&quot;). By accessing or using the Service, you acknowledge that you have read, understood, and agree to the practices described in this Policy.</p>
          <p>This Policy applies to all users of the Service, including visitors who do not create an account. It does not apply to third-party websites, services, or applications that may be linked from within the Service.</p>
        </Section>

        <Section num="2" title="Information We Collect">
          <SubHead>2.1 Information You Provide Directly</SubHead>
          <p><strong>Account Registration:</strong> Email address, date of birth, display name, and password (hashed and salted; we never store plaintext passwords).</p>
          <p><strong>Profile Data:</strong> Photographs, biographical text, physical attributes (height, weight, body type), gender identity, sexual orientation, relationship preferences, and other optional descriptors.</p>
          <p><strong>Communications:</strong> Messages, media files, and call metadata exchanged with other users through the Service&apos;s messaging and video call features.</p>
          <p><strong>User-Generated Content:</strong> Reports, feedback, and correspondence you submit to our support team.</p>

          <SubHead>2.2 Information Collected Automatically</SubHead>
          <p><strong>Location Data:</strong> With your permission, we collect precise geolocation data from your device to enable proximity-based features. Location data is encrypted in transit and at rest. You may revoke location permissions at any time through your device settings, though this will limit core functionality.</p>
          <p><strong>Device & Usage Information:</strong> Device model, operating system version, unique device identifiers, IP address, browser type, pages and features accessed, interaction timestamps, referring URLs, and crash/diagnostic reports.</p>
          <p><strong>Cookies & Similar Technologies:</strong> We use essential cookies and local storage to maintain your session state and preferences. We do not use third-party advertising cookies.</p>

          <SubHead>2.3 Information from Third Parties</SubHead>
          <p><strong>Payment Processors:</strong> Subscription status and purchase history are received from Apple App Store and Google Play Store via our payment management partner, RevenueCat. We do not receive, process, or store your credit card number, banking details, or other payment card information.</p>
          <p><strong>Authentication Providers:</strong> If you choose to sign in with Google or Apple, we receive your name and email address as authorized by you during the OAuth flow.</p>
        </Section>

        <Section num="3" title="How We Use Your Information">
          <p>We process your personal information for the following purposes, each supported by a lawful basis under applicable data protection law:</p>
          <ul style={{ marginTop: '12px', paddingLeft: '20px' }}>
            <li><strong>Service Delivery:</strong> To create and manage your account, display your profile to other users, enable messaging and video calls, and deliver location-based functionality (Contractual Necessity).</li>
            <li><strong>Safety & Security:</strong> To detect and prevent fraud, abuse, spam, and violations of our Terms of Service, including automated content moderation (Legitimate Interest).</li>
            <li><strong>Age Verification:</strong> To verify that you meet our minimum age requirement of 18 years (Legal Obligation).</li>
            <li><strong>Payment Processing:</strong> To manage subscriptions, verify entitlements, and sync premium status (Contractual Necessity).</li>
            <li><strong>Communications:</strong> To send service-related notifications including security alerts, account updates, and transaction confirmations (Contractual Necessity).</li>
            <li><strong>Improvement & Analytics:</strong> To analyze usage patterns, diagnose technical issues, and improve the Service (Legitimate Interest).</li>
          </ul>
          <p style={{ marginTop: '16px' }}>We do not use your personal information for automated decision-making that produces legal or similarly significant effects without human oversight.</p>
        </Section>

        <Section num="4" title="Automated Content Moderation">
          <SubHead>4.1 On-Device Photo Scanning</SubHead>
          <p>When you upload a public profile photograph, the image is automatically analyzed for explicit content using on-device machine learning models. This scanning occurs entirely on your device. The photograph is not transmitted to external servers for analysis purposes.</p>

          <SubHead>4.2 Data We Log</SubHead>
          <p>We record the scan result (pass/fail), confidence scores, and timestamp for platform safety monitoring. Rejected images are not stored on our servers.</p>

          <SubHead>4.3 Scope of Scanning</SubHead>
          <p>Only public profile photographs are subject to automated scanning. Photographs in private albums and direct messages between consenting adults are exempt from automated content analysis.</p>

          <SubHead>4.4 Manual Review</SubHead>
          <p>In limited circumstances where automated scanning is unavailable or inconclusive, photographs may be flagged for review by our trained safety personnel, who are bound by strict confidentiality obligations.</p>
        </Section>

        <Section num="5" title="Information Sharing & Disclosure">
          <div style={{ background: 'rgba(255,107,53,0.06)', borderLeft: '3px solid #FF6B35', padding: '16px 20px', borderRadius: '0 8px 8px 0', marginBottom: '16px' }}>
            <p style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>We do not sell, rent, or trade your personal information to third parties for their marketing purposes.</p>
          </div>
          <p>Your public profile is visible to other authenticated users of the Service within your configured distance radius. We share personal information with the following categories of recipients solely to operate the Service:</p>
          <ul style={{ marginTop: '12px', paddingLeft: '20px' }}>
            <li><strong>Supabase, Inc.</strong> &mdash; Database hosting, authentication, and real-time infrastructure</li>
            <li><strong>RevenueCat, Inc.</strong> &mdash; Subscription lifecycle management (Apple/Google payment processing)</li>
            <li><strong>Vercel, Inc.</strong> &mdash; Application hosting and content delivery</li>
            <li><strong>OneSignal, Inc.</strong> &mdash; Push notification delivery</li>
            <li><strong>Mapbox, Inc.</strong> &mdash; Location and mapping services</li>
            <li><strong>LiveKit, Inc.</strong> &mdash; Real-time video and audio communication</li>
            <li><strong>Google LLC</strong> &mdash; Analytics (Google Analytics 4)</li>
          </ul>
          <p style={{ marginTop: '16px' }}>Each service provider is contractually obligated to process your data only as necessary to provide their services to us and in accordance with applicable data protection laws.</p>
          <p>We may also disclose your information: (a) to comply with applicable law, regulation, legal process, or governmental request; (b) to enforce our Terms of Service; (c) to protect the rights, property, or safety of Primal, our users, or the public; or (d) in connection with a merger, acquisition, or sale of all or a portion of our assets, with notice to affected users.</p>
        </Section>

        <Section num="6" title="Data Security">
          <p>We implement industry-standard technical and organizational measures to protect your personal information, including:</p>
          <ul style={{ marginTop: '12px', paddingLeft: '20px' }}>
            <li>TLS 1.3+ encryption for all data in transit</li>
            <li>AES-256 encryption for data at rest</li>
            <li>Row-level security (RLS) policies on all database tables</li>
            <li>Secure password hashing using bcrypt with per-user salt</li>
            <li>Role-based access controls limiting employee data access</li>
            <li>Regular security assessments and dependency auditing</li>
          </ul>
          <p style={{ marginTop: '16px' }}>No method of transmission or storage is 100% secure. While we strive to protect your information, we cannot guarantee absolute security. You are responsible for maintaining the confidentiality of your account credentials.</p>
        </Section>

        <Section num="7" title="Your Rights & Choices">
          <p>Depending on your jurisdiction, you may have the following rights regarding your personal information:</p>
          <ul style={{ marginTop: '12px', paddingLeft: '20px' }}>
            <li><strong>Right of Access:</strong> Request a copy of the personal data we hold about you.</li>
            <li><strong>Right to Portability:</strong> Export your data in machine-readable JSON format via Settings &rarr; Export Data.</li>
            <li><strong>Right to Rectification:</strong> Update or correct your profile information at any time.</li>
            <li><strong>Right to Erasure:</strong> Delete your account and all associated data via Settings &rarr; Delete Account. After a 24-hour grace period, deletion is permanent and irreversible.</li>
            <li><strong>Right to Restrict Processing:</strong> Request that we limit how we use your data in certain circumstances.</li>
            <li><strong>Right to Object:</strong> Object to processing based on legitimate interests.</li>
            <li><strong>Right to Withdraw Consent:</strong> Where processing is based on consent, you may withdraw it at any time.</li>
            <li><strong>Right to Opt-Out:</strong> Disable marketing and promotional communications in your notification settings.</li>
          </ul>

          <SubHead>California Residents (CCPA/CPRA)</SubHead>
          <p>If you are a California resident, you have the right to: (i) know what personal information is collected, used, and disclosed; (ii) request deletion of your personal information; (iii) opt-out of the &quot;sale&quot; or &quot;sharing&quot; of personal information (we do not sell or share your data for cross-context behavioral advertising); and (iv) non-discrimination for exercising your rights. To submit a verifiable consumer request, contact privacy@primalgay.com.</p>

          <SubHead>European Economic Area, UK & Swiss Residents (GDPR/UK GDPR)</SubHead>
          <p>If you are located in the EEA, UK, or Switzerland, the legal bases for our processing are described in Section 3. You may lodge a complaint with your local supervisory authority if you believe your rights have been violated. Our contact information for data protection inquiries is provided in Section 12.</p>
        </Section>

        <Section num="8" title="Data Retention">
          <p>We retain your personal information for as long as your account is active or as needed to provide the Service. Upon account deletion, we permanently erase your personal data within thirty (30) days, except where retention is required by applicable law, necessary for fraud prevention, or needed to resolve disputes. Anonymized or aggregated data that can no longer be associated with you may be retained indefinitely for analytical purposes.</p>
        </Section>

        <Section num="9" title="Children&apos;s Privacy">
          <p>The Service is intended solely for individuals aged 18 and older. We do not knowingly collect, solicit, or maintain personal information from anyone under the age of 18. If we become aware that a user is under 18, we will immediately terminate the account and delete all associated data. If you believe a minor is using the Service, please contact us immediately at safety@primalgay.com.</p>
        </Section>

        <Section num="10" title="International Data Transfers">
          <p>Your personal information may be transferred to and processed in the United States and other jurisdictions where our service providers operate. These countries may have data protection laws that differ from those in your jurisdiction. By using the Service, you consent to such transfers. Where required by applicable law, we implement appropriate safeguards, including Standard Contractual Clauses approved by the European Commission, to ensure an adequate level of protection for your data.</p>
        </Section>

        <Section num="11" title="Changes to This Policy">
          <p>We may update this Policy from time to time to reflect changes in our practices, technologies, legal requirements, or other factors. We will provide notice of material changes by email or through a prominent notice within the Service at least fifteen (15) days prior to the effective date. Your continued use of the Service following such notice constitutes acceptance of the revised Policy. We encourage you to review this Policy periodically.</p>
        </Section>

        <Section num="12" title="Contact Information">
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '24px', marginTop: '8px' }}>
            <p><strong>General Inquiries:</strong> support@primalgay.com</p>
            <p><strong>Privacy & Data Requests:</strong> privacy@primalgay.com</p>
            <p><strong>Legal Department:</strong> legal@primalgay.com</p>
            <p style={{ marginTop: '16px' }}><strong>SLTR Digital LLC</strong></p>
            <p>Los Angeles, California, United States</p>
            <p style={{ marginTop: '12px', fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>Please include &quot;Data Request&quot; in the subject line for data access, portability, or deletion requests. We will respond within thirty (30) days of receipt.</p>
          </div>
        </Section>
      </main>

      {/* Footer */}
      <footer style={{ padding: '40px 30px', borderTop: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <a href="/terms" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '13px' }}>Terms of Service</a>
          <a href="/guidelines" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '13px' }}>Community Guidelines</a>
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
