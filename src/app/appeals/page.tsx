import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Appeals Policy | Primal',
  description: 'Primal Appeals Policy — how to appeal content moderation decisions, account actions, and enforcement outcomes.',
  alternates: { canonical: '/appeals' },
};

export default function AppealsPolicy() {
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
        <h1 style={{ fontFamily: "var(--font-orbitron), 'Orbitron', sans-serif", fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 600, marginBottom: '12px', color: '#fff', position: 'relative' }}>Appeals Policy</h1>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '14px', position: 'relative' }}>Effective Date: April 1, 2026 &middot; SLTR Digital LLC</p>
      </div>

      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '0 30px 80px' }}>
        {/* Intro */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '28px', marginBottom: '50px', borderRadius: '12px' }}>
          <p style={{ lineHeight: 1.8, color: 'rgba(255,255,255,0.6)', fontSize: '15px' }}>SLTR Digital LLC (&quot;Primal,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) is committed to fair, transparent, and consistent enforcement of our <a href="/terms" style={{ color: '#FF6B35', textDecoration: 'underline', textUnderlineOffset: '2px' }}>Terms of Service</a> and <a href="/guidelines" style={{ color: '#FF6B35', textDecoration: 'underline', textUnderlineOffset: '2px' }}>Community Guidelines</a>. This Appeals Policy establishes the formal procedures by which any affected user may seek review and reconsideration of an enforcement action taken against their account or content. This policy is supplementary to, and should be read in conjunction with, our <a href="/complaints" style={{ color: '#FF6B35', textDecoration: 'underline', textUnderlineOffset: '2px' }}>Complaints &amp; Content Removal Policy</a>.</p>
        </div>

        <Section num="1" title="Scope of This Policy">
          <p>This Appeals Policy applies to any enforcement action taken by Primal against a user&apos;s account or content, including but not limited to:</p>
          <ul style={{ marginTop: '12px', paddingLeft: '20px' }}>
            <li>Removal, restriction, or demotion of user-generated content (photographs, profile text, messages, or other media)</li>
            <li>Issuance of formal warnings for policy violations</li>
            <li>Temporary suspension of account access or platform privileges</li>
            <li>Permanent termination of a user account</li>
            <li>Restrictions placed on specific account features (e.g., messaging, photo uploads, visibility in search or grid)</li>
            <li>Denial of account verification or reverification</li>
            <li>Rejection of uploaded content by automated or manual moderation systems</li>
          </ul>
          <p style={{ marginTop: '16px' }}>This policy does not apply to actions taken by law enforcement agencies, court orders, or legally mandated content removals, which are governed by applicable law and are not subject to internal appeal.</p>
        </Section>

        <Section num="2" title="Right to Appeal">
          <SubHead>2.1 Entitlement</SubHead>
          <p>Any user whose account or content has been subject to an enforcement action as described in Section 1 has the right to submit one (1) appeal per enforcement action. This right exists regardless of the severity of the action taken and is afforded to all users in good standing and those whose accounts have been actioned.</p>

          <SubHead>2.2 Standing</SubHead>
          <p>Appeals may only be submitted by the account holder directly affected by the enforcement action. Appeals submitted by third parties on behalf of an account holder will not be considered unless accompanied by a notarized power of attorney or other legally sufficient authorization demonstrating the third party&apos;s authority to act on behalf of the account holder.</p>

          <SubHead>2.3 Deadline to Appeal</SubHead>
          <p>Appeals must be submitted within thirty (30) calendar days from the date on which the user was notified of the enforcement action. Appeals received after this deadline will not be reviewed unless the user demonstrates, to our reasonable satisfaction, that extraordinary circumstances prevented timely submission (e.g., documented medical emergency, incarceration, or natural disaster).</p>

          <SubHead>2.4 Preservation of Rights</SubHead>
          <p>Submission of an appeal does not constitute a waiver of any rights the user may have under applicable law, including but not limited to rights under consumer protection statutes, data protection regulations, or anti-discrimination laws. Similarly, nothing in this policy limits Primal&apos;s rights under its Terms of Service or applicable law.</p>
        </Section>

        <Section num="3" title="How to Submit an Appeal">
          <SubHead>3.1 Submission Method</SubHead>
          <p>All appeals must be submitted in writing via email to <a href="mailto:appeals@primalgay.com" style={{ color: '#FF6B35', textDecoration: 'underline', textUnderlineOffset: '2px' }}>appeals@primalgay.com</a>. Verbal appeals, appeals submitted via in-app messaging, or appeals submitted to any other Primal email address will not be accepted as formal appeals under this policy.</p>

          <SubHead>3.2 Required Information</SubHead>
          <p>A complete appeal must include all of the following:</p>
          <ol style={{ marginTop: '12px', paddingLeft: '20px' }}>
            <li style={{ marginBottom: '8px' }}><strong>Account Identification:</strong> The email address associated with your Primal account, your username, and any other identifying information sufficient to locate your account in our systems.</li>
            <li style={{ marginBottom: '8px' }}><strong>Reference Number:</strong> The complaint or enforcement reference number provided in your notification email (if applicable). If you did not receive a reference number, state the approximate date and nature of the enforcement action.</li>
            <li style={{ marginBottom: '8px' }}><strong>Grounds for Appeal:</strong> A clear, detailed written statement explaining why you believe the enforcement action was incorrect, disproportionate, or otherwise unjustified. Vague or conclusory statements (e.g., &quot;this was unfair&quot;) without supporting reasoning may be deemed insufficient.</li>
            <li style={{ marginBottom: '8px' }}><strong>Supporting Evidence:</strong> Any documents, screenshots, context, or other materials that support your position. This may include evidence that the content in question did not violate our policies, that the content was misidentified by automated systems, that relevant context was not considered in the original decision, or that procedural errors occurred.</li>
            <li style={{ marginBottom: '8px' }}><strong>Requested Remedy:</strong> A statement of the specific outcome you are seeking (e.g., content restoration, account reinstatement, removal of warning, modification of restriction).</li>
          </ol>

          <SubHead>3.3 Incomplete Appeals</SubHead>
          <p>If an appeal is materially incomplete, we will notify you within three (3) business days and provide a reasonable opportunity (not less than ten (10) business days) to supplement your submission. If supplemental information is not received within this period, the appeal will be closed as incomplete. A closed incomplete appeal may be resubmitted in full within the original thirty (30) day deadline.</p>
        </Section>

        <Section num="4" title="Acknowledgment and Processing">
          <SubHead>4.1 Acknowledgment of Receipt</SubHead>
          <p>All appeals will be acknowledged in writing within one (1) business day of receipt. The acknowledgment will include a unique appeal reference number, the name or identifier of the assigned reviewer (or review team), and the expected timeline for resolution.</p>

          <SubHead>4.2 Appeal Queue Priority</SubHead>
          <p>Appeals are processed in the order received, with the following exceptions receiving expedited review:</p>
          <ul style={{ marginTop: '12px', paddingLeft: '20px' }}>
            <li><strong>Account Termination Appeals:</strong> Appeals of permanent account terminations are prioritized due to the severity and irreversibility of the action.</li>
            <li><strong>Identity and Safety Appeals:</strong> Appeals where the user asserts that the enforcement action has created an immediate safety risk or involves identity-related claims (e.g., content flagged in error due to race, gender expression, or disability).</li>
            <li><strong>Time-Sensitive Content:</strong> Appeals involving content removal where the passage of time would render restoration meaningless.</li>
          </ul>
        </Section>

        <Section num="5" title="Review Process">
          <SubHead>5.1 Independent Review</SubHead>
          <p>Every appeal is reviewed by a member of our Trust &amp; Safety team who was not involved in the original enforcement decision. This separation ensures that the appeal receives a genuinely independent assessment, free from any bias arising from participation in the initial review. The appeal reviewer has full authority to affirm, reverse, or modify the original decision.</p>

          <SubHead>5.2 Scope of Review</SubHead>
          <p>The appeal reviewer will conduct a de novo review of the enforcement action, meaning the reviewer will evaluate the matter afresh rather than merely assessing whether the original decision was &quot;reasonable.&quot; The review will consider:</p>
          <ul style={{ marginTop: '12px', paddingLeft: '20px' }}>
            <li>The content or conduct that gave rise to the enforcement action</li>
            <li>The specific provision(s) of the Terms of Service or Community Guidelines alleged to have been violated</li>
            <li>All evidence available at the time of the original decision, plus any new evidence submitted with the appeal</li>
            <li>Whether the enforcement action was proportionate to the violation, taking into account the user&apos;s account history and the severity of the alleged conduct</li>
            <li>Whether applicable policies were correctly interpreted and consistently applied</li>
            <li>Whether automated moderation systems functioned correctly (where applicable)</li>
            <li>Any mitigating or aggravating circumstances presented by the appellant</li>
          </ul>

          <SubHead>5.3 Additional Information</SubHead>
          <p>During the review, the appeal reviewer may request additional information or clarification from the appellant. Such requests will be made in writing, and the appellant will be given not less than five (5) business days to respond. Failure to respond to a request for additional information may result in the appeal being decided on the basis of the information already available.</p>

          <SubHead>5.4 Review Timeline</SubHead>
          <p>Appeals will be resolved within five (5) business days of the date on which the appeal is deemed complete. If the complexity of the matter requires additional time, the appellant will be notified in writing of the revised timeline, which shall not exceed fifteen (15) business days from the date of the complete submission except in extraordinary circumstances.</p>
        </Section>

        <Section num="6" title="Appeal Outcomes">
          <SubHead>6.1 Possible Dispositions</SubHead>
          <p>Following review, the appeal reviewer will issue one of the following dispositions:</p>
          <ul style={{ marginTop: '12px', paddingLeft: '20px' }}>
            <li style={{ marginBottom: '10px' }}><strong>Decision Upheld:</strong> The original enforcement action is affirmed in full. The reviewer has determined that the action was appropriate, proportionate, and consistent with applicable policies.</li>
            <li style={{ marginBottom: '10px' }}><strong>Decision Reversed:</strong> The original enforcement action is overturned in its entirety. Removed content will be restored, account access will be reinstated, and any associated warnings or strikes will be expunged from the user&apos;s account record.</li>
            <li style={{ marginBottom: '10px' }}><strong>Decision Modified:</strong> The original enforcement action is adjusted. This may include reducing the severity of the action (e.g., converting a permanent termination to a temporary suspension, or converting a suspension to a warning), restoring some but not all removed content, or altering the duration or scope of a restriction.</li>
          </ul>

          <SubHead>6.2 Written Decision</SubHead>
          <p>The appellant will receive a written decision that includes: (a) a summary of the original enforcement action; (b) the grounds cited in the appeal; (c) the reviewer&apos;s findings of fact; (d) the specific policy provisions considered; (e) the disposition; and (f) the reasoning supporting the disposition. Decisions will be communicated via email to the address associated with the appellant&apos;s account.</p>

          <SubHead>6.3 Implementation</SubHead>
          <p>If the appeal results in a reversal or modification, the corresponding corrective action will be implemented within two (2) business days of the decision. Where content is to be restored, it will be restored to its original state and location on the platform to the extent technically feasible.</p>

          <SubHead>6.4 Finality of Internal Appeal</SubHead>
          <p>The decision issued following the internal appeal review constitutes Primal&apos;s final internal determination on the matter. Each enforcement action is entitled to one (1) internal appeal. Repeated or duplicative appeals concerning the same enforcement action will not be reviewed.</p>
        </Section>

        <Section num="7" title="Neutral Third-Party Arbitration">
          <SubHead>7.1 Right to External Resolution</SubHead>
          <p>If the appellant disagrees with the outcome of the internal appeal, they may request that the dispute be submitted to binding arbitration before an independent, neutral third-party arbitrator. This right exists to ensure that users have recourse to an impartial decision-maker outside of Primal&apos;s organizational structure.</p>

          <SubHead>7.2 Initiating Arbitration</SubHead>
          <p>A request for arbitration must be made in writing to <a href="mailto:appeals@primalgay.com" style={{ color: '#FF6B35', textDecoration: 'underline', textUnderlineOffset: '2px' }}>appeals@primalgay.com</a> within fourteen (14) calendar days of receiving the internal appeal decision. The request must include a copy of the internal appeal decision and a brief statement of the basis for seeking external review.</p>

          <SubHead>7.3 Arbitration Procedures</SubHead>
          <p>Arbitration will be conducted in accordance with the Consumer Arbitration Rules of the American Arbitration Association (&quot;AAA&quot;) in effect at the time of filing. The arbitration will be conducted on a documents-only basis unless either party requests, and the arbitrator grants, a telephonic or video hearing. The seat of arbitration shall be Los Angeles County, California, and the arbitration shall be governed by the Federal Arbitration Act, 9 U.S.C. &sect;&sect; 1-16.</p>

          <SubHead>7.4 Arbitrator Selection</SubHead>
          <p>The arbitrator shall be selected in accordance with the AAA&apos;s procedures. The arbitrator must be a licensed attorney with experience in internet platform disputes, content moderation, or consumer protection law.</p>

          <SubHead>7.5 Costs and Fees</SubHead>
          <p>Each party shall bear its own attorneys&apos; fees and costs, and the parties shall share equally in the arbitrator&apos;s fees and AAA administrative fees, unless the arbitrator determines that a different allocation is warranted in the interest of justice. Notwithstanding the foregoing, Primal will pay all arbitration fees in excess of $200.00 USD for individual consumers who demonstrate financial hardship.</p>

          <SubHead>7.6 Binding Decision</SubHead>
          <p>The arbitrator&apos;s decision shall be final and binding on both parties and may be entered as a judgment in any court of competent jurisdiction. The arbitrator shall have the authority to award any remedy that a court of competent jurisdiction could award, including injunctive relief, declaratory relief, and compensatory damages, but shall not award punitive damages unless expressly authorized by applicable law.</p>

          <SubHead>7.7 Confidentiality</SubHead>
          <p>All arbitration proceedings, including filings, evidence, and awards, shall be treated as confidential by both parties. Neither party shall disclose the existence or contents of the arbitration to any third party except as required by law, to enforce the arbitrator&apos;s award, or to seek legal advice.</p>
        </Section>

        <Section num="8" title="Protections for Appellants">
          <SubHead>8.1 Non-Retaliation</SubHead>
          <p>Primal strictly prohibits retaliation against any user who exercises their right to appeal in good faith. Filing an appeal will not result in additional enforcement actions, demotion in search or grid visibility, or any other adverse treatment. Retaliatory conduct by any Primal employee or contractor will be treated as a serious disciplinary matter.</p>

          <SubHead>8.2 Account Status During Appeal</SubHead>
          <p>Where an appeal concerns a temporary suspension, the suspension will generally remain in effect during the pendency of the appeal review, unless the reviewer determines, upon preliminary review, that the suspension is likely to be reversed and that maintaining it would cause disproportionate harm to the appellant. Where an appeal concerns content removal, the removed content will generally remain removed during the pendency of the review.</p>

          <SubHead>8.3 Data Preservation</SubHead>
          <p>Primal will preserve all account data, content, and associated metadata related to the enforcement action for the duration of the appeal period (thirty (30) days from notification) and, if an appeal is filed, for the duration of the appeal review and any subsequent arbitration. Data will not be permanently deleted while an appeal or arbitration is pending.</p>

          <SubHead>8.4 Privacy</SubHead>
          <p>All appeal proceedings are confidential. Information submitted in connection with an appeal will be used solely for the purpose of adjudicating the appeal and will not be disclosed to other users or third parties except as required by law or as necessary to conduct the review (e.g., consulting with the original enforcement reviewer for factual context).</p>
        </Section>

        <Section num="9" title="Limitations and Exclusions">
          <SubHead>9.1 Zero-Tolerance Violations</SubHead>
          <p>While the right to appeal is broadly afforded, enforcement actions taken in response to the following zero-tolerance violations are subject to a heightened standard of review. Reversal of such actions requires clear and convincing evidence that the original determination was erroneous:</p>
          <ul style={{ marginTop: '12px', paddingLeft: '20px' }}>
            <li>Content depicting, promoting, or facilitating child sexual abuse material (CSAM)</li>
            <li>Content depicting, promoting, or facilitating human trafficking or sexual exploitation</li>
            <li>Non-consensual intimate imagery (NCII), including content obtained through fraud, coercion, or deception</li>
            <li>Credible threats of physical violence</li>
          </ul>
          <p style={{ marginTop: '16px' }}>In such cases, account termination will remain in effect during the appeal review and will not be lifted pending the outcome.</p>

          <SubHead>9.2 Legal Process and Law Enforcement</SubHead>
          <p>Content removals or account actions taken pursuant to valid legal process (court orders, subpoenas, government takedown requests) or in compliance with mandatory reporting obligations (e.g., NCMEC reporting under 18 U.S.C. &sect; 2258A) are not subject to appeal under this policy. Users affected by such actions may seek relief through the issuing legal authority.</p>

          <SubHead>9.3 Abuse of the Appeals Process</SubHead>
          <p>Primal reserves the right to decline to process appeals that are frivolous, vexatious, or submitted in bad faith. Indicators of abuse include, but are not limited to: submission of materially false information, repeated appeals containing substantially identical arguments after a final decision has been issued, or use of the appeals process to harass Primal staff. A determination that an appeal is abusive will be made by a senior member of the Trust &amp; Safety team and communicated to the user in writing with the basis for the determination.</p>
        </Section>

        <Section num="10" title="Record-Keeping">
          <p>Primal maintains records of all appeals, including the original enforcement action, the appeal submission, all communications, the reviewer&apos;s findings, and the final disposition. These records are retained for a minimum of three (3) years from the date of the final decision, or longer if required by applicable law or regulation, or if litigation or arbitration is pending or reasonably anticipated. Records are stored securely and access is restricted to authorized Trust &amp; Safety and Legal personnel.</p>
        </Section>

        <Section num="11" title="Amendments to This Policy">
          <p>Primal reserves the right to amend this Appeals Policy at any time. Material changes will be communicated to users via email or in-app notification at least fourteen (14) days prior to taking effect. The effective date at the top of this page indicates the most recent revision. Continued use of the Service following any changes constitutes acceptance of the updated policy. Appeals that are pending at the time of a policy change will be governed by the version of this policy in effect at the time the appeal was submitted.</p>
        </Section>

        <Section num="12" title="Governing Law">
          <p>This Appeals Policy, and any disputes arising under or in connection with it, shall be governed by and construed in accordance with the laws of the State of California, without regard to its conflict of law principles. To the extent any dispute is not subject to arbitration as provided herein, the exclusive jurisdiction and venue for such dispute shall be the state and federal courts located in Los Angeles County, California.</p>
        </Section>

        <Section num="13" title="Contact Information">
          <p>For all matters related to appeals:</p>
          <ul style={{ marginTop: '12px', paddingLeft: '20px' }}>
            <li><strong>Appeals:</strong> <a href="mailto:appeals@primalgay.com" style={{ color: '#FF6B35', textDecoration: 'underline', textUnderlineOffset: '2px' }}>appeals@primalgay.com</a></li>
            <li><strong>Complaints:</strong> <a href="mailto:complaints@primalgay.com" style={{ color: '#FF6B35', textDecoration: 'underline', textUnderlineOffset: '2px' }}>complaints@primalgay.com</a></li>
            <li><strong>General Support:</strong> <a href="mailto:support@primalgay.com" style={{ color: '#FF6B35', textDecoration: 'underline', textUnderlineOffset: '2px' }}>support@primalgay.com</a></li>
            <li><strong>Legal:</strong> <a href="mailto:legal@primalgay.com" style={{ color: '#FF6B35', textDecoration: 'underline', textUnderlineOffset: '2px' }}>legal@primalgay.com</a></li>
          </ul>
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '28px', marginTop: '30px', borderRadius: '12px' }}>
            <p style={{ fontWeight: 600, color: 'rgba(255,255,255,0.85)', marginBottom: '12px' }}>Operator Information</p>
            <p>SLTR Digital LLC<br />Primal<br />Los Angeles, CA<br />United States</p>
            <p style={{ marginTop: '12px' }}>Contact: <a href="mailto:legal@primalgay.com" style={{ color: '#FF6B35', textDecoration: 'underline', textUnderlineOffset: '2px' }}>legal@primalgay.com</a></p>
          </div>
        </Section>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '40px 30px', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <a href="/terms" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '13px' }}>Terms</a>
          <a href="/privacy" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '13px' }}>Privacy</a>
          <a href="/complaints" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '13px' }}>Complaints</a>
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
