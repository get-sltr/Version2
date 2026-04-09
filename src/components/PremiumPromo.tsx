'use client';

import { useRouter } from 'next/navigation';

interface PremiumPromoProps {
  feature: string;
  onClose?: () => void;
  // If true, shows as full page instead of modal
  fullPage?: boolean;
}

const PREMIUM_BENEFITS = [
  { icon: '♾️', text: 'Unlimited Messages' },
  { icon: '🎥', text: 'Video Calls' },
  { icon: '👁️', text: 'See Who Viewed You' },
  { icon: '🔍', text: 'Unlimited Filters' },
  { icon: '👻', text: 'Incognito Mode' },
  { icon: '🌎', text: 'Travel Mode' },
  { icon: '💬', text: 'Read Receipts' },
  { icon: '🎉', text: 'Access to Pulse Rooms' },
  { icon: '📍', text: 'Post on Map' },
  { icon: '⭐', text: 'Pro Badge on Profile' },
];

export function PremiumPromo({ feature, onClose, fullPage = false }: PremiumPromoProps) {
  const router = useRouter();

  const handleUpgrade = () => {
    router.push('/premium');
  };

  const content = (
    <div style={{
      background: '#000',
      color: '#fff',
      padding: fullPage ? '40px 20px' : '32px 24px',
      maxWidth: '500px',
      width: '100%',
      borderRadius: fullPage ? 0 : '24px',
      textAlign: 'center',
      fontFamily: "'Cormorant Garamond', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, serif"
    }}>
      {/* Close button for modal */}
      {!fullPage && onClose && (
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            color: '#888',
            fontSize: '24px',
            cursor: 'pointer'
          }}
        >
          ×
        </button>
      )}

      {/* Pro Badge */}
      <div style={{
        display: 'inline-block',
        background: 'linear-gradient(135deg, #FF6B35 0%, #ff8c5a 100%)',
        borderRadius: '20px',
        padding: '8px 24px',
        fontSize: '14px',
        fontWeight: 700,
        letterSpacing: '2px',
        marginBottom: '24px'
      }}>
        PRIMAL+
      </div>

      {/* Lock Icon & Feature */}
      <div style={{ fontSize: '64px', marginBottom: '16px' }}>🔓</div>
      <h2 style={{
        fontSize: '28px',
        fontWeight: 800,
        marginBottom: '8px',
        background: 'linear-gradient(135deg, #FF6B35 0%, #ff8c5a 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text'
      }}>
        Unlock {feature}
      </h2>
      <p style={{
        fontSize: '16px',
        color: '#888',
        marginBottom: '32px',
        lineHeight: 1.5
      }}>
        Upgrade to Primal+ for unlimited access to all premium features
      </p>

      {/* Benefits Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '12px',
        marginBottom: '32px',
        textAlign: 'left'
      }}>
        {PREMIUM_BENEFITS.map((benefit, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '14px',
              padding: '10px 12px',
              background: '#1c1c1e',
              borderRadius: '10px'
            }}
          >
            <span style={{ fontSize: '18px' }}>{benefit.icon}</span>
            <span style={{ color: '#ddd' }}>{benefit.text}</span>
          </div>
        ))}
      </div>

      {/* Pricing Teaser */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(255,107,53,0.15) 0%, rgba(255,107,53,0.05) 100%)',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '24px',
        border: '1px solid rgba(255,107,53,0.3)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
          <div style={{ flex: 1, padding: '12px', background: '#1c1c1e', borderRadius: '12px', border: '1px solid rgba(255,107,53,0.3)' }}>
            <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>Monthly</div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '2px' }}>
              <span style={{ fontSize: '24px', fontWeight: 800, color: '#FF6B35' }}>$12.99</span>
              <span style={{ fontSize: '12px', color: '#888' }}>/mo</span>
            </div>
          </div>
          <div style={{ flex: 1, padding: '12px', background: '#1c1c1e', borderRadius: '12px', border: '1px solid rgba(52,199,89,0.4)' }}>
            <div style={{ fontSize: '12px', color: '#34C759', fontWeight: 600, marginBottom: '4px' }}>Yearly &middot; Save 36%</div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '2px' }}>
              <span style={{ fontSize: '24px', fontWeight: 800, color: '#FF6B35' }}>$99.99</span>
              <span style={{ fontSize: '12px', color: '#888' }}>/yr</span>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <button
        onClick={handleUpgrade}
        style={{
          width: '100%',
          background: 'linear-gradient(135deg, #FF6B35 0%, #ff8c5a 100%)',
          border: 'none',
          borderRadius: '16px',
          padding: '18px',
          color: '#fff',
          fontSize: '18px',
          fontWeight: 700,
          cursor: 'pointer',
          marginBottom: '16px',
          transition: 'transform 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        Upgrade Now
      </button>

      {/* Secondary action */}
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: '#666',
            fontSize: '14px',
            cursor: 'pointer',
            padding: '8px'
          }}
        >
          Maybe Later
        </button>
      )}
    </div>
  );

  // Full page version
  if (fullPage) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#000',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        {content}
      </div>
    );
  }

  // Modal version
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.9)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      zIndex: 1000
    }}>
      <div style={{ position: 'relative' }}>
        {content}
      </div>
    </div>
  );
}

// Hook to easily show premium promo when feature is accessed
export function usePremiumFeature(isPremium: boolean) {
  const router = useRouter();

  const checkAccess = (featureName: string, onAllowed: () => void) => {
    if (isPremium) {
      onAllowed();
    } else {
      // Store the feature they tried to access for the promo page
      sessionStorage.setItem('attemptedFeature', featureName);
      router.push('/premium');
    }
  };

  return { checkAccess };
}
