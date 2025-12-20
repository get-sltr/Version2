'use client';

import { useRouter } from 'next/navigation';
import { usePremium } from '@/hooks/usePremium';
import { useTheme } from '@/contexts/ThemeContext';

interface PremiumGateProps {
  children: React.ReactNode;
  feature: string;
  featureDescription?: string;
  // If true, shows blurred content with upgrade overlay
  showBlurred?: boolean;
  // If true, just returns null instead of showing upgrade prompt
  hideIfNotPremium?: boolean;
}

export function PremiumGate({
  children,
  feature,
  featureDescription,
  showBlurred = false,
  hideIfNotPremium = false
}: PremiumGateProps) {
  const router = useRouter();
  const { colors } = useTheme();
  const { isPremium, isLoading } = usePremium();

  // Show loading state
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        opacity: 0.5
      }}>
        Loading...
      </div>
    );
  }

  // If premium, show the content
  if (isPremium) {
    return <>{children}</>;
  }

  // Not premium - handle based on props
  if (hideIfNotPremium) {
    return null;
  }

  // Show blurred content with upgrade overlay
  if (showBlurred) {
    return (
      <div style={{ position: 'relative' }}>
        <div style={{
          filter: 'blur(8px)',
          pointerEvents: 'none',
          userSelect: 'none'
        }}>
          {children}
        </div>
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(4px)',
          borderRadius: '12px'
        }}>
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>🔒</div>
            <div style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>
              {feature}
            </div>
            {featureDescription && (
              <div style={{ fontSize: '14px', opacity: 0.7, marginBottom: '16px' }}>
                {featureDescription}
              </div>
            )}
            <button
              onClick={() => router.push('/premium')}
              style={{
                background: 'linear-gradient(135deg, #FF6B35 0%, #ff8c5a 100%)',
                border: 'none',
                borderRadius: '20px',
                padding: '12px 24px',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Upgrade to Premium
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show upgrade prompt
  return (
    <div style={{
      background: colors.surface,
      borderRadius: '16px',
      padding: '24px',
      textAlign: 'center',
      border: `1px solid ${colors.border}`
    }}>
      <div style={{ fontSize: '40px', marginBottom: '16px' }}>⭐</div>
      <h3 style={{
        fontSize: '20px',
        fontWeight: 700,
        marginBottom: '8px',
        color: colors.text
      }}>
        {feature}
      </h3>
      {featureDescription && (
        <p style={{
          fontSize: '14px',
          color: colors.textSecondary,
          marginBottom: '20px'
        }}>
          {featureDescription}
        </p>
      )}
      <button
        onClick={() => router.push('/premium')}
        style={{
          background: 'linear-gradient(135deg, #FF6B35 0%, #ff8c5a 100%)',
          border: 'none',
          borderRadius: '24px',
          padding: '14px 32px',
          color: '#fff',
          fontSize: '16px',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'transform 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        Unlock with Premium
      </button>
    </div>
  );
}

// Simple component for showing "Premium" badge
export function PremiumBadge() {
  const { isPremium } = usePremium();

  if (!isPremium) return null;

  return (
    <span style={{
      background: 'linear-gradient(135deg, #FF6B35 0%, #ff8c5a 100%)',
      color: '#fff',
      fontSize: '10px',
      fontWeight: 700,
      padding: '2px 8px',
      borderRadius: '10px',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    }}>
      PRO
    </span>
  );
}

// Message limit warning component
export function MessageLimitWarning() {
  const router = useRouter();
  const { isPremium, messagesRemaining, isLoading } = usePremium();

  if (isLoading || isPremium || messagesRemaining > 2) return null;

  return (
    <div style={{
      background: messagesRemaining === 0
        ? 'rgba(255, 59, 48, 0.15)'
        : 'rgba(255, 149, 0, 0.15)',
      border: `1px solid ${messagesRemaining === 0 ? 'rgba(255, 59, 48, 0.5)' : 'rgba(255, 149, 0, 0.5)'}`,
      borderRadius: '12px',
      padding: '12px 16px',
      marginBottom: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px'
    }}>
      <div style={{ fontSize: '14px' }}>
        {messagesRemaining === 0 ? (
          <span style={{ color: '#FF3B30' }}>
            You've reached your daily message limit
          </span>
        ) : (
          <span style={{ color: '#FF9500' }}>
            {messagesRemaining} message{messagesRemaining !== 1 ? 's' : ''} remaining today
          </span>
        )}
      </div>
      <button
        onClick={() => router.push('/premium')}
        style={{
          background: '#FF6B35',
          border: 'none',
          borderRadius: '16px',
          padding: '8px 16px',
          color: '#fff',
          fontSize: '12px',
          fontWeight: 600,
          cursor: 'pointer',
          whiteSpace: 'nowrap'
        }}
      >
        Go Unlimited
      </button>
    </div>
  );
}
