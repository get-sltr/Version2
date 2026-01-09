'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import posthog from 'posthog-js';
import {
  IconInfinity,
  IconTelescope,
  IconGhost,
  IconShield,
  IconGrid,
  IconChat,
  IconEye,
  IconSparkles,
  IconTimer,
  IconLightning,
  IconUndo,
  IconGlobe,
  IconTyping,
  IconAlbums,
  IconDoubleCheck,
  IconBookmark,
  IconVideo,
  IconBadge,
  IconEyeOff,
  IconPin,
  IconHeadset,
  IconLocation,
  IconAirplane,
  IconUnlock,
  IconBack,
  IconClose,
} from '@/components/Icons';

export default function PremiumPage() {
  const router = useRouter();
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
        credentials: 'include',
        body: JSON.stringify({ plan: selectedPlan }),
      });

      const data = await response.json();

      if (response.status === 401) {
        router.push('/login?redirect=/premium');
        return;
      }

      if (response.status === 429) {
        setError('Too many requests. Please wait a moment and try again.');
        return;
      }

      if (!response.ok) {
        setError(data.error || 'Something went wrong. Please try again.');
        return;
      }

      if (data.url) {
        posthog.capture('premium_plan_selected', {
          plan: selectedPlan,
          price: plans[selectedPlan].total,
          price_per_month: plans[selectedPlan].price,
          discount: plans[selectedPlan].discount,
        });
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

  // Highlighted features with icons
  const highlightedFeatures = [
    { icon: IconInfinity, title: 'UNLIMITED', desc: 'Unlocked grid access' },
    { icon: IconTelescope, title: 'DISCOVER', desc: 'See who viewed you' },
    { icon: IconGhost, title: 'INCOGNITO', desc: 'Browse discreetly' },
    { icon: IconShield, title: 'AD-FREE', desc: 'No interruptions' },
  ];

  // All premium features grid
  const allFeatures = [
    { icon: IconGrid, text: 'Unlimited profiles' },
    { icon: IconChat, text: 'Unlimited messaging' },
    { icon: IconEye, text: 'See who viewed you' },
    { icon: IconGhost, text: 'Incognito mode' },
    { icon: IconSparkles, text: 'For You matches' },
    { icon: IconTimer, text: 'Expiring photos' },
    { icon: IconLightning, text: 'Right Now - 100' },
    { icon: IconUndo, text: 'Unsend messages' },
    { icon: IconGlobe, text: 'Message translate' },
    { icon: IconTyping, text: 'Typing status' },
    { icon: IconAlbums, text: 'Multiple albums' },
    { icon: IconEye, text: 'View shared albums' },
    { icon: IconTimer, text: 'Expiring albums' },
    { icon: IconShield, text: 'No 3rd party ads' },
    { icon: IconDoubleCheck, text: 'Read receipts' },
    { icon: IconBookmark, text: 'Saved phrases' },
    { icon: IconVideo, text: 'Premium Video' },
    { icon: IconBadge, text: 'Pro Badge' },
    { icon: IconEyeOff, text: 'Hide photos' },
    { icon: IconPin, text: 'Pin conversations' },
    { icon: IconHeadset, text: 'Priority support' },
    { icon: IconLocation, text: 'Add places' },
    { icon: IconAirplane, text: 'Travel mode' },
    { icon: IconUnlock, text: 'Unblock users' },
  ];

  if (checkingAuth) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            width: '48px',
            height: '48px',
            border: '2px solid rgba(255, 107, 53, 0.3)',
            borderTopColor: '#FF6B35',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}
        />
        <style jsx global>{`
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
      background: '#000',
      color: '#fff',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 0,
          opacity: 0.6,
        }}
      >
        <source src="/Videos/premiumpage.mp4" type="video/mp4" />
      </video>

      {/* Dark overlay for readability */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'linear-gradient(180deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.8) 100%)',
        zIndex: 1,
        pointerEvents: 'none',
      }} />

      {/* Ambient glow effects */}
      <div style={{
        position: 'fixed',
        top: '-20%',
        right: '-10%',
        width: '60%',
        height: '60%',
        background: 'radial-gradient(ellipse, rgba(255, 107, 53, 0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
        filter: 'blur(80px)',
        zIndex: 2,
      }} />
      <div style={{
        position: 'fixed',
        bottom: '-30%',
        left: '-20%',
        width: '70%',
        height: '70%',
        background: 'radial-gradient(ellipse, rgba(255, 140, 90, 0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
        filter: 'blur(100px)',
        zIndex: 2,
      }} />

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(180deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.7) 100%)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        }}
      >
        <motion.button
          whileHover={{ scale: 1.1, boxShadow: '0 0 20px rgba(255, 107, 53, 0.5)' }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.back()}
          style={{
            position: 'relative',
            background: 'rgba(255, 107, 53, 0.1)',
            border: '1px solid rgba(255, 107, 53, 0.3)',
            borderRadius: '10px',
            color: '#FF6B35',
            cursor: 'pointer',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          <IconBack size={24} />
          {/* Reflective shine */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '200%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
            animation: 'buttonShine 2s ease-in-out infinite',
            pointerEvents: 'none',
          }} />
        </motion.button>
        <h1 style={{
          fontSize: '14px',
          fontWeight: 600,
          letterSpacing: '3px',
          textTransform: 'uppercase',
          color: '#fff',
          margin: 0,
          textShadow: '0 0 20px rgba(255, 255, 255, 0.3)',
        }}>
          UPGRADE
        </h1>
        <motion.button
          whileHover={{ scale: 1.1, boxShadow: '0 0 15px rgba(255, 255, 255, 0.3)' }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push('/dashboard')}
          style={{
            position: 'relative',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '10px',
            color: 'rgba(255, 255, 255, 0.7)',
            cursor: 'pointer',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          <IconClose size={20} />
          {/* Reflective shine */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '200%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)',
            animation: 'buttonShine 2.5s ease-in-out infinite',
            pointerEvents: 'none',
          }} />
        </motion.button>
      </motion.header>

      <div style={{
        maxWidth: '520px',
        margin: '0 auto',
        padding: '24px 20px 120px',
        position: 'relative',
        zIndex: 10,
      }}>
        {/* Premium Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '32px',
          }}
        >
          <div style={{
            position: 'relative',
            padding: '14px 48px',
            background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.15) 0%, rgba(255, 140, 90, 0.08) 100%)',
            border: '1px solid rgba(255, 107, 53, 0.4)',
            borderRadius: '40px',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 0 30px rgba(255, 107, 53, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          }}>
            <span style={{
              fontSize: '13px',
              fontWeight: 700,
              letterSpacing: '4px',
              textTransform: 'uppercase',
              background: 'linear-gradient(135deg, #FF6B35 0%, #FFB088 50%, #FFFFFF 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              UNLIMITED
            </span>
            {/* Shine effect */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: '-100%',
              width: '200%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
              animation: 'shine 3s ease-in-out infinite',
              borderRadius: '40px',
              pointerEvents: 'none',
            }} />
          </div>
        </motion.div>

        {/* Highlighted Features - Glass Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '12px',
            marginBottom: '40px',
          }}
        >
          {highlightedFeatures.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
              whileHover={{
                scale: 1.02,
                boxShadow: '0 0 40px rgba(255, 107, 53, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
              }}
              style={{
                position: 'relative',
                padding: '24px 16px',
                background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                backdropFilter: 'blur(20px)',
                textAlign: 'center',
                cursor: 'default',
                overflow: 'hidden',
              }}
            >
              {/* Top shine line */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: '10%',
                right: '10%',
                height: '1px',
                background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.2) 50%, transparent 100%)',
              }} />

              {/* Icon */}
              <div style={{
                marginBottom: '12px',
                color: 'rgba(255, 255, 255, 0.7)',
              }}>
                <feature.icon size={28} />
              </div>

              {/* Title */}
              <div style={{
                fontSize: '12px',
                fontWeight: 600,
                letterSpacing: '2px',
                color: '#fff',
                marginBottom: '4px',
              }}>
                {feature.title}
              </div>

              {/* Description */}
              <div style={{
                fontSize: '11px',
                color: 'rgba(255, 255, 255, 0.45)',
                letterSpacing: '0.5px',
              }}>
                {feature.desc}
              </div>

              {/* Corner accent */}
              <div style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: '40px',
                height: '40px',
                background: 'radial-gradient(circle at bottom right, rgba(255, 107, 53, 0.1) 0%, transparent 70%)',
                pointerEvents: 'none',
              }} />
            </motion.div>
          ))}
        </motion.div>

        {/* All Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          style={{ marginBottom: '40px' }}
        >
          <h3 style={{
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '3px',
            textTransform: 'uppercase',
            color: 'rgba(255, 255, 255, 0.4)',
            marginBottom: '20px',
            textAlign: 'center',
          }}>
            EVERYTHING INCLUDED
          </h3>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '8px',
          }}>
            {allFeatures.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 + i * 0.02, duration: 0.3 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 12px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.04)',
                }}
              >
                <div style={{ color: 'rgba(255, 107, 53, 0.7)', flexShrink: 0 }}>
                  <feature.icon size={16} />
                </div>
                <span style={{
                  fontSize: '12px',
                  color: 'rgba(255, 255, 255, 0.6)',
                  letterSpacing: '0.3px',
                }}>
                  {feature.text}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Plan Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          style={{ marginBottom: '24px' }}
        >
          <h3 style={{
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '3px',
            textTransform: 'uppercase',
            color: 'rgba(255, 255, 255, 0.4)',
            marginBottom: '16px',
            textAlign: 'center',
          }}>
            SELECT YOUR PLAN
          </h3>

          {/* Launch Special */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => setSelectedPlan('launch_special')}
            style={{
              position: 'relative',
              padding: '20px',
              marginBottom: '12px',
              background: selectedPlan === 'launch_special'
                ? 'linear-gradient(135deg, rgba(255, 107, 53, 0.12) 0%, rgba(255, 140, 90, 0.06) 100%)'
                : 'rgba(255, 255, 255, 0.02)',
              border: `1px solid ${selectedPlan === 'launch_special' ? 'rgba(255, 107, 53, 0.5)' : 'rgba(255, 255, 255, 0.06)'}`,
              borderRadius: '14px',
              cursor: 'pointer',
              overflow: 'hidden',
              backdropFilter: 'blur(10px)',
              boxShadow: selectedPlan === 'launch_special' ? '0 0 30px rgba(255, 107, 53, 0.15)' : 'none',
            }}
          >
            {/* Limited badge */}
            <div style={{
              position: 'absolute',
              top: '-1px',
              left: '50%',
              transform: 'translateX(-50%)',
              padding: '6px 16px',
              background: 'linear-gradient(135deg, #FF6B35 0%, #FF8C5A 100%)',
              borderRadius: '0 0 10px 10px',
              fontSize: '9px',
              fontWeight: 700,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              color: '#000',
            }}>
              LIMITED TIME
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '8px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {/* Radio */}
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  border: `2px solid ${selectedPlan === 'launch_special' ? '#FF6B35' : 'rgba(255, 255, 255, 0.3)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                }}>
                  {selectedPlan === 'launch_special' && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        background: '#FF6B35',
                      }}
                    />
                  )}
                </div>
                <div>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#fff',
                    letterSpacing: '0.5px',
                  }}>
                    Launch Special
                  </div>
                  <div style={{
                    fontSize: '11px',
                    color: '#FF6B35',
                    letterSpacing: '0.3px',
                  }}>
                    1 Month Premium
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  color: '#fff',
                }}>
                  $4.99
                </div>
                <div style={{
                  fontSize: '10px',
                  color: 'rgba(255, 255, 255, 0.4)',
                }}>
                  50% off
                </div>
              </div>
            </div>

            {/* Shine animation */}
            {selectedPlan === 'launch_special' && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '200%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%)',
                animation: 'shine 4s ease-in-out infinite',
                pointerEvents: 'none',
              }} />
            )}
          </motion.div>

          {/* Other plans */}
          {[
            { key: 'week', label: '1 Week', price: '$4.99' },
            { key: '6months', label: '6 Months', price: '$5.99/mo', discount: '82%' },
            { key: '3months', label: '3 Months', price: '$7.99/mo', discount: '77%' },
            { key: '1month', label: '1 Month', price: '$9.99/mo', discount: '64%' },
          ].map((plan) => (
            <motion.div
              key={plan.key}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => setSelectedPlan(plan.key as typeof selectedPlan)}
              style={{
                position: 'relative',
                padding: '16px 20px',
                marginBottom: '8px',
                background: selectedPlan === plan.key
                  ? 'rgba(255, 255, 255, 0.05)'
                  : 'rgba(255, 255, 255, 0.02)',
                border: `1px solid ${selectedPlan === plan.key ? 'rgba(255, 107, 53, 0.4)' : 'rgba(255, 255, 255, 0.05)'}`,
                borderRadius: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backdropFilter: 'blur(10px)',
              }}
            >
              {plan.discount && (
                <div style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '16px',
                  padding: '4px 10px',
                  background: 'rgba(255, 107, 53, 0.9)',
                  borderRadius: '8px',
                  fontSize: '10px',
                  fontWeight: 700,
                  color: '#000',
                }}>
                  {plan.discount} OFF
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  border: `2px solid ${selectedPlan === plan.key ? '#FF6B35' : 'rgba(255, 255, 255, 0.25)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                }}>
                  {selectedPlan === plan.key && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: '#FF6B35',
                      }}
                    />
                  )}
                </div>
                <span style={{
                  fontSize: '14px',
                  fontWeight: 500,
                  color: selectedPlan === plan.key ? '#fff' : 'rgba(255, 255, 255, 0.7)',
                }}>
                  {plan.label}
                </span>
              </div>
              <span style={{
                fontSize: '14px',
                fontWeight: 600,
                color: selectedPlan === plan.key ? '#fff' : 'rgba(255, 255, 255, 0.6)',
              }}>
                {plan.price}
              </span>
            </motion.div>
          ))}
        </motion.div>

        {/* Total */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          style={{
            textAlign: 'center',
            marginBottom: '24px',
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 0.5)',
          }}
        >
          <span style={{ fontWeight: 600, color: '#fff' }}>${plans[selectedPlan].total}</span>
          {' total'}
          {selectedPlan === 'launch_special' && ' • 1 month'}
          {selectedPlan === '1month' && ' • 1 month'}
          {selectedPlan === '3months' && ' • 3 months'}
          {selectedPlan === '6months' && ' • 6 months'}
        </motion.div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              padding: '14px 16px',
              marginBottom: '16px',
              background: 'rgba(255, 59, 48, 0.1)',
              border: '1px solid rgba(255, 59, 48, 0.3)',
              borderRadius: '12px',
              color: '#FF3B30',
              fontSize: '13px',
              textAlign: 'center',
            }}
          >
            {error}
          </motion.div>
        )}

        {/* CTA Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          whileHover={{
            scale: 1.03,
            boxShadow: '0 0 60px rgba(255, 107, 53, 0.6), 0 0 100px rgba(255, 140, 90, 0.3), inset 0 2px 0 rgba(255, 255, 255, 0.4)',
          }}
          whileTap={{ scale: 0.98 }}
          onClick={handleContinue}
          disabled={loading}
          style={{
            width: '100%',
            position: 'relative',
            padding: '20px',
            background: loading
              ? 'rgba(255, 255, 255, 0.1)'
              : 'linear-gradient(135deg, rgba(255, 107, 53, 0.3) 0%, rgba(255, 140, 90, 0.2) 50%, rgba(255, 107, 53, 0.3) 100%)',
            border: '1px solid rgba(255, 107, 53, 0.7)',
            borderRadius: '16px',
            color: '#fff',
            fontSize: '14px',
            fontWeight: 700,
            letterSpacing: '3px',
            textTransform: 'uppercase',
            cursor: loading ? 'not-allowed' : 'pointer',
            backdropFilter: 'blur(15px)',
            boxShadow: '0 0 40px rgba(255, 107, 53, 0.35), 0 0 80px rgba(255, 107, 53, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.25), inset 0 -1px 0 rgba(0, 0, 0, 0.2)',
            overflow: 'hidden',
            marginBottom: '20px',
            textShadow: '0 0 15px rgba(255, 255, 255, 0.5)',
          }}
        >
          {/* Top bright edge */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: '5%',
            right: '5%',
            height: '1px',
            background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.6) 25%, rgba(255, 255, 255, 0.9) 50%, rgba(255, 255, 255, 0.6) 75%, transparent 100%)',
          }} />

          {/* Bottom orange glow edge */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: '10%',
            right: '10%',
            height: '1px',
            background: 'linear-gradient(90deg, transparent 0%, rgba(255, 107, 53, 0.6) 50%, transparent 100%)',
          }} />

          <span style={{ position: 'relative', zIndex: 1 }}>
            {loading ? 'PROCESSING...' : 'CONTINUE'}
          </span>

          {/* Primary fast shine */}
          {!loading && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: '-100%',
              width: '200%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 45%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0.2) 55%, transparent 100%)',
              animation: 'buttonShine 2s ease-in-out infinite',
              pointerEvents: 'none',
            }} />
          )}

          {/* Secondary slower orange shine */}
          {!loading && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: '-100%',
              width: '200%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent 0%, rgba(255, 107, 53, 0.15) 50%, transparent 100%)',
              animation: 'buttonShine 3.5s ease-in-out infinite',
              animationDelay: '0.5s',
              pointerEvents: 'none',
            }} />
          )}
        </motion.button>

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.5 }}
          style={{
            padding: '16px',
            background: 'rgba(255, 255, 255, 0.02)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.04)',
            marginBottom: '16px',
          }}
        >
          <div style={{
            fontSize: '11px',
            color: 'rgba(255, 255, 255, 0.4)',
            lineHeight: 1.6,
            textAlign: 'center',
          }}>
            <span style={{ color: 'rgba(255, 255, 255, 0.6)', fontWeight: 500 }}>Auto-Renewal:</span>{' '}
            {selectedPlan === 'week' ? (
              'The 1-week plan is a one-time purchase.'
            ) : selectedPlan === 'launch_special' ? (
              'This is a one-time promotional offer.'
            ) : (
              `Renews at $${plans[selectedPlan].total} every ${selectedPlan === '1month' ? 'month' : selectedPlan === '3months' ? '3 months' : '6 months'}.`
            )}
          </div>
        </motion.div>

        <div style={{
          fontSize: '10px',
          color: 'rgba(255, 255, 255, 0.3)',
          textAlign: 'center',
          lineHeight: 1.5,
        }}>
          Cancel anytime from account settings. By subscribing, you agree to our{' '}
          <span style={{ textDecoration: 'underline', cursor: 'pointer', color: 'rgba(255, 255, 255, 0.5)' }}>Terms</span>
          {' & '}
          <span style={{ textDecoration: 'underline', cursor: 'pointer', color: 'rgba(255, 255, 255, 0.5)' }}>Privacy Policy</span>.
        </div>
      </div>

      {/* Global styles for animations */}
      <style jsx global>{`
        @keyframes shine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
