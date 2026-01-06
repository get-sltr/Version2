'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/lib/supabase';

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [redirectCountdown, setRedirectCountdown] = useState(3);

  useEffect(() => {
    const verifyPayment = async () => {
      const sessionId = searchParams.get('session_id');

      if (!sessionId) {
        setError('Invalid session');
        setLoading(false);
        return;
      }

      // Wait a moment for webhook to process
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Verify user's premium status
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_premium')
          .eq('id', user.id)
          .single();

        if (profile?.is_premium) {
          setLoading(false);
          // Auto-redirect to dashboard with countdown
          const countdownInterval = setInterval(() => {
            setRedirectCountdown(prev => {
              if (prev <= 1) {
                clearInterval(countdownInterval);
                router.push('/dashboard');
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
        } else {
          // Retry once more after another delay
          await new Promise(resolve => setTimeout(resolve, 3000));
          const { data: retryProfile } = await supabase
            .from('profiles')
            .select('is_premium')
            .eq('id', user.id)
            .single();

          if (!retryProfile?.is_premium) {
            setError('Payment verification pending. Your premium access will be activated shortly.');
          }
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [searchParams]);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: colors.background,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          border: `3px solid ${colors.border}`,
          borderTopColor: colors.accent,
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <p style={{ color: colors.textSecondary, marginTop: '20px', fontSize: '16px' }}>
          Verifying your payment...
        </p>
        <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: colors.background,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      textAlign: 'center'
    }}>
      {error ? (
        <>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'rgba(255, 193, 7, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '24px'
          }}>
            <span style={{ fontSize: '40px' }}>⏳</span>
          </div>
          <h1 style={{
            color: colors.text,
            fontSize: '24px',
            fontWeight: 700,
            marginBottom: '12px'
          }}>
            Payment Processing
          </h1>
          <p style={{
            color: colors.textSecondary,
            fontSize: '16px',
            maxWidth: '300px',
            marginBottom: '32px',
            lineHeight: 1.5
          }}>
            {error}
          </p>
        </>
      ) : (
        <>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(255,107,53,0.2) 0%, rgba(255,107,53,0.1) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '24px'
          }}>
            <span style={{ fontSize: '40px' }}>✨</span>
          </div>
          <h1 style={{
            color: colors.text,
            fontSize: '28px',
            fontWeight: 700,
            marginBottom: '12px'
          }}>
            Welcome to Premium!
          </h1>
          <p style={{
            color: colors.textSecondary,
            fontSize: '16px',
            maxWidth: '300px',
            marginBottom: '16px',
            lineHeight: 1.5
          }}>
            Your premium features are now unlocked. Enjoy unlimited access to SLTR!
          </p>
          <p style={{
            color: colors.accent,
            fontSize: '14px',
            marginBottom: '32px'
          }}>
            Redirecting to grid in {redirectCountdown}...
          </p>
        </>
      )}

      <button
        onClick={() => router.push('/dashboard')}
        style={{
          background: 'linear-gradient(135deg, #FF6B35 0%, #ff8c5a 100%)',
          border: 'none',
          borderRadius: '12px',
          padding: '16px 48px',
          color: '#fff',
          fontSize: '16px',
          fontWeight: 600,
          cursor: 'pointer',
          marginBottom: '16px'
        }}
      >
        Start Exploring
      </button>

      <button
        onClick={() => router.push('/settings')}
        style={{
          background: 'none',
          border: 'none',
          color: colors.textSecondary,
          fontSize: '14px',
          cursor: 'pointer',
          textDecoration: 'underline'
        }}
      >
        Manage Subscription
      </button>
    </div>
  );
}

function LoadingFallback() {
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
      <div style={{
        width: '60px',
        height: '60px',
        border: '3px solid #333',
        borderTopColor: '#FF6B35',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }} />
      <p style={{ color: '#888', marginTop: '20px', fontSize: '16px' }}>
        Loading...
      </p>
    </div>
  );
}

export default function PremiumSuccessPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SuccessContent />
    </Suspense>
  );
}
