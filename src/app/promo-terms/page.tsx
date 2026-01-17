'use client';

import Link from 'next/link';

export default function PromoTerms() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#000',
      color: '#fff',
      padding: '80px 24px',
      fontFamily: "'Cormorant Garamond', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, serif"
    }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>

        <h1 style={{ fontSize: '36px', fontWeight: 700, marginBottom: '16px' }}>
          New Year 2026 Promotion Terms & Conditions
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: '32px' }}>Effective Date: January 1, 2026</p>

        <div style={{ lineHeight: 1.8 }}>

          {/* Section 1 */}
          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '16px' }}>1. Promotion Overview</h2>
            <p style={{ color: 'rgba(255,255,255,0.7)' }}>
              SLTR Digital LLC ("SLTR," "we," "us," or "our") is offering a limited-time promotional subscription rate of $4.99 per month (the "Promotional Rate") for new subscribers who sign up between January 1, 2026, and January 31, 2026, 11:59 PM PST (the "Promotion Period").
            </p>
          </section>

          {/* Section 2 */}
          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '16px' }}>2. Eligibility</h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '12px' }}>To be eligible for this promotion, you must:</p>
            <ul style={{ paddingLeft: '24px', color: 'rgba(255,255,255,0.7)' }}>
              <li style={{ marginBottom: '8px' }}>Be a new SLTR subscriber who has never previously held a paid subscription</li>
              <li style={{ marginBottom: '8px' }}>Sign up for a monthly subscription during the Promotion Period</li>
              <li style={{ marginBottom: '8px' }}>Enable automatic recurring billing at the time of signup</li>
              <li style={{ marginBottom: '8px' }}>Provide a valid payment method and maintain it in good standing</li>
              <li style={{ marginBottom: '8px' }}>Agree to SLTR's Terms of Service and Privacy Policy</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '16px' }}>3. Lifetime Price Lock Guarantee</h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '12px' }}>
              Subscribers who enroll at the Promotional Rate of $4.99/month will maintain this rate for the lifetime of their subscription, provided that:
            </p>
            <ul style={{ paddingLeft: '24px', color: 'rgba(255,255,255,0.7)', marginBottom: '12px' }}>
              <li style={{ marginBottom: '8px' }}>The subscription remains active and is not cancelled</li>
              <li style={{ marginBottom: '8px' }}>Payments are processed successfully each billing cycle</li>
              <li style={{ marginBottom: '8px' }}>The account remains in good standing and complies with SLTR's Terms of Service</li>
              <li style={{ marginBottom: '8px' }}>Automatic recurring billing remains enabled</li>
            </ul>
            <p style={{ color: 'rgba(255,255,255,0.7)' }}>
              This rate is guaranteed to remain at $4.99/month regardless of future price increases to SLTR's standard subscription rates.
            </p>
          </section>

          {/* Section 4 */}
          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '16px' }}>4. Cancellation Policy</h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '12px' }}>
              <strong style={{ color: '#fff' }}>Loss of Promotional Rate:</strong> If you cancel your subscription at any time, you will permanently lose access to the $4.99/month Promotional Rate. Resubscribing after cancellation will be at SLTR's then-current standard subscription rate, which may be higher than the Promotional Rate.
            </p>
            <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '12px' }}>
              <strong style={{ color: '#fff' }}>No Refunds:</strong> Cancellations are effective at the end of the current billing period. You will retain access to premium features until the end of your paid period. No partial refunds will be issued for unused portions of the billing period.
            </p>
            <p style={{ color: 'rgba(255,255,255,0.7)' }}>
              <strong style={{ color: '#fff' }}>How to Cancel:</strong> You may cancel your subscription at any time through your account settings or by contacting customer support at support@primalgay.com.
            </p>
          </section>

          {/* Section 5 */}
          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '16px' }}>5. Payment Failures and Grace Period</h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '12px' }}>
              <strong style={{ color: '#fff' }}>Payment Responsibility:</strong> You are responsible for maintaining a valid, up-to-date payment method on file. Payment failures may occur due to:
            </p>
            <ul style={{ paddingLeft: '24px', color: 'rgba(255,255,255,0.7)', marginBottom: '12px' }}>
              <li style={{ marginBottom: '8px' }}>Insufficient funds</li>
              <li style={{ marginBottom: '8px' }}>Expired credit/debit card</li>
              <li style={{ marginBottom: '8px' }}>Card cancellation or replacement</li>
              <li style={{ marginBottom: '8px' }}>Payment method declination by your financial institution</li>
              <li style={{ marginBottom: '8px' }}>Technical issues preventing payment processing</li>
            </ul>
            <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '12px' }}>
              <strong style={{ color: '#fff' }}>Grace Period:</strong> If we are unable to process your payment, you will have a 7-day grace period to update your payment information and resolve the issue. During this grace period:
            </p>
            <ul style={{ paddingLeft: '24px', color: 'rgba(255,255,255,0.7)', marginBottom: '12px' }}>
              <li style={{ marginBottom: '8px' }}>You will receive email notifications regarding the payment failure</li>
              <li style={{ marginBottom: '8px' }}>Your account will remain active with full premium access</li>
              <li style={{ marginBottom: '8px' }}>You must update your payment method to retain the Promotional Rate</li>
            </ul>
            <p style={{ color: 'rgba(255,255,255,0.7)' }}>
              <strong style={{ color: '#fff' }}>Termination After Grace Period:</strong> If payment is not successfully processed within 7 days of the failed payment attempt, your subscription will be automatically cancelled and you will permanently lose access to the $4.99/month Promotional Rate.
            </p>
          </section>

          {/* Section 6 */}
          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '16px' }}>6. Account Violations</h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '12px' }}>
              The Promotional Rate may be voided and your account may be suspended or terminated if you:
            </p>
            <ul style={{ paddingLeft: '24px', color: 'rgba(255,255,255,0.7)' }}>
              <li style={{ marginBottom: '8px' }}>Violate SLTR's Terms of Service</li>
              <li style={{ marginBottom: '8px' }}>Engage in fraudulent activity or payment chargebacks</li>
              <li style={{ marginBottom: '8px' }}>Create multiple accounts to abuse the promotion</li>
              <li style={{ marginBottom: '8px' }}>Use the service for illegal, abusive, or harmful purposes</li>
              <li style={{ marginBottom: '8px' }}>Harass, threaten, or harm other users</li>
              <li style={{ marginBottom: '8px' }}>Post prohibited or inappropriate content</li>
              <li style={{ marginBottom: '8px' }}>Attempt to circumvent payment or security measures</li>
            </ul>
          </section>

          {/* Section 7 */}
          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '16px' }}>7. Recurring Billing</h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '12px' }}>
              By subscribing to this promotion, you authorize SLTR to automatically charge your payment method $4.99 plus any applicable taxes on a monthly basis until you cancel your subscription. Billing will occur on the same day each month as your initial subscription date.
            </p>
            <p style={{ color: 'rgba(255,255,255,0.7)' }}>
              You acknowledge that the amount may vary slightly due to changes in applicable sales tax, VAT, or other government-imposed fees.
            </p>
          </section>

          {/* Section 8 */}
          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '16px' }}>8. Changes to Service</h2>
            <p style={{ color: 'rgba(255,255,255,0.7)' }}>
              While your Promotional Rate of $4.99/month is locked in for life (subject to these terms), SLTR reserves the right to modify, update, or discontinue features of the service at any time. However, your pricing will remain at $4.99/month as long as your subscription remains active and in good standing.
            </p>
          </section>

          {/* Section 9 */}
          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '16px' }}>9. Non-Transferable</h2>
            <p style={{ color: 'rgba(255,255,255,0.7)' }}>
              This promotional offer is non-transferable. You may not transfer your Promotional Rate to another account, user, or email address.
            </p>
          </section>

          {/* Section 10 */}
          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '16px' }}>10. Geographic Restrictions</h2>
            <p style={{ color: 'rgba(255,255,255,0.7)' }}>
              This promotion is available to users worldwide where SLTR services are offered. Pricing is in USD. International transactions may be subject to currency conversion fees imposed by your financial institution.
            </p>
          </section>

          {/* Section 11 */}
          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '16px' }}>11. Right to Modify or Terminate Promotion</h2>
            <p style={{ color: 'rgba(255,255,255,0.7)' }}>
              SLTR reserves the right to modify, suspend, or terminate this promotion at any time without prior notice. However, users who have already enrolled at the Promotional Rate will retain their $4.99/month rate according to these terms, even if the promotion is terminated early.
            </p>
          </section>

          {/* Section 12 */}
          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '16px' }}>12. Contact Information</h2>
            <p style={{ color: 'rgba(255,255,255,0.7)' }}>
              For questions about this promotion or your subscription, please contact:
            </p>
            <div style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '12px',
              padding: '24px',
              marginTop: '16px'
            }}>
              <p style={{ fontWeight: 600, marginBottom: '8px' }}>SLTR Digital LLC</p>
              <p style={{ color: 'rgba(255,255,255,0.7)' }}>Email: support@primalgay.com</p>
              <p style={{ color: 'rgba(255,255,255,0.7)' }}>Website: https://primalgay.com</p>
            </div>
          </section>

          {/* Section 13 */}
          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '16px' }}>13. Acceptance of Terms</h2>
            <p style={{ color: 'rgba(255,255,255,0.7)' }}>
              By subscribing to SLTR at the Promotional Rate, you acknowledge that you have read, understood, and agree to be bound by these Promotion Terms & Conditions, as well as SLTR's general Terms of Service and Privacy Policy.
            </p>
          </section>

          {/* Section 14 */}
          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '16px' }}>14. Governing Law</h2>
            <p style={{ color: 'rgba(255,255,255,0.7)' }}>
              These terms shall be governed by and construed in accordance with the laws of the State of California, United States, without regard to its conflict of law provisions.
            </p>
          </section>

          {/* Footer */}
          <section style={{
            borderTop: '1px solid rgba(255,255,255,0.2)',
            paddingTop: '32px',
            marginTop: '48px'
          }}>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)' }}>
              Last Updated: January 1, 2026
            </p>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', marginTop: '8px' }}>
              © 2026 SLTR Digital LLC. All rights reserved.
            </p>
          </section>

        </div>

        {/* Back Link */}
        <div style={{ marginTop: '48px' }}>
          <Link
            href="/promo"
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              background: '#ec4899',
              color: '#fff',
              fontWeight: 500,
              borderRadius: '8px',
              textDecoration: 'none',
              transition: 'background 0.2s'
            }}
          >
            ← Back to Promotion
          </Link>
        </div>

      </div>
    </div>
  );
}
