'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import {
  getOfferings,
  purchasePackage,
  restorePurchases,
  isNativePlatform,
} from '@/lib/revenuecat';
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
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isNative, setIsNative] = useState(false);

  useEffect(() => {
    setIsNative(isNativePlatform());
  }, []);

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

  const handleSubscribe = async () => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/premium');
      return;
    }

    if (!isNative) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      posthog.capture('premium_subscribe_tapped', { plan: 'primal_pro_monthly' });

      const offerings = await getOfferings();
      console.log('[Premium] Offerings received:', JSON.stringify(offerings, null, 2));
      if (!offerings?.current) {
        setError(`Unable to load subscription. Offerings: ${offerings ? 'exists but no current' : 'null'}`);
        setLoading(false);
        return;
      }

      // Get the monthly package from the current offering
      const monthlyPackage = offerings.current.monthly
        ?? offerings.current.availablePackages?.[0];

      if (!monthlyPackage) {
        setError('Subscription not available. Please try again later.');
        setLoading(false);
        return;
      }

      const result = await purchasePackage(monthlyPackage);

      if (result.success) {
        posthog.capture('premium_subscribed', { plan: 'primal_pro_monthly' });
        setSuccess('Welcome to Primal Pro!');
        setTimeout(() => router.push('/dashboard'), 1500);
      } else if (result.error === 'Purchase cancelled') {
        // User cancelled — do nothing
      } else {
        setError(result.error || 'Purchase failed. Please try again.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    setRestoring(true);
    setError(null);

    try {
      posthog.capture('premium_restore_tapped');
      const result = await restorePurchases();

      if (result.success && result.customerInfo) {
        const hasActive = Object.keys(result.customerInfo.entitlements.active).length > 0;
        if (hasActive) {
          posthog.capture('premium_restored');
          setSuccess('Purchases restored! Welcome back.');
          setTimeout(() => router.push('/dashboard'), 1500);
        } else {
          setError('No active subscriptions found.');
        }
      } else {
        setError(result.error || 'Could not restore purchases.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setRestoring(false);
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
          PRIMAL PRO
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

              <div style={{ marginBottom: '12px', color: 'rgba(255, 255, 255, 0.7)' }}>
                <feature.icon size={28} />
              </div>

              <div style={{
                fontSize: '12px',
                fontWeight: 600,
                letterSpacing: '2px',
                color: '#fff',
                marginBottom: '4px',
              }}>
                {feature.title}
              </div>

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

        {/* Price Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          style={{
            position: 'relative',
            padding: '28px 24px',
            marginBottom: '20px',
            background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.12) 0%, rgba(255, 140, 90, 0.06) 100%)',
            border: '1px solid rgba(255, 107, 53, 0.4)',
            borderRadius: '16px',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 0 30px rgba(255, 107, 53, 0.15)',
            textAlign: 'center',
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
            background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%)',
          }} />

          <div style={{
            fontSize: '13px',
            fontWeight: 600,
            letterSpacing: '3px',
            textTransform: 'uppercase',
            color: '#FF6B35',
            marginBottom: '12px',
          }}>
            PRIMAL PRO
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'center',
            gap: '4px',
            marginBottom: '8px',
          }}>
            <span style={{
              fontSize: '36px',
              fontWeight: 700,
              color: '#fff',
              lineHeight: 1,
            }}>
              $12.99
            </span>
            <span style={{
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.5)',
              fontWeight: 400,
            }}>
              /month
            </span>
          </div>

          <div style={{
            fontSize: '12px',
            color: 'rgba(255, 255, 255, 0.4)',
          }}>
            Cancel anytime
          </div>

          {/* Shine animation */}
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

        {/* Success */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              padding: '14px 16px',
              marginBottom: '16px',
              background: 'rgba(52, 199, 89, 0.1)',
              border: '1px solid rgba(52, 199, 89, 0.3)',
              borderRadius: '12px',
              color: '#34C759',
              fontSize: '13px',
              textAlign: 'center',
            }}
          >
            {success}
          </motion.div>
        )}

        {/* CTA Button — Native: Subscribe / Web: Download prompt */}
        {isNative ? (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            whileHover={{
              scale: 1.03,
              boxShadow: '0 0 60px rgba(255, 107, 53, 0.6), 0 0 100px rgba(255, 140, 90, 0.3), inset 0 2px 0 rgba(255, 255, 255, 0.4)',
            }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubscribe}
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
              marginBottom: '12px',
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
              {loading ? 'PROCESSING...' : 'SUBSCRIBE'}
            </span>

            {/* Shine animation */}
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
          </motion.button>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            style={{
              width: '100%',
              padding: '20px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              textAlign: 'center',
              marginBottom: '12px',
            }}
          >
            <div style={{
              fontSize: '14px',
              fontWeight: 600,
              color: '#fff',
              marginBottom: '6px',
            }}>
              Download the app to subscribe
            </div>
            <div style={{
              fontSize: '12px',
              color: 'rgba(255, 255, 255, 0.4)',
            }}>
              Primal Pro is available via in-app purchase on iOS
            </div>
          </motion.div>
        )}

        {/* Restore Purchases — native only */}
        {isNative && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            onClick={handleRestore}
            disabled={restoring}
            style={{
              width: '100%',
              padding: '14px',
              background: 'transparent',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.5)',
              fontSize: '13px',
              fontWeight: 500,
              cursor: restoring ? 'not-allowed' : 'pointer',
              marginBottom: '24px',
            }}
          >
            {restoring ? 'Restoring...' : 'Restore Purchases'}
          </motion.button>
        )}

        {/* Disclaimer — Apple Schedule 2 required language */}
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
            Subscription automatically renews at $12.99/month unless cancelled.
            <span style={{ display: 'block', marginTop: '8px' }}>
              Payment will be charged to your Apple ID account at confirmation of purchase.
              Subscription automatically renews unless auto-renew is turned off at least
              24 hours before the end of the current period. Your account will be charged
              for renewal within 24 hours prior to the end of the current period.
            </span>
          </div>
        </motion.div>

        {/* Terms & Privacy */}
        <div style={{
          fontSize: '10px',
          color: 'rgba(255, 255, 255, 0.3)',
          textAlign: 'center',
          lineHeight: 1.5,
        }}>
          Manage and cancel subscriptions in your App Store account settings. By subscribing, you agree to our{' '}
          <a href="/terms" style={{ textDecoration: 'underline', color: 'rgba(255, 255, 255, 0.5)' }}>Terms of Service</a>
          {' & '}
          <a href="/privacy" style={{ textDecoration: 'underline', color: 'rgba(255, 255, 255, 0.5)' }}>Privacy Policy</a>.
        </div>
      </div>

      {/* Global styles for animations */}
      <style jsx global>{`
        @keyframes shine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes buttonShine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
