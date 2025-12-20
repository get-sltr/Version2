'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function CheckoutSuccessPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const plan = searchParams.get('plan') || '6months';
  const [countdown, setCountdown] = useState(5);

  const plans = {
    week: { period: '1 Week' },
    '1month': { period: '1 Month' },
    '3months': { period: '3 Months' },
    '6months': { period: '6 Months' }
  };

  const selectedPlan = plans[plan as keyof typeof plans] || plans['6months'];

  useEffect(() => {
    // Mark user as premium in localStorage (in production, this comes from backend)
    localStorage.setItem('isPremium', 'true');
    localStorage.setItem('premiumPlan', plan);
    localStorage.setItem('premiumActivatedAt', new Date().toISOString());

    // Countdown redirect
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/dashboard');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [plan, router]);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#000',
      color: '#fff',
      fontFamily: "'Cormorant Garamond', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, serif",
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '500px',
        textAlign: 'center'
      }}>
        {/* Success Animation */}
        <div style={{
          width: '120px',
          height: '120px',
          margin: '0 auto 32px',
          background: 'linear-gradient(135deg, #FF6B35 0%, #ff8c5a 100%)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '60px',
          animation: 'scaleIn 0.5s ease-out'
        }}>
          ✓
        </div>

        <h1 style={{
          fontSize: '32px',
          fontWeight: 800,
          marginBottom: '16px',
          background: 'linear-gradient(135deg, #FF6B35 0%, #ff8c5a 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Welcome to Premium!
        </h1>

        <p style={{
          fontSize: '18px',
          color: '#aaa',
          marginBottom: '32px',
          lineHeight: 1.6
        }}>
          Your {selectedPlan.period} UNLIMITED subscription is now active.
        </p>

        {/* Features Unlocked */}
        <div style={{
          background: '#1c1c1e',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '32px',
          textAlign: 'left',
          border: '1px solid #333'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', textAlign: 'center' }}>
            🎉 Features Unlocked
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
            {[
              'Unlimited profiles',
              'Travel Mode',
              'Read Receipts',
              'Saved Phrases',
              'Expiring Albums',
              'The Pulse Video Rooms',
              'Incognito Mode',
              'No Ads'
            ].map((feature, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ color: '#FF6B35', fontSize: '18px' }}>✓</span>
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Receipt Info */}
        <div style={{
          background: 'rgba(255,107,53,0.1)',
          border: '1px solid rgba(255,107,53,0.3)',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '32px',
          fontSize: '13px',
          color: '#aaa',
          lineHeight: 1.6
        }}>
          📧 A receipt has been sent to your email. You can manage your subscription anytime in Settings.
        </div>

        {/* Action Buttons */}
        <button
          onClick={() => router.push('/dashboard')}
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, #FF6B35 0%, #ff8c5a 100%)',
            border: 'none',
            borderRadius: '12px',
            padding: '16px',
            color: '#fff',
            fontSize: '16px',
            fontWeight: 700,
            cursor: 'pointer',
            marginBottom: '12px'
          }}
        >
          Start Exploring
        </button>

        <div style={{ fontSize: '13px', color: '#666' }}>
          Redirecting in {countdown} seconds...
        </div>
      </div>

      <style jsx>{`
        @keyframes scaleIn {
          from {
            transform: scale(0);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CheckoutSuccessPageContent />
    </Suspense>
  );
}
