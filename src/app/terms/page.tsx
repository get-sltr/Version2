import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | Primal',
  description: 'Primal Terms of Service — the legal agreement governing your use of the Primal platform.',
  alternates: { canonical: '/terms' },
};

export default function TermsOfService() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#e0e0e0', fontFamily: "var(--font-dm-sans), -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif" }}>
      {/* Header */}
      <header style={{ padding: '20px 30px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'rgba(10,10,15,0.95)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', zIndex: 100 }}>
        <a href="/" style={{ fontFamily: "var(--font-orbitron), 'Orbitron', sans-serif", fontSize: '24px', fontWeight: 700, letterSpacing: '0.1em', textDecoration: 'none', color: '#FF6B35' }}>PRIMAL</a>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <a href="/privacy" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', textDecoration: 'none', padding: '10px', minHeight: '44px', display: 'inline-flex', alignItems: 'center' }}>Privacy</a>
          <a href="/guidelines" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', textDecoration: 'none', padding: '10px', minHeight: '44px', display: 'inline-flex', alignItems: 'center' }}>Guidelines</a>
          <a href="/" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', textDecoration: 'none', padding: '10px', minHeight: '44px', display: 'inline-flex', alignItems: 'center' }}>Home</a>
        </div>
      </header>

      {/* Hero */}
      <div style={{ position: 'relative', padding: '80px 30px 60px', textAlign: 'center' }}>
        <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translateX(-50%)', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(255,107,53,0.06) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none' }} />
        <p style={{ fontSize: '11px', letterSpacing: '0.4em', textTransform: 'uppercase', color: '#FF6B35', marginBottom: '16px', fontWeight: 500, position: 'relative' }}>Legal</p>
        <h1 style={{ fontFamily: "var(--font-orbitron), 'Orbitron', sans-serif", fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 600, marginBottom: '12px', color: '#fff', position: 'relative' }}>Terms of Service</h1>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '14px', position: 'relative' }}>Effective Date: February 16, 2026 &middot; SLTR Digital LLC</p>
      </div>

      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '0 30px 80px' }}>
        {/* Important Notice */}
        <div style={{ background: 'rgba(255,107,53,0.06)', border: '1px solid rgba(255,107,53,0.2)', padding: '28px', marginBottom: '50px', borderRadius: '12px' }}>
          <h3 style={{ marginBottom: '12px', fontSize: '15px', fontWeight: 600, color: '#FF6B35', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Important Notice</h3>
          <p style={{ lineHeight: 1.8, color: 'rgba(255,255,255,0.7)', fontSize: '15px' }}>These Terms of Service contain a mandatory binding arbitration clause and class action waiver in Section 14. By creating an account or using the Service, you agree to resolve disputes individually through binding arbitration rather than in court. Please read these Terms carefully before using Primal.</p>
        </div>

        <Section num="1" title="Agreement to Terms">
          <p>These Terms of Service (&quot;Terms&quot;) constitute a legally binding agreement between you (&quot;you&quot; or &quot;User&quot;) and SLTR Digital LLC, a California limited liability company doing business as Primal (&quot;Primal,&quot; &quot;Company,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;), governing your access to and use of the Primal mobile application, website, and all related services (collectively, the &quot;Service&quot;).</p>
          <p>By creating an account, accessing, or otherwise using the Service, you represent and warrant that you have read, understood, and agree to be bound by these Terms and our <a href="/privacy" style={{ color: '#FF6B35', textDecoration: 'underline', textUnderlineOffset: '2px' }}>Privacy Policy</a>, which is incorporated herein by reference. If you do not agree to these Terms, you must not access or use the Service.</p>
        </Section>

        <Section num="2" title="Eligibility">
          <SubHead>2.1 Age Requirement</SubHead>
          <p>You must be at least eighteen (18) years of age on the date you create your account. The Service is intended exclusively for adults. We do not permit users under the age of 18 under any circumstances. Any account determined to belong to an individual under 18 will be immediately terminated and all associated data permanently deleted.</p>

          <SubHead>2.2 Legal Capacity</SubHead>
          <p>By using the Service, you represent and warrant that: (a) you have the legal capacity to enter into a binding agreement; (b) you are not a person barred from using the Service under the laws of the United States or any other applicable jurisdiction; (c) you have never been convicted of a felony or indictable offense (or crime of similar severity), a sex crime, or any crime involving violence or threat of violence; and (d) you are not required to register as a sex offender with any state, federal, or local registry.</p>

          <SubHead>2.3 Account Responsibility</SubHead>
          <p>You are solely responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account. You agree to notify us immediately at support@primalgay.com if you suspect any unauthorized access to or use of your account.</p>
        </Section>

        <Section num="3" title="License & Acceptable Use">
          <p>Subject to your compliance with these Terms, we grant you a limited, non-exclusive, non-transferable, non-sublicensable, revocable license to access and use the Service for your personal, non-commercial purposes. This license does not include the right to: (a) modify, copy, or create derivative works of the Service; (b) reverse engineer, decompile, or disassemble any aspect of the Service; (c) access the Service to build a competing product or service; or (d) use the Service for any purpose other than its intended use.</p>
        </Section>

        <Section num="4" title="Prohibited Conduct">
          <p>You agree that you will not, and will not assist or enable others to:</p>
          <ul style={{ marginTop: '12px', paddingLeft: '20px' }}>
            <li>Harass, stalk, threaten, intimidate, or bully any user</li>
            <li>Post or transmit hate speech, discriminatory content, slurs, or content that promotes violence against any individual or group</li>
            <li>Create, share, or solicit sexual content involving minors, or any non-consensual intimate imagery</li>
            <li>Engage in fraud, impersonation, catfishing, or misrepresentation of your identity</li>
            <li>Send unsolicited commercial messages, spam, or chain communications</li>
            <li>Solicit, promote, or reference illegal drugs or controlled substances</li>
            <li>Deploy bots, scrapers, crawlers, or other automated tools to access the Service</li>
            <li>Attempt to probe, scan, test, or breach the security of the Service or its infrastructure</li>
            <li>Interfere with or disrupt the integrity, performance, or availability of the Service</li>
            <li>Circumvent or disable any security, rate-limiting, or content-filtering measures</li>
            <li>Use the Service for any unlawful purpose or in violation of any applicable local, state, national, or international law or regulation</li>
            <li>Violate the intellectual property rights of Primal, its users, or any third party</li>
          </ul>
          <p style={{ marginTop: '16px' }}>Violation of this section may result in immediate account suspension or termination, at our sole discretion, with or without prior notice.</p>
        </Section>

        <Section num="5" title="User Content & Intellectual Property">
          <SubHead>5.1 Your Content</SubHead>
          <p>You retain all ownership rights in content you create and post through the Service (&quot;User Content&quot;). By posting User Content, you grant Primal a worldwide, non-exclusive, royalty-free, sublicensable, and transferable license to use, reproduce, modify, adapt, publish, translate, distribute, and display such content solely for the purposes of operating, developing, and improving the Service.</p>

          <SubHead>5.2 Content Representations</SubHead>
          <p>You represent and warrant that: (a) you own or have the necessary rights, licenses, and permissions to post all User Content; (b) your User Content does not infringe, misappropriate, or violate any third-party intellectual property rights, rights of privacy or publicity, or other proprietary rights; and (c) your User Content complies with these Terms and all applicable laws.</p>

          <SubHead>5.3 Primal Intellectual Property</SubHead>
          <p>The Service, including its design, features, content, trademarks, logos, and all underlying technology, is the exclusive property of SLTR Digital LLC and is protected by copyright, trademark, patent, trade secret, and other intellectual property laws. Nothing in these Terms grants you any right, title, or interest in the Service beyond the limited license described in Section 3.</p>
        </Section>

        <Section num="6" title="Content Moderation & Automated Scanning">
          <SubHead>6.1 Automated Photo Analysis</SubHead>
          <p>Public profile photographs are automatically analyzed for explicit content using on-device machine learning prior to upload. Photographs that violate our content policies are blocked from publication. By uploading photographs, you consent to this automated content moderation, which is required to maintain platform safety and comply with applicable app store policies.</p>

          <SubHead>6.2 Permitted Content</SubHead>
          <p>Shirtless, swimwear, fitness, and similar photographs are permitted on public profiles. Only photographs containing explicit nudity or sexual content are blocked from public display.</p>

          <SubHead>6.3 Private Content</SubHead>
          <p>Photographs shared in private albums and direct messages between consenting adult users are not subject to automated scanning. Users are responsible for ensuring that privately shared content complies with applicable laws and is shared with the recipient&apos;s consent.</p>

          <SubHead>6.4 Right to Remove</SubHead>
          <p>We reserve the right to remove any content that, in our sole judgment, violates these Terms, our Community Guidelines, or applicable law, with or without notice.</p>

          <SubHead>6.5 Appeals</SubHead>
          <p>If you believe content was incorrectly moderated, you may submit an appeal to support@primalgay.com. We will review appeals within a commercially reasonable timeframe.</p>
        </Section>

        <Section num="7" title="Subscriptions & Payments">
          <SubHead>7.1 In-App Purchases</SubHead>
          <p>Certain premium features of the Service are available through paid subscription plans. Subscriptions are processed exclusively through the Apple App Store or Google Play Store (collectively, &quot;App Stores&quot;). All pricing, billing, and payment processing are governed by the applicable App Store&apos;s terms and conditions.</p>

          <SubHead>7.2 Auto-Renewal</SubHead>
          <p>Subscriptions automatically renew at the end of each billing period unless you cancel at least twenty-four (24) hours before the end of the current period. Renewal charges are processed by the applicable App Store at the subscription rate in effect at the time of renewal.</p>

          <SubHead>7.3 Cancellation & Refunds</SubHead>
          <p>You may cancel your subscription at any time through your device&apos;s subscription management settings:</p>
          <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
            <li><strong>iOS:</strong> Settings &rarr; [Your Name] &rarr; Subscriptions &rarr; Primal</li>
            <li><strong>Android:</strong> Google Play &rarr; Menu &rarr; Subscriptions &rarr; Primal</li>
          </ul>
          <p style={{ marginTop: '12px' }}>Cancellation takes effect at the end of the current billing period. No prorated refunds are provided for partial periods. Refund requests must be submitted directly to Apple or Google, as they control all payment processing. Primal does not have access to your payment information and cannot process refunds directly.</p>

          <SubHead>7.4 Price Changes</SubHead>
          <p>We reserve the right to modify subscription pricing. You will be notified in advance of any price change in accordance with applicable App Store policies. Price changes will apply to subsequent billing periods following the notice.</p>
        </Section>

        <Section num="8" title="Account Suspension & Termination">
          <SubHead>8.1 Termination by You</SubHead>
          <p>You may delete your account at any time via Settings &rarr; Delete Account. Upon initiating deletion, you will have a twenty-four (24) hour grace period during which you may cancel the deletion by logging back in. After the grace period expires, your account and all associated personal data will be permanently and irreversibly deleted. Active subscriptions are not automatically canceled upon account deletion — you must cancel separately through the applicable App Store.</p>

          <SubHead>8.2 Termination by Primal</SubHead>
          <p>We reserve the right to suspend or terminate your account, or restrict your access to all or any part of the Service, at any time, with or without cause, with or without notice, effective immediately. Grounds for termination include, but are not limited to: violation of these Terms, conduct that we determine is harmful to other users or the integrity of the Service, or extended periods of inactivity.</p>

          <SubHead>8.3 Effect of Termination</SubHead>
          <p>Upon termination, your right to access and use the Service will immediately cease. Sections that by their nature should survive termination (including but not limited to Sections 5, 9, 10, 11, 14, and 15) will survive.</p>
        </Section>

        <Section num="9" title="Disclaimers">
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '24px' }}>
            <p style={{ textTransform: 'uppercase', fontSize: '13px', letterSpacing: '0.03em' }}>THE SERVICE IS PROVIDED ON AN &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT. PRIMAL DOES NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE, ERROR-FREE, OR FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS.</p>
            <p style={{ marginTop: '16px', textTransform: 'uppercase', fontSize: '13px', letterSpacing: '0.03em' }}>PRIMAL DOES NOT SCREEN, VET, OR CONDUCT BACKGROUND CHECKS ON ITS USERS. WE MAKE NO REPRESENTATIONS OR WARRANTIES REGARDING THE CONDUCT, IDENTITY, INTENTIONS, LEGITIMACY, OR VERACITY OF ANY USER. YOU ARE SOLELY RESPONSIBLE FOR YOUR INTERACTIONS WITH OTHER USERS. EXERCISE CAUTION AND GOOD JUDGMENT WHEN COMMUNICATING WITH OR MEETING OTHER USERS.</p>
          </div>
        </Section>

        <Section num="10" title="Limitation of Liability">
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '24px' }}>
            <p style={{ textTransform: 'uppercase', fontSize: '13px', letterSpacing: '0.03em' }}>TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL PRIMAL, ITS AFFILIATES, DIRECTORS, OFFICERS, EMPLOYEES, AGENTS, OR LICENSORS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO DAMAGES FOR LOSS OF PROFITS, GOODWILL, USE, DATA, OR OTHER INTANGIBLE LOSSES, ARISING OUT OF OR IN CONNECTION WITH YOUR ACCESS TO OR USE OF (OR INABILITY TO ACCESS OR USE) THE SERVICE, WHETHER BASED ON WARRANTY, CONTRACT, TORT (INCLUDING NEGLIGENCE), STATUTE, OR ANY OTHER LEGAL THEORY.</p>
            <p style={{ marginTop: '16px', textTransform: 'uppercase', fontSize: '13px', letterSpacing: '0.03em' }}>OUR TOTAL AGGREGATE LIABILITY TO YOU FOR ALL CLAIMS ARISING FROM OR RELATING TO THE SERVICE SHALL NOT EXCEED THE GREATER OF: (A) THE AMOUNT YOU PAID TO PRIMAL IN THE TWELVE (12) MONTHS PRECEDING THE EVENT GIVING RISE TO THE CLAIM, OR (B) ONE HUNDRED U.S. DOLLARS ($100.00).</p>
          </div>
        </Section>

        <Section num="11" title="Indemnification">
          <p>You agree to indemnify, defend, and hold harmless Primal, its affiliates, and their respective officers, directors, employees, agents, and licensors from and against any and all claims, liabilities, damages, losses, costs, and expenses (including reasonable attorneys&apos; fees) arising out of or in any way connected with: (a) your access to or use of the Service; (b) your User Content; (c) your violation of these Terms; (d) your violation of any rights of another person or entity; or (e) your violation of any applicable law, rule, or regulation.</p>
        </Section>

        <Section num="12" title="DMCA & Copyright Notices">
          <p>If you believe that content on the Service infringes your copyright, please submit a notice to our designated Copyright Agent at legal@primalgay.com containing: (a) identification of the copyrighted work claimed to be infringed; (b) identification of the infringing material and its location on the Service; (c) your contact information; (d) a statement of good-faith belief that the use is not authorized; and (e) a statement, under penalty of perjury, that the information is accurate and you are authorized to act on behalf of the copyright owner.</p>
        </Section>

        <Section num="13" title="Third-Party Services & Links">
          <p>The Service may contain links to or integrations with third-party websites, services, or applications that are not owned or controlled by Primal. We are not responsible for the content, privacy policies, or practices of any third-party services. Your use of third-party services is at your own risk and subject to such third parties&apos; terms and conditions.</p>
        </Section>

        <Section num="14" title="Dispute Resolution & Arbitration">
          <SubHead>14.1 Informal Resolution</SubHead>
          <p>Before initiating any formal dispute resolution proceeding, you agree to first contact us at legal@primalgay.com to attempt to resolve the dispute informally. We will attempt to resolve the dispute within sixty (60) days of receipt of your notice.</p>

          <SubHead>14.2 Binding Arbitration</SubHead>
          <p>If a dispute cannot be resolved informally, you and Primal agree that any dispute, claim, or controversy arising out of or relating to these Terms or the Service shall be resolved exclusively through final and binding individual arbitration administered by JAMS under its Streamlined Arbitration Rules and Procedures. The arbitration shall be conducted in Los Angeles County, California, or at another mutually agreed location, before a single arbitrator.</p>

          <SubHead>14.3 Class Action Waiver</SubHead>
          <div style={{ background: 'rgba(255,107,53,0.06)', borderLeft: '3px solid #FF6B35', padding: '16px 20px', borderRadius: '0 8px 8px 0', margin: '12px 0' }}>
            <p style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>YOU AND PRIMAL AGREE THAT EACH MAY BRING CLAIMS AGAINST THE OTHER ONLY IN YOUR OR ITS INDIVIDUAL CAPACITY AND NOT AS A PLAINTIFF OR CLASS MEMBER IN ANY PURPORTED CLASS, COLLECTIVE, CONSOLIDATED, OR REPRESENTATIVE PROCEEDING.</p>
          </div>

          <SubHead>14.4 Opt-Out Right</SubHead>
          <p>You may opt out of this arbitration provision by sending written notice to legal@primalgay.com with the subject line &quot;Arbitration Opt-Out&quot; within thirty (30) days of creating your account. Your notice must include your name, email address associated with your account, and a clear statement that you wish to opt out of the arbitration agreement.</p>

          <SubHead>14.5 Exceptions</SubHead>
          <p>Nothing in this section shall prevent either party from seeking injunctive or other equitable relief in court for claims related to intellectual property infringement or unauthorized access to the Service.</p>
        </Section>

        <Section num="15" title="Governing Law & Jurisdiction">
          <p>These Terms shall be governed by and construed in accordance with the laws of the State of California, United States, without regard to its conflict of law principles. To the extent that litigation is permitted under these Terms, you and Primal consent to the exclusive jurisdiction of the state and federal courts located in Los Angeles County, California.</p>
        </Section>

        <Section num="16" title="General Provisions">
          <SubHead>16.1 Entire Agreement</SubHead>
          <p>These Terms, together with the Privacy Policy and Community Guidelines, constitute the entire agreement between you and Primal regarding the Service and supersede all prior agreements, representations, and understandings.</p>

          <SubHead>16.2 Severability</SubHead>
          <p>If any provision of these Terms is held to be invalid, illegal, or unenforceable by a court of competent jurisdiction, such provision shall be modified to the minimum extent necessary to make it enforceable, and the remaining provisions shall continue in full force and effect.</p>

          <SubHead>16.3 Waiver</SubHead>
          <p>The failure of Primal to enforce any right or provision of these Terms shall not constitute a waiver of such right or provision. Any waiver must be in writing and signed by an authorized representative of Primal.</p>

          <SubHead>16.4 Assignment</SubHead>
          <p>You may not assign or transfer these Terms or your rights hereunder without our prior written consent. Primal may assign these Terms without restriction in connection with a merger, acquisition, corporate reorganization, or sale of all or substantially all of our assets.</p>

          <SubHead>16.5 Force Majeure</SubHead>
          <p>Primal shall not be liable for any failure or delay in performing its obligations under these Terms due to causes beyond its reasonable control, including but not limited to acts of God, natural disasters, war, terrorism, pandemic, government action, power failures, or internet disruptions.</p>

          <SubHead>16.6 Notices</SubHead>
          <p>We may provide notices to you via email to the address associated with your account, through in-app notifications, or by posting on the Service. You may provide notices to us at the addresses listed in Section 17.</p>
        </Section>

        <Section num="17" title="Modifications to Terms">
          <p>We reserve the right to modify these Terms at any time. We will provide notice of material changes by email or through a prominent notice within the Service at least fifteen (15) days prior to the effective date of such changes. Your continued use of the Service after the effective date constitutes your acceptance of the modified Terms. If you do not agree to the modified Terms, you must discontinue use of the Service and delete your account.</p>
        </Section>

        <Section num="18" title="Contact Information">
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '24px', marginTop: '8px' }}>
            <p><strong>General Support:</strong> support@primalgay.com</p>
            <p><strong>Legal Department:</strong> legal@primalgay.com</p>
            <p><strong>Safety & Abuse:</strong> safety@primalgay.com</p>
            <p style={{ marginTop: '16px' }}><strong>SLTR Digital LLC</strong></p>
            <p>Los Angeles, California, United States</p>
          </div>
        </Section>
      </main>

      {/* Footer */}
      <footer style={{ padding: '40px 30px', borderTop: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <a href="/privacy" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '13px' }}>Privacy Policy</a>
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
