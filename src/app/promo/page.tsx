'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function NewYearPromo() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleGetStarted = async () => {
    setLoading(true);
    // Redirect to premium page with the launch_special pre-selected
    router.push('/premium?plan=launch_special');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom, #581c87, #831843, #000)',
      color: '#fff',
      fontFamily: "'Cormorant Garamond', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, serif"
    }}>

      {/* Hero Section */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '80px 24px 64px', textAlign: 'center' }}>

        {/* Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 16px',
          background: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '9999px',
          marginBottom: '24px'
        }}>
          <span style={{ fontSize: '16px' }}>✨</span>
          <span style={{ fontSize: '14px', fontWeight: 500 }}>New Year 2026 Launch Special</span>
        </div>

        {/* Main Headline */}
        <h1 style={{
          fontSize: 'clamp(36px, 8vw, 60px)',
          fontWeight: 700,
          marginBottom: '24px',
          letterSpacing: '-0.02em',
          lineHeight: 1.1
        }}>
          Lock In{' '}
          <span style={{
            background: 'linear-gradient(to right, #f472b6, #a855f7)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>$4.99/month</span>
          <br />Forever
        </h1>

        {/* Subheadline */}
        <p style={{
          fontSize: '20px',
          color: 'rgba(255,255,255,0.7)',
          marginBottom: '16px',
          maxWidth: '600px',
          margin: '0 auto 16px'
        }}>
          Join Primal during our New Year launch and pay just $4.99/month—locked in for life.
        </p>

        {/* Urgency */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          color: '#facc15',
          marginBottom: '32px'
        }}>
          <span style={{ fontSize: '18px' }}>⏰</span>
          <span style={{ fontSize: '14px', fontWeight: 500 }}>Limited time offer • Ends January 31, 2026</span>
        </div>

        {/* Pricing Box */}
        <div style={{
          maxWidth: '400px',
          margin: '0 auto 32px',
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '24px',
          padding: '32px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '24px'
          }}>
            <span style={{ fontSize: '48px', fontWeight: 700 }}>$4.99</span>
            <span style={{ color: 'rgba(255,255,255,0.5)' }}>/month</span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '24px',
            color: '#4ade80'
          }}>
            <span style={{ fontSize: '18px' }}>🔒</span>
            <span style={{ fontWeight: 600 }}>Price locked forever</span>
          </div>

          <ul style={{ marginBottom: '32px', textAlign: 'left' }}>
            {[
              'Unlimited matches & messages',
              'Advanced filters & preferences',
              'See who viewed your profile',
              'Ad-free experience',
              'Priority customer support'
            ].map((feature, i) => (
              <li key={i} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                marginBottom: '12px'
              }}>
                <span style={{ color: '#f472b6', flexShrink: 0, marginTop: '2px' }}>✓</span>
                <span style={{ color: 'rgba(255,255,255,0.7)' }}>{feature}</span>
              </li>
            ))}
          </ul>

          <button
            onClick={handleGetStarted}
            disabled={loading}
            style={{
              width: '100%',
              padding: '16px',
              background: 'linear-gradient(to right, #ec4899, #a855f7)',
              color: '#fff',
              fontWeight: 700,
              fontSize: '16px',
              border: 'none',
              borderRadius: '12px',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 10px 40px rgba(236,72,153,0.4)',
              transition: 'all 0.2s',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Loading...' : 'Lock In $4.99/Month Forever'}
          </button>

          <p style={{
            fontSize: '12px',
            color: 'rgba(255,255,255,0.4)',
            marginTop: '16px'
          }}>
            Regular price: $9.99/month after promotion ends
          </p>
        </div>

        {/* Social Proof */}
        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)' }}>
          Join thousands of LGBTQ+ singles finding authentic connections
        </p>
      </div>

      {/* How It Works */}
      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
        padding: '64px 24px',
        borderTop: '1px solid rgba(255,255,255,0.1)'
      }}>
        <h2 style={{ fontSize: '28px', fontWeight: 700, textAlign: 'center', marginBottom: '48px' }}>
          How It Works
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '32px'
        }}>
          {[
            { num: '1', title: 'Sign Up Now', desc: 'Create your account before January 31, 2026', color: '#ec4899' },
            { num: '2', title: 'Subscribe at $4.99', desc: 'Enable auto-renewal to lock in your rate', color: '#a855f7' },
            { num: '3', title: 'Enjoy Forever', desc: 'Keep $4.99/month rate for as long as you stay subscribed', color: '#22c55e' }
          ].map((step, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: `${step.color}33`,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <span style={{ fontSize: '20px', fontWeight: 700, color: step.color }}>{step.num}</span>
              </div>
              <h3 style={{ fontWeight: 600, marginBottom: '8px' }}>{step.title}</h3>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)' }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Terms Preview */}
      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
        padding: '64px 24px',
        borderTop: '1px solid rgba(255,255,255,0.1)'
      }}>
        <h2 style={{ fontSize: '24px', fontWeight: 700, textAlign: 'center', marginBottom: '32px' }}>
          Important Information
        </h2>

        <div style={{
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '16px',
          padding: '24px',
          fontSize: '14px',
          color: 'rgba(255,255,255,0.7)'
        }}>
          <p style={{ marginBottom: '16px' }}>
            <strong style={{ color: '#fff' }}>Lifetime Price Lock Guarantee:</strong> By subscribing to Primal at $4.99/month during this New Year promotion, you lock in this rate for the lifetime of your subscription, as long as your subscription remains active and in good standing.
          </p>

          <p style={{ marginBottom: '16px' }}>
            <strong style={{ color: '#fff' }}>Cancellation:</strong> If you cancel your subscription at any time, you will lose access to the $4.99/month promotional rate. Resubscribing after cancellation will be at the current standard rate ($9.99/month or higher).
          </p>

          <p style={{ marginBottom: '16px' }}>
            <strong style={{ color: '#fff' }}>Payment Issues:</strong> If your payment method is declined, expires, or we are unable to process payment for any reason, and you do not update your payment information within 7 days, your subscription will be cancelled and you will lose the promotional rate.
          </p>

          <p style={{ marginBottom: '16px' }}>
            <strong style={{ color: '#fff' }}>Account Violations:</strong> Any violation of Primal's Terms of Service may result in account suspension or termination, voiding this promotional rate.
          </p>

          <Link href="/promo-terms" style={{ color: '#f472b6', textDecoration: 'underline' }}>
            Read Full Terms & Conditions →
          </Link>
        </div>
      </div>

      {/* Final CTA */}
      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
        padding: '0 24px 80px',
        textAlign: 'center'
      }}>
        <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '16px' }}>Don't Miss Out</h2>
        <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: '32px' }}>
          This offer ends January 31, 2026. Lock in your rate today.
        </p>

        <button
          onClick={handleGetStarted}
          disabled={loading}
          style={{
            display: 'inline-block',
            padding: '20px 48px',
            background: 'linear-gradient(to right, #ec4899, #a855f7)',
            color: '#fff',
            fontWeight: 700,
            fontSize: '18px',
            border: 'none',
            borderRadius: '12px',
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: '0 10px 40px rgba(236,72,153,0.4)',
            transition: 'all 0.2s',
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? 'Loading...' : 'Get Started at $4.99/Month'}
        </button>
      </div>
    </div>
  );
}
