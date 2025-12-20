'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function CheckoutPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const plan = searchParams.get('plan') || '6months';
  
  const [email, setEmail] = useState('');
  const [processing, setProcessing] = useState(false);

  const plans = {
    week: { price: 6.49, total: 6.49, period: '1 Week', discount: null },
    '1month': { price: 9.99, total: 9.99, period: '1 Month', discount: '64% Off' },
    '3months': { price: 6.49, total: 19.47, period: '3 Months', discount: '77% Off' },
    '6months': { price: 4.99, total: 29.94, period: '6 Months', discount: '82% Off' }
  };

  const selectedPlan = plans[plan as keyof typeof plans] || plans['6months'];

  useEffect(() => {
    // Pre-fill email if user is logged in
    const userEmail = localStorage.getItem('userEmail');
    if (userEmail) {
      setEmail(userEmail);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      alert('Please enter your email');
      return;
    }

    setProcessing(true);

    // In production, this would call your Stripe API endpoint:
    // const response = await fetch('/api/create-checkout-session', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ email, plan })
    // });
    // const { url } = await response.json();
    // window.location.href = url;

    // Mock processing
    setTimeout(() => {
      // Save email for future use
      localStorage.setItem('userEmail', email);
      // Redirect to success page
      router.push(`/checkout/success?plan=${plan}`);
    }, 2000);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#000',
      color: '#fff',
      fontFamily: "'Cormorant Garamond', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, serif",
      paddingBottom: '40px'
    }}>
      {/* Header */}
      <header style={{
        position: 'sticky',
        top: 0,
        background: 'rgba(0,0,0,0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid #1c1c1e',
        padding: '16px 20px',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
      }}>
        <button
          onClick={() => router.back()}
          style={{
            background: 'none',
            border: 'none',
            color: '#FF6B35',
            fontSize: '28px',
            cursor: 'pointer',
            padding: 0,
            lineHeight: 1
          }}
        >
          ←
        </button>
        <h1 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>
          Complete Purchase
        </h1>
      </header>

      <div style={{
        maxWidth: '500px',
        margin: '0 auto',
        padding: '24px 20px'
      }}>
        {/* Order Summary */}
        <div style={{
          background: '#1c1c1e',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px',
          border: '1px solid #333'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>
            Order Summary
          </h2>
          
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: '#aaa' }}>Plan</span>
              <span style={{ fontWeight: 600 }}>UNLIMITED</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: '#aaa' }}>Duration</span>
              <span style={{ fontWeight: 600 }}>{selectedPlan.period}</span>
            </div>
            {selectedPlan.discount && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#aaa' }}>Discount</span>
                <span style={{ color: '#FF6B35', fontWeight: 600 }}>{selectedPlan.discount}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: '#aaa' }}>Price</span>
              <span style={{ fontWeight: 600 }}>
                ${selectedPlan.price}{plan !== 'week' && '/mo'}
              </span>
            </div>
          </div>

          <div style={{
            borderTop: '1px solid #333',
            paddingTop: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ fontSize: '18px', fontWeight: 700 }}>Total Due Today</span>
            <span style={{ fontSize: '24px', fontWeight: 700, color: '#FF6B35' }}>
              ${selectedPlan.total.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Payment Form */}
        <form onSubmit={handleSubmit}>
          <div style={{
            background: '#1c1c1e',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px',
            border: '1px solid #333'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>
              Payment Information
            </h3>

            {/* Email */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: '#888', marginBottom: '8px' }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                style={{
                  width: '100%',
                  background: '#000',
                  border: '1px solid #333',
                  borderRadius: '12px',
                  padding: '14px 16px',
                  color: '#fff',
                  fontSize: '15px',
                  outline: 'none'
                }}
              />
              <div style={{ fontSize: '12px', color: '#666', marginTop: '6px' }}>
                Receipt will be sent to this email
              </div>
            </div>

            {/* Card Info Placeholder */}
            <div style={{
              background: 'rgba(255,107,53,0.1)',
              border: '1px solid rgba(255,107,53,0.3)',
              borderRadius: '12px',
              padding: '16px',
              fontSize: '14px',
              color: '#aaa',
              lineHeight: 1.6
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <span style={{ fontSize: '24px' }}>💳</span>
                <span style={{ fontWeight: 600, color: '#FF6B35' }}>Secure Payment</span>
              </div>
              You'll be redirected to Stripe's secure payment page to complete your purchase.
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={processing || !email}
            style={{
              width: '100%',
              background: (processing || !email) ? '#333' : 'linear-gradient(135deg, #FF6B35 0%, #ff8c5a 100%)',
              border: 'none',
              borderRadius: '12px',
              padding: '18px',
              color: '#fff',
              fontSize: '18px',
              fontWeight: 700,
              cursor: (processing || !email) ? 'not-allowed' : 'pointer',
              opacity: (processing || !email) ? 0.5 : 1,
              marginBottom: '16px',
              transition: 'all 0.2s'
            }}
          >
            {processing ? 'Processing...' : 'Continue to Payment'}
          </button>

          {/* Terms */}
          <div style={{
            fontSize: '11px',
            color: '#666',
            textAlign: 'center',
            lineHeight: 1.5
          }}>
            By continuing, you agree to our{' '}
            <a href="/terms" style={{ color: '#FF6B35', textDecoration: 'none' }}>Terms of Service</a>
            {' '}and{' '}
            <a href="/privacy" style={{ color: '#FF6B35', textDecoration: 'none' }}>Privacy Policy</a>.
            Subscription will auto-renew unless canceled at least 24 hours before renewal.
          </div>
        </form>

        {/* Security Badges */}
        <div style={{
          marginTop: '32px',
          display: 'flex',
          justifyContent: 'center',
          gap: '24px',
          opacity: 0.6
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', marginBottom: '4px' }}>🔒</div>
            <div style={{ fontSize: '11px', color: '#666' }}>Secure</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', marginBottom: '4px' }}>💳</div>
            <div style={{ fontSize: '11px', color: '#666' }}>Stripe</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', marginBottom: '4px' }}>🛡️</div>
            <div style={{ fontSize: '11px', color: '#666' }}>Protected</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CheckoutPageContent />
    </Suspense>
  );
}
