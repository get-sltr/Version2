'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '../../contexts/ThemeContext';
import { supabase } from '@/lib/supabase';
import posthog from 'posthog-js';

export default function PremiumPage() {
  const router = useRouter();
  const { colors } = useTheme();
  const [selectedPlan, setSelectedPlan] = useState<'launch_special' | 'week' | '1month' | '3months' | '6months'>('launch_special');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const plans = {
    launch_special: { price: 4.99, total: 4.99, discount: null, per: 'month', label: 'Launch Special', isPromo: true },
    week: { price: 4.99, total: 4.99, discount: null, per: 'week', label: '1 Week' },
    '1month': { price: 9.99, total: 9.99, discount: '64%', per: 'month', label: '1 Month' },
    '3months': { price: 7.99, total: 23.97, discount: '77%', per: 'month', label: '3 Months' },
    '6months': { price: 5.99, total: 35.97, discount: '82%', per: 'month', label: '6 Months' }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setIsAuthenticated(true);
        } else {
          router.push('/login?redirect=/premium');
        }
      } catch {
        router.push('/login?redirect=/premium');
      } finally {
        setCheckingAuth(false);
      }
    };
    checkAuth();
  }, [router]);

  const handleContinue = async () => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/premium');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Ensure cookies are sent for auth
        body: JSON.stringify({ plan: selectedPlan }),
      });

      const data = await response.json();

      if (response.status === 401) {
        // Session expired - redirect to login
        router.push('/login?redirect=/premium');
        return;
      }

      if (response.status === 429) {
        // Rate limited
        setError('Too many requests. Please wait a moment and try again.');
        return;
      }

      if (!response.ok) {
        setError(data.error || 'Something went wrong. Please try again.');
        return;
      }

      if (data.url) {
        // Capture premium plan selected event in PostHog
        posthog.capture('premium_plan_selected', {
          plan: selectedPlan,
          price: plans[selectedPlan].total,
          price_per_month: plans[selectedPlan].price,
          discount: plans[selectedPlan].discount,
        });

        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        setError('Unable to start checkout. Please try again.');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError('Connection error. Please check your internet and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while checking auth
  if (checkingAuth) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.85) 25%, rgba(0,0,0,0.95) 45%, #000 55%), url(/images/7.jpg)',
      backgroundSize: 'cover, cover',
      backgroundPosition: 'center top, center top',
      backgroundRepeat: 'no-repeat, no-repeat',
      backgroundAttachment: 'scroll, scroll',
      color: '#fff',
      fontFamily: "'Cormorant Garamond', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, serif",
      paddingBottom: '100px'
    }}>
      {/* Header */}
      <div style={{
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
            fontSize: '32px',
            cursor: 'pointer',
            padding: 0,
            lineHeight: 1
          }}
        >
          ←
        </button>
        <h1 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>
          Choose A Plan
        </h1>
      </div>

      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        padding: '24px 20px'
      }}>
        {/* Plan Type Badge */}
        <div style={{
          background: '#fff',
          color: '#000',
          borderRadius: '24px',
          padding: '14px 32px',
          fontSize: '18px',
          fontWeight: 700,
          textAlign: 'center',
          marginBottom: '32px',
          letterSpacing: '1px'
        }}>
          UNLIMITED
        </div>

        {/* The Power Section */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '24px' }}>
            The Power To Explore It All
          </h2>

          {[
            {
              icon: '♾️',
              title: 'Unlimited Connections',
              desc: 'Unlocked grid with unlimited profiles'
            },
            {
              icon: '👁️',
              title: 'Know Who\'s Interested',
              desc: 'See who\'s checking you out'
            },
            {
              icon: '👻',
              title: 'More Customization',
              desc: 'Go incognito for discreet browsing'
            },
            {
              icon: '🚫',
              title: 'No Interruptions',
              desc: 'No 3rd party ads*'
            }
          ].map((feature, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                marginBottom: '20px',
                padding: '16px',
                background: '#1c1c1e',
                borderRadius: '16px',
                border: '1px solid #333'
              }}
            >
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #FF6B35 0%, #ff8c5a 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
                flexShrink: 0
              }}>
                {feature.icon}
              </div>
              <div>
                <div style={{ fontSize: '17px', fontWeight: 700, marginBottom: '4px' }}>
                  {feature.title}
                </div>
                <div style={{ fontSize: '14px', color: '#888' }}>
                  {feature.desc}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Unlimited Features */}
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '20px' }}>
            Unlimited Features
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { icon: '🖼️', text: 'Unlimited profiles' },
              { icon: '🌍', text: 'Unlimited Messaging in Explore' },
              { icon: '👁️', text: 'Viewed me' },
              { icon: '👻', text: 'Incognito mode' },
              { icon: '✨', text: 'For You Matches' },
              { icon: '⏰', text: 'Unlimited expiring photos' },
              { icon: '💦', text: 'Right Now - 100 profiles' },
              { icon: '↩️', text: 'Unsend messages' },
              { icon: '🌐', text: 'Message translate' },
              { icon: '⋯', text: 'Typing status' }
            ].map((feature, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  fontSize: '15px'
                }}
              >
                <span style={{ fontSize: '20px' }}>{feature.icon}</span>
                <span>{feature.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* XTRA Features */}
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '20px' }}>
            Includes All XTRA Features
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { icon: '🖼️', text: 'Create multiple albums' },
              { icon: '👀', text: 'View all shared albums' },
              { icon: '⏳', text: 'Expiring albums' },
              { icon: '🚫', text: 'No 3rd party ads*' },
              { icon: '✓', text: 'Read receipts' },
              { icon: '💬', text: 'Saved phrases' },
              { icon: '💬', text: 'Mark recently messaged' },
              { icon: '🎥', text: 'The Pulse - Premium Video Rooms' }
            ].map((feature, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  fontSize: '15px'
                }}
              >
                <span style={{ fontSize: '20px' }}>{feature.icon}</span>
                <span>{feature.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Plan Selection */}
        <div style={{ marginBottom: '24px' }}>
          {/* Launch Special - Featured Promo */}
          <div
            onClick={() => setSelectedPlan('launch_special')}
            style={{
              background: selectedPlan === 'launch_special' ? 'linear-gradient(135deg, rgba(255,107,53,0.25) 0%, rgba(255,215,0,0.15) 100%)' : 'linear-gradient(135deg, rgba(255,107,53,0.1) 0%, rgba(255,215,0,0.05) 100%)',
              border: `2px solid ${selectedPlan === 'launch_special' ? '#FF6B35' : '#FFD700'}`,
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '16px',
              cursor: 'pointer',
              position: 'relative',
              transition: 'all 0.2s',
              boxShadow: selectedPlan === 'launch_special' ? '0 0 20px rgba(255,107,53,0.3)' : '0 0 15px rgba(255,215,0,0.15)'
            }}
          >
            <div style={{
              position: 'absolute',
              top: '-12px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'linear-gradient(135deg, #FF6B35, #FFD700)',
              borderRadius: '20px',
              padding: '6px 16px',
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap'
            }}>
              Limited Time Offer
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  border: `2px solid ${selectedPlan === 'launch_special' ? '#FF6B35' : '#FFD700'}`,
                  background: selectedPlan === 'launch_special' ? '#FF6B35' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {selectedPlan === 'launch_special' && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#fff' }} />}
                </div>
                <div>
                  <span style={{ fontSize: '17px', fontWeight: 700, display: 'block' }}>Launch Special</span>
                  <span style={{ fontSize: '12px', color: '#FFD700' }}>1 Month Premium Access</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '20px', fontWeight: 800, color: '#FF6B35' }}>$4.99</span>
                <span style={{ fontSize: '12px', color: '#888', display: 'block' }}>50% off</span>
              </div>
            </div>
          </div>

          {/* 1 Week */}
          <div
            onClick={() => setSelectedPlan('week')}
            style={{
              background: selectedPlan === 'week' ? '#1c1c1e' : '#0a0a0a',
              border: `2px solid ${selectedPlan === 'week' ? '#FF6B35' : '#333'}`,
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              transition: 'all 0.2s'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                border: `2px solid ${selectedPlan === 'week' ? '#FF6B35' : '#666'}`,
                background: selectedPlan === 'week' ? '#FF6B35' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {selectedPlan === 'week' && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#fff' }} />}
              </div>
              <span style={{ fontSize: '17px', fontWeight: 600 }}>1 Week</span>
            </div>
            <span style={{ fontSize: '17px', fontWeight: 700 }}>${plans.week.price}</span>
          </div>

          {/* 6 Months - Best Value */}
          <div
            onClick={() => setSelectedPlan('6months')}
            style={{
              background: selectedPlan === '6months' ? 'linear-gradient(135deg, rgba(255,107,53,0.2) 0%, rgba(255,107,53,0.05) 100%)' : '#0a0a0a',
              border: `2px solid ${selectedPlan === '6months' ? '#FF6B35' : '#333'}`,
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '16px',
              cursor: 'pointer',
              position: 'relative',
              transition: 'all 0.2s'
            }}
          >
            {plans['6months'].discount && (
              <div style={{
                position: 'absolute',
                top: '-10px',
                right: '20px',
                background: '#FF6B35',
                borderRadius: '12px',
                padding: '4px 12px',
                fontSize: '12px',
                fontWeight: 700
              }}>
                {plans['6months'].discount} Off
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  border: `2px solid ${selectedPlan === '6months' ? '#FF6B35' : '#666'}`,
                  background: selectedPlan === '6months' ? '#FF6B35' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {selectedPlan === '6months' && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#fff' }} />}
                </div>
                <span style={{ fontSize: '17px', fontWeight: 600 }}>6 Months</span>
              </div>
              <span style={{ fontSize: '17px', fontWeight: 700 }}>${plans['6months'].price}/mo</span>
            </div>
          </div>

          {/* 3 Months */}
          <div
            onClick={() => setSelectedPlan('3months')}
            style={{
              background: selectedPlan === '3months' ? '#1c1c1e' : '#0a0a0a',
              border: `2px solid ${selectedPlan === '3months' ? '#FF6B35' : '#333'}`,
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '16px',
              cursor: 'pointer',
              position: 'relative',
              transition: 'all 0.2s'
            }}
          >
            {plans['3months'].discount && (
              <div style={{
                position: 'absolute',
                top: '-10px',
                right: '20px',
                background: 'rgba(255,107,53,0.8)',
                borderRadius: '12px',
                padding: '4px 12px',
                fontSize: '12px',
                fontWeight: 700
              }}>
                {plans['3months'].discount} Off
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  border: `2px solid ${selectedPlan === '3months' ? '#FF6B35' : '#666'}`,
                  background: selectedPlan === '3months' ? '#FF6B35' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {selectedPlan === '3months' && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#fff' }} />}
                </div>
                <span style={{ fontSize: '17px', fontWeight: 600 }}>3 Months</span>
              </div>
              <span style={{ fontSize: '17px', fontWeight: 700 }}>${plans['3months'].price}/mo</span>
            </div>
          </div>

          {/* 1 Month */}
          <div
            onClick={() => setSelectedPlan('1month')}
            style={{
              background: selectedPlan === '1month' ? '#1c1c1e' : '#0a0a0a',
              border: `2px solid ${selectedPlan === '1month' ? '#FF6B35' : '#333'}`,
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '16px',
              cursor: 'pointer',
              position: 'relative',
              transition: 'all 0.2s'
            }}
          >
            {plans['1month'].discount && (
              <div style={{
                position: 'absolute',
                top: '-10px',
                right: '20px',
                background: 'rgba(255,107,53,0.6)',
                borderRadius: '12px',
                padding: '4px 12px',
                fontSize: '12px',
                fontWeight: 700
              }}>
                {plans['1month'].discount} Off
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  border: `2px solid ${selectedPlan === '1month' ? '#FF6B35' : '#666'}`,
                  background: selectedPlan === '1month' ? '#FF6B35' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {selectedPlan === '1month' && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#fff' }} />}
                </div>
                <span style={{ fontSize: '17px', fontWeight: 600 }}>1 Month</span>
              </div>
              <span style={{ fontSize: '17px', fontWeight: 700 }}>${plans['1month'].price}/mo</span>
            </div>
          </div>
        </div>

        {/* Additional Premium Features */}
        <div style={{
          background: '#1c1c1e',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px'
        }}>
          <h4 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>
            Here's everything else you'll get...
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
            {[
              { icon: '⭐', text: 'Pro Badge on Profile' },
              { icon: '✓', text: 'Read Receipts' },
              { icon: '🙈', text: 'Hide Message Photos' },
              { icon: '⏱️', text: 'Expiring Photos' },
              { icon: '📌', text: 'Pin Conversations' },
              { icon: '🎯', text: 'Priority Support (24hr response)' },
              { icon: '👻', text: 'Incognito Mode' },
              { icon: '🚫', text: 'No Ads' },
              { icon: '📍', text: 'Add Places' },
              { icon: '🌎', text: 'Travel Mode' },
              { icon: '🔓', text: 'Unblock Individual Users' }
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '18px' }}>{item.icon}</span>
                <span style={{ color: '#ddd' }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Total Price */}
        <div style={{
          textAlign: 'center',
          fontSize: '18px',
          fontWeight: 600,
          marginBottom: '24px',
          color: '#aaa'
        }}>
          ${plans[selectedPlan].total} total
          {selectedPlan === 'launch_special' && ' • 1 month'}
          {selectedPlan === '1month' && ' • 1 month'}
          {selectedPlan === '3months' && ' • 3 months'}
          {selectedPlan === '6months' && ' • 6 months'}
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            background: 'rgba(255, 59, 48, 0.15)',
            border: '1px solid rgba(255, 59, 48, 0.5)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '16px',
            color: '#FF3B30',
            fontSize: '14px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          disabled={loading}
          style={{
            width: '100%',
            background: loading ? '#666' : 'linear-gradient(135deg, #FF6B35 0%, #ff8c5a 100%)',
            border: 'none',
            borderRadius: '16px',
            padding: '18px',
            color: '#fff',
            fontSize: '18px',
            fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer',
            marginBottom: '16px',
            transition: 'transform 0.2s',
            opacity: loading ? 0.7 : 1
          }}
          onMouseEnter={(e) => !loading && (e.currentTarget.style.transform = 'scale(1.02)')}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          {loading ? 'Processing...' : 'Continue'}
        </button>

        {/* Auto-Renewal Disclaimer */}
        <div style={{
          fontSize: '12px',
          color: '#888',
          textAlign: 'center',
          lineHeight: 1.6,
          marginBottom: '16px',
          padding: '16px',
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '12px',
          border: '1px solid #333'
        }}>
          <strong style={{ color: '#aaa' }}>Auto-Renewal Notice:</strong> {selectedPlan === 'week' ? (
            'The 1-week plan is a one-time purchase and does not auto-renew.'
          ) : selectedPlan === 'launch_special' ? (
            'The Launch Special is a one-time promotional offer for 1 month of Premium access and does not auto-renew.'
          ) : (
            `Your subscription will automatically renew at $${plans[selectedPlan].total} every ${selectedPlan === '1month' ? 'month' : selectedPlan === '3months' ? '3 months' : '6 months'} unless cancelled at least 24 hours before the renewal date.`
          )}
        </div>

        <div style={{
          fontSize: '11px',
          color: '#666',
          textAlign: 'center',
          lineHeight: 1.5,
          marginBottom: '24px'
        }}>
          You can cancel anytime from your account settings. By subscribing, you agree to our <span style={{ textDecoration: 'underline', cursor: 'pointer', color: '#888' }}>Terms of Service</span> and <span style={{ textDecoration: 'underline', cursor: 'pointer', color: '#888' }}>Privacy Policy</span>.
        </div>

        {/* Fine Print */}
        <div style={{
          fontSize: '10px',
          color: '#666',
          textAlign: 'center',
          lineHeight: 1.4
        }}>
          * You may still see sponsored content from SLTR and its affiliates.
        </div>
      </div>
    </div>
  );
}
