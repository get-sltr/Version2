'use client';

import { useRouter } from 'next/navigation';

const PRO_FEATURES = [
  'Unlimited profiles and messaging',
  'See who viewed you',
  'Incognito mode',
  'Read receipts and typing status',
  'Travel mode',
  'Premium video calls',
  'Expiring photos and albums',
  'Unsend messages and message translate',
  'Pin conversations and saved phrases',
  'Pro Badge on your profile',
  'Post on the map',
  'Access to Pulse rooms',
  'No third-party ads',
  'Priority support',
];

const FREE_FEATURES = [
  'Browse profiles nearby',
  'Limited daily messages',
  'Basic filters',
  'Create your profile',
  'Upload photos',
];

export default function PricingPage() {
  const router = useRouter();

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#000',
        color: '#fff',
        fontFamily:
          "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* Header */}
      <header
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <button
          onClick={() => router.push('/')}
          style={{
            background: 'none',
            border: 'none',
            color: '#FF6B35',
            fontSize: '16px',
            fontWeight: 700,
            cursor: 'pointer',
            padding: 0,
            letterSpacing: '1px',
          }}
        >
          PRIMAL
        </button>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => router.push('/login')}
            style={{
              background: 'none',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '8px',
              padding: '8px 16px',
              color: '#fff',
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            Log in
          </button>
          <button
            onClick={() => router.push('/signup')}
            style={{
              background: 'linear-gradient(135deg, #FF6B35 0%, #ff8c5a 100%)',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              color: '#fff',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Sign Up
          </button>
        </div>
      </header>

      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '48px 20px 80px' }}>
        {/* Page heading */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h1
            style={{
              fontSize: '36px',
              fontWeight: 800,
              marginBottom: '12px',
              lineHeight: 1.2,
            }}
          >
            Simple, transparent pricing
          </h1>
          <p
            style={{
              fontSize: '16px',
              color: 'rgba(255,255,255,0.5)',
              maxWidth: '480px',
              margin: '0 auto',
              lineHeight: 1.6,
            }}
          >
            Start for free. Upgrade to Primal Pro to unlock unlimited access and premium
            features.
          </p>
        </div>

        {/* Tier cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px',
            marginBottom: '64px',
            maxWidth: '900px',
            margin: '0 auto 64px',
          }}
        >
          {/* Free Tier */}
          <div
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '20px',
              padding: '32px 28px',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '4px' }}>
              Free
            </h2>
            <p
              style={{
                fontSize: '14px',
                color: 'rgba(255,255,255,0.45)',
                marginBottom: '20px',
              }}
            >
              Get started and explore
            </p>

            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: '4px',
                marginBottom: '24px',
              }}
            >
              <span style={{ fontSize: '40px', fontWeight: 800 }}>$0</span>
              <span style={{ fontSize: '15px', color: 'rgba(255,255,255,0.45)' }}>
                forever
              </span>
            </div>

            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: '0 0 28px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                flex: 1,
              }}
            >
              {FREE_FEATURES.map((feat) => (
                <li
                  key={feat}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    fontSize: '14px',
                    color: 'rgba(255,255,255,0.75)',
                    lineHeight: 1.4,
                  }}
                >
                  <span
                    style={{
                      color: 'rgba(255,255,255,0.35)',
                      flexShrink: 0,
                      marginTop: '2px',
                    }}
                  >
                    &#10003;
                  </span>
                  {feat}
                </li>
              ))}
            </ul>

            <button
              onClick={() => router.push('/signup')}
              style={{
                width: '100%',
                padding: '14px',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '15px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Sign Up Free
            </button>
          </div>

          {/* Monthly Tier */}
          <div
            style={{
              position: 'relative',
              background:
                'linear-gradient(145deg, rgba(255,107,53,0.12) 0%, rgba(255,140,90,0.04) 100%)',
              border: '2px solid rgba(255,107,53,0.5)',
              borderRadius: '20px',
              padding: '32px 28px',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '-13px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'linear-gradient(135deg, #FF6B35 0%, #ff8c5a 100%)',
                borderRadius: '20px',
                padding: '4px 16px',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '1px',
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
              }}
            >
              Most Popular
            </div>

            <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '4px' }}>
              Primal Pro Monthly
            </h2>
            <p
              style={{
                fontSize: '14px',
                color: 'rgba(255,255,255,0.45)',
                marginBottom: '20px',
              }}
            >
              Unlock everything, billed monthly
            </p>

            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: '4px',
                marginBottom: '24px',
              }}
            >
              <span style={{ fontSize: '40px', fontWeight: 800 }}>$12.99</span>
              <span style={{ fontSize: '15px', color: 'rgba(255,255,255,0.45)' }}>
                /month
              </span>
            </div>

            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: '0 0 28px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                flex: 1,
              }}
            >
              {PRO_FEATURES.map((feat) => (
                <li
                  key={feat}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    fontSize: '14px',
                    color: 'rgba(255,255,255,0.75)',
                    lineHeight: 1.4,
                  }}
                >
                  <span
                    style={{
                      color: '#FF6B35',
                      flexShrink: 0,
                      marginTop: '2px',
                    }}
                  >
                    &#10003;
                  </span>
                  {feat}
                </li>
              ))}
            </ul>

            <button
              onClick={() => router.push('/signup')}
              style={{
                width: '100%',
                padding: '14px',
                background: 'linear-gradient(135deg, #FF6B35 0%, #ff8c5a 100%)',
                border: 'none',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '15px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Get Primal Pro
            </button>
          </div>

          {/* Yearly Tier */}
          <div
            style={{
              position: 'relative',
              background:
                'linear-gradient(145deg, rgba(255,107,53,0.08) 0%, rgba(255,140,90,0.02) 100%)',
              border: '1px solid rgba(255,107,53,0.3)',
              borderRadius: '20px',
              padding: '32px 28px',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '-13px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'linear-gradient(135deg, #34C759 0%, #30D158 100%)',
                borderRadius: '20px',
                padding: '4px 16px',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '1px',
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
              }}
            >
              Save 36%
            </div>

            <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '4px' }}>
              Primal Pro Yearly
            </h2>
            <p
              style={{
                fontSize: '14px',
                color: 'rgba(255,255,255,0.45)',
                marginBottom: '20px',
              }}
            >
              Best value, billed annually
            </p>

            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: '4px',
                marginBottom: '4px',
              }}
            >
              <span style={{ fontSize: '40px', fontWeight: 800 }}>$99.99</span>
              <span style={{ fontSize: '15px', color: 'rgba(255,255,255,0.45)' }}>
                /year
              </span>
            </div>
            <div
              style={{
                fontSize: '14px',
                color: '#34C759',
                fontWeight: 600,
                marginBottom: '24px',
              }}
            >
              That&apos;s just $8.33/month
            </div>

            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: '0 0 28px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                flex: 1,
              }}
            >
              {PRO_FEATURES.map((feat) => (
                <li
                  key={feat}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    fontSize: '14px',
                    color: 'rgba(255,255,255,0.75)',
                    lineHeight: 1.4,
                  }}
                >
                  <span
                    style={{
                      color: '#FF6B35',
                      flexShrink: 0,
                      marginTop: '2px',
                    }}
                  >
                    &#10003;
                  </span>
                  {feat}
                </li>
              ))}
            </ul>

            <button
              onClick={() => router.push('/signup')}
              style={{
                width: '100%',
                padding: '14px',
                background: 'linear-gradient(135deg, #FF6B35 0%, #ff8c5a 100%)',
                border: 'none',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '15px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Get Primal Pro Yearly
            </button>
          </div>
        </div>

        {/* FAQ */}
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <h3
            style={{
              textAlign: 'center',
              fontSize: '24px',
              fontWeight: 700,
              marginBottom: '32px',
            }}
          >
            Frequently asked questions
          </h3>

          {[
            {
              q: 'Can I try Primal for free?',
              a: 'Yes. Create a free account to browse profiles, set up your profile, and send a limited number of messages each day. Upgrade anytime to unlock unlimited access.',
            },
            {
              q: 'How do I subscribe to Primal Pro?',
              a: 'Download the Primal app on iOS and subscribe directly through the App Store. Subscriptions are managed through your Apple ID.',
            },
            {
              q: 'Can I cancel my subscription?',
              a: 'Yes, you can cancel anytime from your App Store account settings. Your Pro access continues until the end of the current billing period.',
            },
            {
              q: 'Is my data private?',
              a: 'Absolutely. Location data is encrypted, your phone number is never shared with other users, and you can enable Incognito mode to browse without appearing on the grid. See our Privacy Policy for full details.',
            },
          ].map((item) => (
            <div
              key={item.q}
              style={{
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                padding: '20px 0',
              }}
            >
              <h4
                style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  marginBottom: '8px',
                }}
              >
                {item.q}
              </h4>
              <p
                style={{
                  fontSize: '14px',
                  color: 'rgba(255,255,255,0.5)',
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                {item.a}
              </p>
            </div>
          ))}
        </div>

        {/* Footer links */}
        <div
          style={{
            textAlign: 'center',
            marginTop: '48px',
            fontSize: '13px',
            color: 'rgba(255,255,255,0.3)',
            lineHeight: 1.8,
          }}
        >
          <a
            href="/terms"
            style={{ color: 'rgba(255,255,255,0.45)', textDecoration: 'underline' }}
          >
            Terms of Service
          </a>
          {' | '}
          <a
            href="/privacy"
            style={{ color: 'rgba(255,255,255,0.45)', textDecoration: 'underline' }}
          >
            Privacy Policy
          </a>
        </div>
      </div>
    </div>
  );
}
